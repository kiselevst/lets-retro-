import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars. Copy .env.example to .env.local and fill in NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY.',
  );
}

// Клиент намеренно НЕ типизирован через generic <Database>: вывод типов
// supabase-js для .insert()/.update() по вручную описанной (не сгенерированной
// официальной `supabase gen types`) схеме оказался слишком хрупким — ловили
// ложные ошибки компиляции на полностью корректных данных. Типобезопасность
// по колонкам обеспечивается вручную через типы из lib/types.ts
// (BoardRow, CardRow и т.д.), а не через generic самого клиента.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
