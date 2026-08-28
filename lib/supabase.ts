import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase env vars. Copy .env.example to .env.local and fill in NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY.',
  );
}

// Единственное место в проекте, где создаётся клиент Supabase.
// Все хуки (useBoard, useCards, ...) импортируют его отсюда, а не создают свой.
// Дженерик <Database> даёт автодополнение и проверку типов на всех .from(...).
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
