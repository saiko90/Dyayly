import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function POST(req: Request) {
  try {
    const { code, email } = await req.json();

    if (!code || !email) {
      return NextResponse.json({ error: 'Code et email requis.' }, { status: 400 });
    }

    const supabase = getAdminClient();
    const normalizedCode = code.toUpperCase().trim();

    // 1. Le code existe-t-il ?
    const { data: promo } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', normalizedCode)
      .single();

    if (!promo) {
      return NextResponse.json({ error: "Ce code promo n'existe pas." }, { status: 404 });
    }

    // 2. Est-il actif ?
    if (promo.is_active === false) {
      return NextResponse.json({ error: "Ce code promo n'est plus valide." }, { status: 400 });
    }

    // 3. Déjà utilisé sur une commande PAYÉE par cet email ?
    const { data: usedOrders } = await supabase
      .from('orders')
      .select('id')
      .eq('user_email', email)
      .eq('promo_code', normalizedCode)
      .eq('status', 'paid');

    if (usedOrders && usedOrders.length > 0) {
      return NextResponse.json({ error: 'Vous avez déjà utilisé ce code promo.' }, { status: 400 });
    }

    // 4. Tout est bon
    return NextResponse.json({ percentage: promo.percentage, code: promo.code }, { status: 200 });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erreur serveur.' }, { status: 500 });
  }
}
