import { redirect } from "next/navigation";
import "./landing.css";
import { prisma } from "@/lib/prisma";
import { getCurrentInternalUser } from "@/lib/auth";
import { Hero } from "@/components/landing/Hero";
import { PlayerCardShowcase } from "@/components/landing/PlayerCardShowcase";
import { CoachBrian } from "@/components/landing/CoachBrian";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { FirstTraining } from "@/components/landing/FirstTraining";
import { Progression } from "@/components/landing/Progression";
import { Gamification } from "@/components/landing/Gamification";
import { ShareSection } from "@/components/landing/ShareSection";
import { WhyProgressa } from "@/components/landing/WhyProgressa";
import { DemoVideo } from "@/components/landing/DemoVideo";
import { TestimonialsCarousel } from "@/components/landing/TestimonialsCarousel";
import { CtaBand } from "@/components/landing/CtaBand";
import { Faq } from "@/components/landing/Faq";
import { LandingFooter } from "@/components/landing/LandingFooter";

// Rendu dynamique: la LP affiche les derniers avis approuvés, qui changent
// dès qu'un avis est modéré — pas figée sur un instantané pris au build.
export const dynamic = "force-dynamic";

/**
 * "/" est le start_url du manifest PWA (section installation): un joueur
 * qui ouvre l'app installée depuis son écran d'accueil doit retomber sur
 * son tableau de bord s'il a déjà un compte + un profil, jamais revoir la
 * landing page ni pire — un mur de connexion prématuré (start_url ne peut
 * pas pointer directement sur une route protégée par le proxy).
 */
export default async function Home() {
  const [user, approved] = await Promise.all([
    getCurrentInternalUser(),
    prisma.testimonial.findMany({ where: { status: "APPROVED" }, orderBy: { createdAt: "desc" }, take: 20 }),
  ]);

  if (user) {
    const profile = await prisma.playerProfile.findUnique({ where: { userId: user.id } });
    if (profile) redirect("/dashboard");
  }

  const testimonials = approved.map((t) => ({ id: t.id, name: t.firstNameSnapshot, rating: t.rating, text: t.text }));

  return (
    <main className="lp flex flex-1 flex-col">
      <Hero />
      <PlayerCardShowcase />
      <CoachBrian />
      <HowItWorks />
      <FirstTraining />
      <Progression />
      <Gamification />
      <ShareSection />
      <WhyProgressa />
      <TestimonialsCarousel items={testimonials} />
      <DemoVideo />
      <CtaBand variant="mid" />
      <Faq />
      <CtaBand variant="final" />
      <LandingFooter />
    </main>
  );
}
