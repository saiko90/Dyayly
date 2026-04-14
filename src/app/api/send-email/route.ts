import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { subject, message, imageUrl, emails } = await req.json();

    if (!emails || emails.length === 0) {
      return NextResponse.json({ error: 'Aucun email fourni' }, { status: 400 });
    }

    const imageBlock = imageUrl
      ? `<div style="margin: 24px 0; text-align: center;">
           <img
             src="${imageUrl}"
             alt="Dyayly"
             style="max-width: 100%; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);"
           />
         </div>`
      : '';

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
                  <td style="background: linear-gradient(135deg, #EDE9FE, #DDD6FE); padding: 40px; text-align: center;">
                    <h1 style="margin:0; color:#5D4037; font-size:32px; font-style:italic; font-weight:400; letter-spacing:0.05em;">
                      Dyayly
                    </h1>
                    <p style="margin:8px 0 0; color:rgba(93,64,55,0.65); font-size:11px; letter-spacing:0.3em; text-transform:uppercase; font-family: sans-serif;">
                      L'amour tissé en bijoux
                    </p>
                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding: 40px 48px;">
                    ${imageBlock}
                    <div style="color: #5C3D1E; font-size: 16px; line-height: 1.8; white-space: pre-line;">
                      ${message.replace(/\n/g, '<br/>')}
                    </div>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background:#FDFBF7; padding:24px 48px; text-align:center; border-top: 1px solid #EDE8E0;">
                    <p style="margin:0; font-size:10px; color:#5D4037; letter-spacing:0.25em; text-transform:uppercase; font-family: sans-serif;">
                      Dyayly — Valleyres-sous-montagny, Suisse
                    </p>
                    <p style="margin:8px 0 0; font-size:10px; color:#8B6E63; font-family: sans-serif;">
                      Vous recevez cet email car vous êtes inscrit(e) à la liste Dyayly.
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
      to: emails,
      subject: subject || 'Des nouvelles de Dyayly',
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
