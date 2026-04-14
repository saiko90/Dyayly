import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// ── POST — créer un code promo ────────────────────────────────────────────────
export async function POST(req: Request) {
  const { code, percentage } = await req.json();

  if (!code || typeof percentage !== 'number' || percentage <= 0 || percentage > 100) {
    return NextResponse.json({ error: 'Paramètres invalides.' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('promo_codes')
    .insert([{ code: code.toUpperCase().trim(), percentage }])
    .select()
    .single();

  if (error) {
    console.error('[admin/promotions POST]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}

// ── DELETE — supprimer un code promo ─────────────────────────────────────────
export async function DELETE(req: Request) {
  const { id } = await req.json();

  if (!id) {
    return NextResponse.json({ error: 'id manquant.' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('promo_codes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[admin/promotions DELETE]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// ── PATCH — activer / désactiver un code promo ───────────────────────────────
export async function PATCH(req: Request) {
  const { id, is_active } = await req.json();

  if (!id || typeof is_active !== 'boolean') {
    return NextResponse.json({ error: 'Paramètres invalides.' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('promo_codes')
    .update({ is_active })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('[admin/promotions PATCH]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
