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

    if (!code) {
      return NextResponse.json({ error: 'Code manquant.' }, { status: 400 });
    }
    if (!email) {
      return NextResponse.json({ error: 'Veuillez saisir votre e-mail pour tester un code.' }, { status: 400 });
    }

    const supabase = getAdminClient();
    const normalizedCode = String(code).toUpperCase().trim();
    const normalizedEmail = String(email).toLowerCase().trim();

    // ── 1. Le code existe-t-il ? ──────────────────────────────────────
    const { data: promo, error: promoError } = await supabase
      .from('promo_codes')
      .select('code, percentage, is_active')
      .eq('code', normalizedCode)
      .single();

    if (promoError || !promo) {
      return NextResponse.json({ error: "Ce code promo n'existe pas." }, { status: 404 });
    }

    // ── 2. Est-il actif ? ─────────────────────────────────────────────
    if (promo.is_active === false) {
      return NextResponse.json({ error: "Ce code promo n'est plus valide." }, { status: 400 });
    }

    // ── 3. Déjà utilisé sur une commande payée ? ──────────────────────
    const { count, error: countError } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('user_email', normalizedEmail)
      .eq('promo_code', normalizedCode)
      .eq('status', 'paid');

    if (countError) {
      // Impossible de vérifier → on bloque par sécurité
      console.error('[validate-promo] Erreur lecture orders:', countError.message);
      return NextResponse.json({ error: 'Impossible de valider ce code pour le moment. Réessayez.' }, { status: 500 });
    }

    if (count !== null && count > 0) {
      return NextResponse.json({ error: 'Vous avez déjà utilisé ce code promo.' }, { status: 400 });
    }

    // ── 4. Tout est bon ───────────────────────────────────────────────
    return NextResponse.json({ code: promo.code, percentage: promo.percentage }, { status: 200 });

  } catch (error: any) {
    console.error('[validate-promo] Erreur inattendue:', error.message);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
