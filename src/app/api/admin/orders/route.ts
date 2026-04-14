import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// ── GET — toutes les commandes, plus récentes en premier ───────────────────
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[admin/orders GET]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// ── PATCH — mise à jour du statut d'une commande ───────────────────────────
export async function PATCH(req: Request) {
  const { id, status } = await req.json();

  const VALID = ['pending', 'paid', 'shipped', 'cancelled'];
  if (!id || !VALID.includes(status)) {
    return NextResponse.json({ error: 'Paramètres invalides.' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error || !data) {
    console.error('[admin/orders PATCH]', error);
    return NextResponse.json({ error: 'Mise à jour impossible.' }, { status: 500 });
  }

  return NextResponse.json(data);
}
