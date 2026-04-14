import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// ── GET — lecture publique des paramètres du site ──────────────────────────
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('site_settings')
    .select('key, value');

  if (error) {
    console.error('[admin/settings GET]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Convertit le tableau [{ key, value }] en objet plat
  const settings: Record<string, string | boolean> = {};
  for (const row of data ?? []) {
    settings[row.key] = row.key === 'promo_banner_active'
      ? row.value === 'true'
      : row.value;
  }

  return NextResponse.json(settings);
}

// ── PATCH — mise à jour des paramètres (service role) ─────────────────────
export async function PATCH(req: Request) {
  const body: Record<string, string | boolean> = await req.json();

  const updates = Object.entries(body).map(([key, value]) => ({
    key,
    value: String(value),
  }));

  if (updates.length === 0) {
    return NextResponse.json({ error: 'Aucun paramètre fourni.' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('site_settings')
    .upsert(updates, { onConflict: 'key' });

  if (error) {
    console.error('[admin/settings PATCH]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
