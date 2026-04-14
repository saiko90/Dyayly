import { createClient } from '@supabase/supabase-js';
import HistoireClient from './HistoireClient';

const FALLBACK = {
  title: "De l'ombre à la lumière",
  intro_text:
    "DYAYLY est né d'un moment de vie où la création est devenue un chemin de transformation, une façon de me révéler et d'oser me lancer.",
  card_text:
    "L'amour tissé à travers les initiales de mes trois enfants.\n\nUn fil sacré qui relie mon cœur de mère, ma force de femme et mon âme de créatrice. Chaque lettre porte une part d'eux, chaque création une part de moi.",
};

export default async function HistoirePage() {
  let content = FALLBACK;

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
    const { data } = await supabase
      .from('page_content')
      .select('title, intro_text, card_text')
      .eq('id', 'histoire')
      .single();

    if (data) content = data;
  } catch {
    // Utilise le fallback en cas d'erreur
  }

  return <HistoireClient content={content} />;
}
