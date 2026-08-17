import "./landing.css";
import { Hero } from "@/components/landing/Hero";
import { PlayerCardShowcase } from "@/components/landing/PlayerCardShowcase";
import { CoachBrian } from "@/components/landing/CoachBrian";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { FirstTraining } from "@/components/landing/FirstTraining";
import { Progression } from "@/components/landing/Progression";
import { Gamification } from "@/components/landing/Gamification";
import { ShareSection } from "@/components/landing/ShareSection";
import { WhyProgressa } from "@/components/landing/WhyProgressa";
import { CtaBand } from "@/components/landing/CtaBand";
import { Faq } from "@/components/landing/Faq";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function Home() {
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
      <CtaBand variant="mid" />
      <Faq />
      <CtaBand variant="final" />
      <LandingFooter />
    </main>
  );
}
