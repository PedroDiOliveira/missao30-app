// Polyfill necessário — o client do Supabase usa a API `URL` do browser,
// que não existe por padrão no runtime do React Native (funciona sem isso
// no preview web, mas quebra no app nativo).
import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_ANON_KEY precisam estar definidos em .env (veja .env.example).',
  );
}

/**
 * Client único do Supabase (CONTEXT.md, Seção "Stack técnica"). O app fala
 * direto com o Postgres via RLS/RPCs — não existe servidor Node/Express no
 * meio (CONTEXT.md Seção 4).
 *
 * `detectSessionInUrl: false`: a recuperação de senha deste app usa uma
 * tela própria (`src/app/reset-password.tsx`) que trata o deep link na
 * mão, em vez de depender da detecção automática de sessão via URL do
 * Supabase (pensada pra redirect de OAuth em navegador, não pro nosso caso).
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
