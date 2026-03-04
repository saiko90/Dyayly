import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || 're_123456');

export async function POST(req: Request) {
  try {
    const { subject, message, emails } = await req.json();

    if (!emails || emails.length === 0) {
      return NextResponse.json({ error: 'Aucun email fourni' }, { status: 400 });
    }

    // Limite de développement Resend (on envoie à soi-même ou au premier mail pour tester)
    // En production, vous pouvez utiliser resend.batch.send([]) pour envoyer à toute la liste
    const { data, error } = await resend.emails.send({
      from: 'Dyayly <onboarding@resend.dev>', // Modifiez avec votre nom de domaine vérifié (ex: hello@dyayly.ch)
      to: emails,
      subject: subject || 'Des nouvelles de Dyayly',
      html: `<div style="font-family: sans-serif; padding: 20px; color: #1c1917;">
              <h1 style="color: #d8b4fe; font-style: italic;">Dyayly</h1>
              <p>${message.replace(/\n/g, '<br/>')}</p>
              <br/>
              <p style="font-size: 10px; color: #a8a29e;">L'amour tissé en bijoux</p>
            </div>`,
    });

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}