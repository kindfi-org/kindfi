import dynamic from 'next/dynamic';

const Hero = dynamic(() => import('~/components/sections/home/hero').then((mod) => mod.Hero), {
  ssr: true, // Rendered on the server to enhance initial load and SEO performance
  loading: () => <p>Loading Hero Section...</p>,
});
const UserJourney = dynamic(() => import('~/components/sections/home/user-journey').then((mod) => mod.UserJourney), {
  loading: () => <p>Loading User Journey...</p>,
});
const HighlightedProjects = dynamic(() => import('~/components/sections/home/highlighted-projects').then((mod) => mod.HighlightedProjects), {
  loading: () => <p>Loading Highlighted Projects...</p>,
});
const JoinUs = dynamic(() => import('~/components/sections/home/join-us').then((mod) => mod.JoinUs), {
  loading: () => <p>Loading Join Us...</p>,
});
const HowItWorks = dynamic(() => import('~/components/sections/home/how-it-works').then((mod) => mod.HowItWorks), {
  loading: () => <p>Loading How It Works...</p>,
});
const NewUserGuide = dynamic(() => import('~/components/sections/home/new-user-guide').then((mod) => mod.NewUserGuide), {
  loading: () => <p>Loading New User Guide...</p>,
});
const PlatformOverview = dynamic(() => import('~/components/sections/home/platform-overview').then((mod) => mod.PlatformOverview), {
  loading: () => <p>Loading Platform Overview...</p>,
});
const Community = dynamic(() => import('~/components/sections/home/community').then((mod) => mod.Community), {
  loading: () => <p>Loading Community...</p>,
});
const FinalCTA = dynamic(() => import('~/components/sections/home/final-cta').then((mod) => mod.FinalCTA), {
  loading: () => <p>Loading Final Call-to-Action...</p>,
});

export function HomeDashboard() {
	return (
		<>
			<Hero />
			<UserJourney />
			<HighlightedProjects />
			<JoinUs />
			<HowItWorks />
			<NewUserGuide />
			<PlatformOverview />
			<Community />
			<FinalCTA />
		</>
	)
}
