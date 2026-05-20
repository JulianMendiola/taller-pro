import { createClient } from "@supabase/supabase-js";

// Limpia espacios y agrega https:// si falta el protocolo
function sanitizarUrl(raw: string | undefined): string {
  const url = (raw || "").trim();
  if (!url) return "https://placeholder.supabase.co";
  if (url.startsWith("http")) return url;
  return `https://${url}`;
}

const supabaseUrl = sanitizarUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
const supabaseKey =
  (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim() || "placeholder-key";

export const supabase = createClient(supabaseUrl, supabaseKey);