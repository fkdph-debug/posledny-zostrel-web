// Verejné údaje Supabase projektu posledny-zostrel-media.
// Anon kľúč je určený pre prehliadač – dáta chráni prihlásenie a Row Level Security.
// Premenné prostredia vo Verceli (ak sú nastavené) majú prednosť.
export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hmhqahbanowoswmtvada.supabase.co";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtaHFhaGJhbm93b3N3bXR2YWRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTQyODcwNTgsImV4cCI6MjEwOTg2MzA1OH0.m54E-M38yiPGfFKjfDLPZcp1Ql8xQK1FHHuaeowS3lg";
