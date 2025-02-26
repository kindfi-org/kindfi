import Hero from "~/components/sections/about-us/hero";
import MissionVision from "~/components/sections/about-us/mission-vision";
import Problems from "~/components/sections/about-us/problems";
import HowItWorks from "~/components/sections/about-us/how-it-works";
import WhyIsDifferent from "~/components/sections/about-us/why-is-different";
import KindFiStellar from "~/components/sections/about-us/kindfi-stellar";
import Roadmap from "~/components/sections/about-us/roadmap";
import CallToAction from "~/components/sections/about-us/call-to-action";

export default function AboutPage() {
  return (
    <div className="w-full flex flex-col items-center text-center">
      <Hero />

      {/* Espaciado aumentado antes de Mission & Vision */}
      <div className="w-full max-w-5xl mx-auto px-6 pt-52 pb-40">
        <MissionVision />
      </div>

      <div className="w-full max-w-5xl mx-auto px-6 pt-52 pb-40">
        <Problems />
      </div>

      <div className="w-full max-w-5xl mx-auto px-6 pt-52 pb-40">
        <HowItWorks />
      </div>

      <div className="w-full max-w-5xl mx-auto px-6 pt-52 pb-40">
        <WhyIsDifferent />
      </div>

      <div className="w-full max-w-5xl mx-auto px-6 pt-52 pb-40">
        <KindFiStellar />
      </div>

      <div className="w-full max-w-5xl mx-auto px-6 pt-52 pb-40">
        <Roadmap />
      </div>

      {/* Espaciado aumentado antes del CallToAction */}
      <div className="w-full max-w-5xl mx-auto px-6 pt-60 pb-60">
        <CallToAction />
      </div>
    </div>
  );
}
