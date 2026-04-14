import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email manquant' }, { status: 400 });
    }

    // ── Insertion dans la table subscribers (client admin → bypass RLS) ──
    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );

    const { error: dbError } = await supabase
      .from('subscribers')
      .insert([{ email }]);

    if (dbError) {
      // Code 23505 = violation de contrainte UNIQUE → doublon, on bloque tout
      if (dbError.code === '23505') {
        return NextResponse.json({ error: 'already_subscribed' }, { status: 400 });
      }
      // Autre erreur inattendue → on bloque aussi par sécurité
      console.error('Supabase subscribers insert error:', dbError.message);
      return NextResponse.json({ error: 'Erreur lors de l\'inscription.' }, { status: 500 });
    }

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

                <!-- Body -->
                <tr>
                  <td style="padding: 48px 48px 32px;">
                    <h2 style="margin:0 0 16px; color:#5C3D1E; font-size:24px; font-weight:400; font-style:italic;">
                      Bienvenue dans l'univers Dyayly ✨
                    </h2>
                    <p style="margin:0 0 24px; color:#7A4E2D; font-size:16px; line-height:1.8; font-family: sans-serif;">
                      Merci de rejoindre notre communauté. Vous êtes maintenant parmi les premières à être informées des nouvelles créations, des ateliers et des moments féeriques que nous préparons.
                    </p>
                    <p style="margin:0 0 32px; color:#7A4E2D; font-size:16px; line-height:1.8; font-family: sans-serif;">
                      Pour vous accueillir, voici un cadeau de bienvenue :
                    </p>

                    <!-- Code promo -->
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background: linear-gradient(135deg, #FAF5FF, #EDE9FE); border: 2px dashed #C084FC; border-radius: 16px; padding: 32px; text-align: center;">
                          <p style="margin:0 0 8px; color:#A67C52; font-size:11px; letter-spacing:0.3em; text-transform:uppercase; font-family: sans-serif;">
                            Votre code de bienvenue
                          </p>
                          <p style="margin:0 0 12px; color:#5C3D1E; font-size:36px; font-family: 'Courier New', monospace; font-weight:700; letter-spacing:0.15em;">
                            BIENVENUE15
                          </p>
                          <p style="margin:0; color:#8B5E3C; font-size:15px; font-family: sans-serif;">
                            <strong>−15%</strong> sur votre première commande
                          </p>
                        </td>
                      </tr>
                    </table>

                    <p style="margin:32px 0 0; color:#7A4E2D; font-size:14px; line-height:1.8; font-family: sans-serif;">
                      Ce code est valable une seule fois et peut être utilisé dès aujourd'hui dans la boutique. Il suffit de le saisir au moment du paiement.
                    </p>
                  </td>
                </tr>

                <!-- CTA -->
                <tr>
                  <td style="padding: 0 48px 48px; text-align: center;">
                    <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://dyayly.ch'}/boutique"
                      style="display:inline-block; padding: 16px 40px; background: #C084FC; color: #ffffff; text-decoration:none; border-radius:50px; font-size:12px; letter-spacing:0.2em; text-transform:uppercase; font-family: sans-serif; font-weight:600;">
                      Découvrir la boutique
                    </a>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#FDFBF7; padding:24px 48px; text-align:center; border-top: 1px solid #EDE8E0;">
                    <p style="margin:0; font-size:10px; color:#5D4037; letter-spacing:0.25em; text-transform:uppercase; font-family: sans-serif;">
                      Dyayly — Valleyres-sous-montagny, Suisse
                    </p>
                    <p style="margin:8px 0 0; font-size:10px; color:#8B6E63; font-family: sans-serif;">
                      Vous recevez cet email car vous venez de vous inscrire à la newsletter Dyayly.
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

    const { data, error } = await resend.emails.send({
      from: 'Dyayly <contact@dyayly.ch>',
      to: [email],
      subject: 'Bienvenue chez Dyayly — votre cadeau de bienvenue ✨',
      html,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
