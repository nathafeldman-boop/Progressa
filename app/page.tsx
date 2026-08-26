import "./landing.css";
import { prisma } from "@/lib/prisma";
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

export default async function Home() {
  const approved = await prisma.testimonial.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
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
