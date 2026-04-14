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

    // 1. Sécuriser l'ID — arrêt immédiat si absent
    if (!orderId) {
      console.error('[webhook] ❌ order_id absent des metadata Stripe. Session:', session.id);
      return NextResponse.json({ error: 'Pas order_id' }, { status: 400 });
    }

    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      );

      // 2. UPDATE + SELECT en une seule requête — vérifie que la ligne a bien été modifiée
      const { data: updatedOrder, error: updateError } = await supabaseAdmin
        .from('orders')
        .update({
          status:            'paid',
          stripe_session_id: session.id,
        })
        .eq('id', orderId)
        .select()
        .single();

      if (updateError || !updatedOrder) {
        return NextResponse.json({
          error:                  'Échec de la mise à jour Supabase',
          id_recherche:           orderId,
          type_de_id:             typeof orderId,
          erreur_supabase_brute:  updateError,
          cle_admin_existe:       !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        }, { status: 500 });
      }

      console.log('[webhook] ✓ Commande', orderId, 'passée en paid.');

      // 3. Emails uniquement si l'UPDATE a réussi
      await Promise.all([
        sendInvoiceEmail(updatedOrder, session),
        sendAdminAlert(updatedOrder),
      ]);

    } catch (err: any) {
      console.error('[webhook] Erreur traitement:', err.message);
    }
  }

  return NextResponse.json({ received: true });
}

// ── Alerte e-mail administrateur ─────────────────────────────────────────────
async function sendAdminAlert(order: any) {
  const orderRef  = order.id?.slice(0, 8).toUpperCase() ?? '????????';
  const total     = (order.total_price ?? 0).toFixed(2);
  const client    = [order.full_name, order.user_email].filter(Boolean).join(' — ');
  const dashUrl   = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://dyayly.ch'}/admin`;

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head><meta charset="UTF-8" /></head>
    <body style="margin:0; padding:0; background:#F5F3FF; font-family: sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F3FF; padding:32px 16px;">
        <tr><td align="center">
          <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:20px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,0.07);">

            <tr>
              <td style="background:#7C3AED; padding:28px 36px; text-align:center;">
                <p style="margin:0; color:#ffffff; font-size:28px;">🔔</p>
                <h1 style="margin:8px 0 0; color:#ffffff; font-size:20px; font-weight:600; letter-spacing:0.05em;">
                  Nouvelle commande reçue !
                </h1>
              </td>
            </tr>

            <tr>
              <td style="padding:32px 36px;">
                <p style="margin:0 0 20px; color:#4B2D0F; font-size:17px; line-height:1.7;">
                  Bravo Stefanie ! 🎉<br/>
                  Une nouvelle commande vient d'être validée et le paiement est confirmé.
                </p>

                <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F3FF; border-radius:12px; padding:20px; margin-bottom:24px;">
                  <tr>
                    <td style="color:#6D28D9; font-size:11px; text-transform:uppercase; letter-spacing:0.2em; padding-bottom:16px; font-weight:600;">
                      Détails de la commande
                    </td>
                  </tr>
                  <tr>
                    <td style="color:#5D4037; font-size:14px; padding:4px 0;">
                      <strong>Référence :</strong> #${orderRef}
                    </td>
                  </tr>
                  <tr>
                    <td style="color:#5D4037; font-size:14px; padding:4px 0;">
                      <strong>Montant :</strong> ${total} CHF
                    </td>
                  </tr>
                  <tr>
                    <td style="color:#5D4037; font-size:14px; padding:4px 0;">
                      <strong>Client :</strong> ${client}
                    </td>
                  </tr>
                  ${order.city ? `<tr><td style="color:#5D4037; font-size:14px; padding:4px 0;"><strong>Livraison :</strong> ${order.city}</td></tr>` : ''}
                </table>

                <p style="margin:0 0 24px; color:#7A4E2D; font-size:14px; line-height:1.7;">
                  Connecte-toi à ton dashboard pour voir la commande complète et préparer le colis avec amour. 📦✨
                </p>

                <div style="text-align:center;">
                  <a href="${dashUrl}"
                    style="display:inline-block; padding:14px 36px; background:#E9D5FF; color:#5D4037; text-decoration:none; border-radius:50px; font-size:12px; letter-spacing:0.2em; text-transform:uppercase; font-weight:700;">
                    Ouvrir le dashboard
                  </a>
                </div>
              </td>
            </tr>

            <tr>
              <td style="background:#FDFBF7; padding:16px 36px; text-align:center; border-top:1px solid #EDE8E0;">
                <p style="margin:0; font-size:10px; color:#5D4037; letter-spacing:0.2em; text-transform:uppercase;">
                  Dyayly — Valleyres-sous-montagny, Suisse
                </p>
              </td>
            </tr>

          </table>
        </td></tr>
      </table>
    </body>
    </html>
  `;

  await resend.emails.send({
    from: 'Dyayly Boutique <contact@dyayly.ch>',
    to:   ['contact@dyayly.ch'],
    subject: `🔔 Nouvelle commande reçue ! (#${orderRef})`,
    html,
  });
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
                <td style="background: linear-gradient(135deg, #EDE9FE, #DDD6FE); padding: 48px 40px; text-align: center;">
                  <h1 style="margin:0; color:#5D4037; font-size:36px; font-style:italic; font-weight:400; letter-spacing:0.05em;">
                    Dyayly
                  </h1>
                  <p style="margin:10px 0 0; color:rgba(93,64,55,0.65); font-size:11px; letter-spacing:0.3em; text-transform:uppercase; font-family: sans-serif;">
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
                <td style="background:#FDFBF7; padding:24px 48px; text-align:center; border-top: 1px solid #EDE8E0;">
                  <p style="margin:0; font-size:10px; color:#5D4037; letter-spacing:0.25em; text-transform:uppercase; font-family: sans-serif;">
                    Dyayly — Valleyres-sous-montagny, Suisse · contact@dyayly.ch
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
