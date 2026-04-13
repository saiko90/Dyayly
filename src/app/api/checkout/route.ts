import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
});

// Client admin Supabase — contourne le RLS, uniquement côté serveur
function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function POST(req: Request) {
  try {
    const {
      // Données de commande
      userEmail, fullName, address, city, postalCode, country,
      items, totalPrice, shippingCost, discountAmount, promoCode, customerNote,
      // Paramètres Stripe
      promoPercentage,
    } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Panier vide' }, { status: 400 });
    }
    if (!userEmail || !fullName || !address || !city) {
      return NextResponse.json({ error: 'Données de livraison incomplètes.' }, { status: 400 });
    }

    const supabase = getAdminClient();

    // ── 1. Tracking ────────────────────────────────────────────────────
    await supabase
      .from('analytics')
      .insert([{ event_type: 'order', page_path: '/checkout' }]);

    // ── 2. Insertion commande (service role → bypass RLS) ──────────────
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_email:      userEmail,
        full_name:       fullName,
        address,
        city,
        postal_code:     postalCode  || null,
        country:         country     || 'CH',
        items,
        total_price:     totalPrice,
        shipping_cost:   shippingCost,
        discount_amount: discountAmount || 0,
        promo_code:      promoCode    || null,
        customer_note:   customerNote || null,
        status:          'pending',
      }])
      .select('id')
      .single();

    if (orderError) {
      console.error('Supabase order insert error:', orderError);
      return NextResponse.json({ error: 'Impossible de créer la commande.' }, { status: 500 });
    }

    // ── 3. Line items Stripe ───────────────────────────────────────────
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item: any) => ({
      price_data: {
        currency: 'chf',
        product_data: {
          name: item.title,
          ...(item.selectedVariants && Object.keys(item.selectedVariants).length > 0
            ? { description: Object.entries(item.selectedVariants).map(([k, v]) => `${k}: ${v}`).join(' · ') }
            : {}),
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const shippingCHF = typeof shippingCost === 'number' ? shippingCost : 5;
    if (shippingCHF > 0) {
      const zoneLabel = country === 'CH' ? 'Suisse' : country === 'EU' ? 'Europe' : 'Hors UE';
      lineItems.push({
        price_data: {
          currency: 'chf',
          product_data: { name: `Frais de port (${zoneLabel})` },
          unit_amount: Math.round(shippingCHF * 100),
        },
        quantity: 1,
      });
    }

    // ── 4. Coupon Stripe si code promo ─────────────────────────────────
    let discounts: Stripe.Checkout.SessionCreateParams.Discount[] = [];
    if (promoCode && promoPercentage && promoPercentage > 0) {
      const coupon = await stripe.coupons.create({
        percent_off: promoPercentage,
        duration:    'once',
        name:        promoCode,
      });
      discounts = [{ coupon: coupon.id }];
    }

    // ── 5. Session Stripe ──────────────────────────────────────────────
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'twint'],
      line_items:           lineItems,
      mode:                 'payment',
      customer_email:       userEmail,
      ...(discounts.length > 0 ? { discounts } : {}),
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${siteUrl}/checkout`,
      metadata: {
        order_id:      orderData.id,
        customer_note: customerNote || '',
        promo_code:    promoCode    || '',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: error.message || 'Erreur serveur' }, { status: 500 });
  }
}
