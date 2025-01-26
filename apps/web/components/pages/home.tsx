import dynamic from 'next/dynamic';

const Hero = dynamic(() => import('~/components/sections/home/hero').then((mod) => mod.Hero), { ssr: true });
const UserJourney = dynamic(() => import('~/components/sections/home/user-journey').then((mod) => mod.UserJourney));
const HighlightedProjects = dynamic(() => import('~/components/sections/home/highlighted-projects').then((mod) => mod.HighlightedProjects));
const JoinUs = dynamic(() => import('~/components/sections/home/join-us').then((mod) => mod.JoinUs));
const HowItWorks = dynamic(() => import('~/components/sections/home/how-it-works').then((mod) => mod.HowItWorks));
const NewUserGuide = dynamic(() => import('~/components/sections/home/new-user-guide').then((mod) => mod.NewUserGuide));
const PlatformOverview = dynamic(() => import('~/components/sections/home/platform-overview').then((mod) => mod.PlatformOverview));
const Community = dynamic(() => import('~/components/sections/home/community').then((mod) => mod.Community));
const FinalCTA = dynamic(() => import('~/components/sections/home/final-cta').then((mod) => mod.FinalCTA));

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
