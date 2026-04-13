import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
});

export async function POST(req: Request) {
  try {
    const { items, orderId, customerNote, shippingCost, country, promoCode, promoPercentage } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Panier vide' }, { status: 400 });
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item: any) => ({
      price_data: {
        currency: 'chf',
        product_data: {
          name: item.title,
          ...(item.variantLabel ? { description: `${item.variantLabel} : ${item.variantValue}` } : {}),
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    // Frais de port dynamiques (gratuits si shippingCost === 0)
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

    // Coupon Stripe si code promo valide
    let discounts: Stripe.Checkout.SessionCreateParams.Discount[] = [];
    if (promoCode && promoPercentage && promoPercentage > 0) {
      const coupon = await stripe.coupons.create({
        percent_off: promoPercentage,
        duration: 'once',
        name: promoCode,
      });
      discounts = [{ coupon: coupon.id }];
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'twint'],
      line_items: lineItems,
      mode: 'payment',
      ...(discounts.length > 0 ? { discounts } : {}),
      success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${siteUrl}/checkout`,
      metadata: {
        order_id:      orderId      || '',
        customer_note: customerNote || '',
        promo_code:    promoCode    || '',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
