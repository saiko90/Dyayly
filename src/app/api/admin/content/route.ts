import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// ── GET — lecture du contenu de la page Histoire ───────────────────────────
export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('page_content')
    .select('*')
    .eq('id', 'histoire')
    .single();

  if (error) {
    console.error('[admin/content GET]', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// ── PATCH — mise à jour du contenu ─────────────────────────────────────────
export async function PATCH(req: Request) {
  const body = await req.json();
  const { title, intro_text, card_text } = body;

  if (!title && !intro_text && !card_text) {
    return NextResponse.json({ error: 'Aucun champ à mettre à jour.' }, { status: 400 });
  }

  const payload: Record<string, string> = {};
  if (title)      payload.title      = title;
  if (intro_text) payload.intro_text = intro_text;
  if (card_text)  payload.card_text  = card_text;

  const { data, error } = await supabaseAdmin
    .from('page_content')
    .update(payload)
    .eq('id', 'histoire')
    .select()
    .single();

  if (error || !data) {
    console.error('[admin/content PATCH]', error);
    return NextResponse.json({ error: 'Mise à jour impossible.' }, { status: 500 });
  }

  return NextResponse.json(data);
}
