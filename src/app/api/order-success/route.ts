import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get('session_id');

  if (!sessionId) {
    return NextResponse.json({ error: 'session_id manquant' }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const orderId   = session.metadata?.order_id || null;
    const firstName = session.customer_details?.name?.split(' ')[0] || null;
    const email     = session.customer_details?.email || null;

    // Récupération du numéro court de commande depuis Supabase
    let orderRef: string | null = null;
    if (orderId) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
      );
      const { data } = await supabase
        .from('orders')
        .select('id')
        .eq('id', orderId)
        .single();
      if (data) orderRef = data.id.slice(0, 8).toUpperCase();
    }

    return NextResponse.json({ firstName, email, orderRef });
  } catch (err: any) {
    // On ne bloque pas la page success si Stripe échoue
    return NextResponse.json({ firstName: null, email: null, orderRef: null });
  }
}
