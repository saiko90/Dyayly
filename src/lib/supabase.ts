import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://npnobsrajekfblggegrx.supabase.co';
const supabaseKey = 'sb_publishable_3KleMY--6_F0zKVKZqyUzg_Xq0WP4aB'; // Normally in .env.local

export const supabase = createClient(supabaseUrl, supabaseKey);