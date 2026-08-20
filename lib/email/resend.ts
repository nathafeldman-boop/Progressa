import { Resend } from "resend";

// Instanciation paresseuse: le SDK Resend lève une erreur dès le
// constructeur si la clé API est vide, ce qui ferait planter le build (et
// toute route qui importe ce module) tant que RESEND_API_KEY n'est pas
// configurée. On ne construit le client qu'au premier envoi réel.
let cached: Resend | null = null;

export function getResendClient(): Resend {
  if (!cached) {
    cached = new Resend(process.env.RESEND_API_KEY ?? "re_dev_placeholder");
  }
  return cached;
}

export const EMAIL_FROM = process.env.EMAIL_FROM ?? "Progressa <no-reply@example.com>";
