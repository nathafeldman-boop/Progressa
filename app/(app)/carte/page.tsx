import { redirect } from "next/navigation";

/** La carte vit maintenant dans /progression (nombre de séances, série, carte, tout au même endroit). */
export default function CartePage() {
  redirect("/progression");
}
