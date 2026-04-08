import dotenv from 'dotenv';
dotenv.config();

export const env = {
  PORT: process.env.PORT || '3001',
  SUPABASE_URL: process.env.SUPABASE_URL || '',
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || '',
  NODE_ENV: process.env.NODE_ENV || 'development'
};

if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_KEY) {
  console.warn("ATENÇÃO: Variáveis do Supabase não configuradas corretamente.");
}
