import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: Request) {
  try {
    const { code, email } = await req.json();

    if (!code) {
      return NextResponse.json({ error: 'Code manquant.' }, { status: 400 });
    }
    if (!email) {
      return NextResponse.json({ error: 'Veuillez saisir votre e-mail pour tester un code.' }, { status: 400 });
    }

    // ── 1. Le code existe-t-il ? ──────────────────────────────────────
    const { data: promo, error: promoError } = await supabaseAdmin
      .from('promo_codes')
      .select('code, percentage, is_active')
      .ilike('code', code.trim())
      .single();

    if (promoError || !promo) {
      return NextResponse.json({ error: "Ce code promo n'existe pas." }, { status: 404 });
    }

    // ── 2. Est-il actif ? ─────────────────────────────────────────────
    if (promo.is_active === false) {
      return NextResponse.json({ error: "Ce code promo n'est plus valide." }, { status: 400 });
    }

    // ── 3. Déjà utilisé sur une commande payée ? ──────────────────────
    const { count, error: countError } = await supabaseAdmin
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .ilike('user_email', email.trim())
      .ilike('promo_code', code.trim())
      .in('status', ['paid', 'PAID', 'completed', 'complete']);

    if (countError) {
      console.error('[validate-promo] Erreur Supabase lors de la vérification du code:', countError);
      return NextResponse.json({ error: 'Erreur serveur lors de la vérification.' }, { status: 500 });
    }

    if (count && count > 0) {
      return NextResponse.json({ error: 'Vous avez déjà profité de cette offre avec cette adresse e-mail.' }, { status: 400 });
    }

    // ── 4. Tout est bon ───────────────────────────────────────────────
    return NextResponse.json({ code: promo.code, percentage: promo.percentage }, { status: 200 });

  } catch (error: any) {
    console.error('[validate-promo] Erreur inattendue:', error.message);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
