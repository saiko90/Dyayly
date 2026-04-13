import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Resend } from 'resend';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
});
const resend = new Resend(process.env.RESEND_API_KEY);

// Next.js App Router — désactiver le body parsing pour vérifier la signature Stripe
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Webhook non configuré' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err: any) {
    console.error('Webhook signature invalide:', err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.order_id;

    if (!orderId) {
      return NextResponse.json({ received: true });
    }

    try {
      const { supabase } = await import('@/lib/supabase');

      // 1. Récupérer la commande complète
      const { data: order, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (fetchError || !order) {
        console.error('Commande introuvable:', orderId);
        return NextResponse.json({ received: true });
      }

      // 2. Mettre à jour le statut → 'paid'
      await supabase
        .from('orders')
        .update({
          status: 'paid',
          stripe_session_id: session.id,
        })
        .eq('id', orderId);

      // 3. Générer et envoyer la facture par email
      await sendInvoiceEmail(order, session);

    } catch (err: any) {
      console.error('Erreur traitement webhook:', err.message);
    }
  }

  return NextResponse.json({ received: true });
}

// ── Génération de la facture HTML ───────────────────────────────────────────
async function sendInvoiceEmail(order: any, session: Stripe.Checkout.Session) {
  const items: Array<{ title: string; quantity: number; price: number }> = order.items || [];

  const itemsRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #EDE8E0; color: #5C3D1E; font-family: sans-serif; font-size: 14px;">
          ${item.title}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #EDE8E0; color: #8B5E3C; font-family: sans-serif; font-size: 14px; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #EDE8E0; color: #5C3D1E; font-family: sans-serif; font-size: 14px; text-align: right;">
          ${(item.price * item.quantity).toFixed(2)} CHF
        </td>
      </tr>`
    )
    .join('');

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const discountAmount = order.discount_amount || 0;
  const shippingCost = order.shipping_cost || 0;
  const total = order.total_price || subtotal - discountAmount + shippingCost;

  const discountRow =
    discountAmount > 0
      ? `<tr>
          <td colspan="2" style="padding: 8px 0; color: #5A8A5A; font-family: sans-serif; font-size: 14px;">
            Remise (${order.promo_code || 'code promo'})
          </td>
          <td style="padding: 8px 0; color: #5A8A5A; font-family: sans-serif; font-size: 14px; text-align: right;">
            −${discountAmount.toFixed(2)} CHF
          </td>
        </tr>`
      : '';

  const shippingRow =
    shippingCost > 0
      ? `<tr>
          <td colspan="2" style="padding: 8px 0; color: #8B5E3C; font-family: sans-serif; font-size: 14px;">
            Frais de port
          </td>
          <td style="padding: 8px 0; color: #8B5E3C; font-family: sans-serif; font-size: 14px; text-align: right;">
            ${shippingCost.toFixed(2)} CHF
          </td>
        </tr>`
      : `<tr>
          <td colspan="2" style="padding: 8px 0; color: #5A8A5A; font-family: sans-serif; font-size: 14px;">
            Livraison
          </td>
          <td style="padding: 8px 0; color: #5A8A5A; font-family: sans-serif; font-size: 14px; text-align: right;">
            Gratuite ✓
          </td>
        </tr>`;

  const invoiceDate = new Date().toLocaleDateString('fr-CH', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
    <body style="margin:0; padding:0; background:#FDFBF7; font-family: Georgia, serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#FDFBF7; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:24px; overflow:hidden; box-shadow: 0 4px 40px rgba(0,0,0,0.06);">

              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #7A4E2D, #C4956A); padding: 48px 40px; text-align: center;">
                  <h1 style="margin:0; color:#FFF8F0; font-size:36px; font-style:italic; font-weight:400; letter-spacing:0.05em;">
                    Dyayly
                  </h1>
                  <p style="margin:10px 0 0; color:rgba(255,248,240,0.75); font-size:11px; letter-spacing:0.3em; text-transform:uppercase; font-family: sans-serif;">
                    L'amour tissé en bijoux
                  </p>
                </td>
              </tr>

              <!-- Confirmation -->
              <tr>
                <td style="padding: 40px 48px 0;">
                  <h2 style="margin:0 0 8px; color:#5C3D1E; font-size:22px; font-weight:400; font-style:italic;">
                    Merci pour votre commande, ${order.full_name || 'chère cliente'} ✨
                  </h2>
                  <p style="margin:0; color:#8B5E3C; font-size:13px; font-family: sans-serif;">
                    Reçu le ${invoiceDate} · Commande #${order.id?.slice(0, 8).toUpperCase()}
                  </p>
                </td>
              </tr>

              <!-- Adresse de livraison -->
              <tr>
                <td style="padding: 24px 48px 0;">
                  <p style="margin:0 0 4px; color:#A67C52; font-size:10px; letter-spacing:0.25em; text-transform:uppercase; font-family: sans-serif;">
                    Livraison à
                  </p>
                  <p style="margin:0; color:#5C3D1E; font-size:14px; line-height:1.7; font-family: sans-serif;">
                    ${order.full_name}<br/>
                    ${order.address}<br/>
                    ${order.postal_code ? order.postal_code + ' ' : ''}${order.city}
                  </p>
                </td>
              </tr>

              <!-- Tableau articles -->
              <tr>
                <td style="padding: 32px 48px 0;">
                  <p style="margin:0 0 12px; color:#A67C52; font-size:10px; letter-spacing:0.25em; text-transform:uppercase; font-family: sans-serif;">
                    Détail de votre commande
                  </p>
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <thead>
                      <tr>
                        <th style="text-align:left; color:#C4956A; font-size:11px; font-weight:600; letter-spacing:0.15em; text-transform:uppercase; font-family: sans-serif; padding-bottom:8px; border-bottom: 2px solid #EDE8E0;">
                          Article
                        </th>
                        <th style="text-align:center; color:#C4956A; font-size:11px; font-weight:600; letter-spacing:0.15em; text-transform:uppercase; font-family: sans-serif; padding-bottom:8px; border-bottom: 2px solid #EDE8E0;">
                          Qté
                        </th>
                        <th style="text-align:right; color:#C4956A; font-size:11px; font-weight:600; letter-spacing:0.15em; text-transform:uppercase; font-family: sans-serif; padding-bottom:8px; border-bottom: 2px solid #EDE8E0;">
                          Prix
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      ${itemsRows}
                    </tbody>
                    <tfoot>
                      <tr><td colspan="3" style="height:8px;"></td></tr>
                      <tr>
                        <td colspan="2" style="padding: 8px 0; color: #8B5E3C; font-family: sans-serif; font-size: 14px;">
                          Sous-total
                        </td>
                        <td style="padding: 8px 0; color: #8B5E3C; font-family: sans-serif; font-size: 14px; text-align: right;">
                          ${subtotal.toFixed(2)} CHF
                        </td>
                      </tr>
                      ${discountRow}
                      ${shippingRow}
                      <tr>
                        <td colspan="3" style="padding-top: 12px; border-top: 2px solid #5C3D1E;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="color: #5C3D1E; font-size: 18px; font-style: italic; font-weight: 400;">
                                Total
                              </td>
                              <td style="text-align: right; color: #5C3D1E; font-size: 24px; font-style: italic;">
                                ${total.toFixed(2)} CHF
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </td>
              </tr>

              ${order.customer_note ? `
              <!-- Note client -->
              <tr>
                <td style="padding: 24px 48px 0;">
                  <p style="margin:0 0 4px; color:#A67C52; font-size:10px; letter-spacing:0.25em; text-transform:uppercase; font-family: sans-serif;">
                    Votre commentaire
                  </p>
                  <p style="margin:0; color:#7A4E2D; font-size:14px; font-style:italic; line-height:1.7; font-family: Georgia, serif;">
                    « ${order.customer_note} »
                  </p>
                </td>
              </tr>` : ''}

              <!-- Message -->
              <tr>
                <td style="padding: 32px 48px 40px;">
                  <p style="margin:0; color:#7A4E2D; font-size:14px; line-height:1.8; font-family: sans-serif;">
                    Votre commande est en cours de préparation avec soin et amour. Vous recevrez une notification dès qu'elle sera expédiée. 🌸
                  </p>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background:#F9F5F0; padding:24px 48px; text-align:center; border-top: 1px solid #EDE8E0;">
                  <p style="margin:0; font-size:10px; color:#A67C52; letter-spacing:0.25em; text-transform:uppercase; font-family: sans-serif;">
                    Dyayly — Genève, Suisse · contact@dyayly.ch
                  </p>
                </td>
              </tr>

            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await resend.emails.send({
    from: 'Dyayly <contact@dyayly.ch>',
    to: [order.user_email],
    subject: `✨ Votre commande Dyayly est confirmée — #${order.id?.slice(0, 8).toUpperCase()}`,
    html,
  });
}
