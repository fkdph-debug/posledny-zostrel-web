// Supabase prihlasuje cez email – meno (napr. "FRK") mapujeme na interný email.
// Používateľov zakladaj v Supabase → Authentication → Users → Add user
// s emailom "<meno malými písmenami>@media.poslednyzostrel.sk".
const DOMAIN = "media.poslednyzostrel.sk";

export const USERS = ["FRK", "MIK", "CIV"];

export function usernameToEmail(username: string) {
  return `${username.trim().toLowerCase()}@${DOMAIN}`;
}

export function emailToUsername(email: string | null | undefined) {
  if (!email) return "";
  const [name, domain] = email.split("@");
  return domain === DOMAIN ? name.toUpperCase() : email;
}
