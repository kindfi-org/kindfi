import { CallToAction } from '~/components/sections/about-us/call-to-action';
import { Hero } from '~/components/sections/about-us/hero';
import { HowItWorks } from '~/components/sections/about-us/how-it-works';
import { KindFiStellar } from '~/components/sections/about-us/kindfi-stellar';

export default function AboutPage() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <KindFiStellar />
      <CallToAction />
    </main>
  );
} 