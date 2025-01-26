import { Hero } from "~/components/sections/home/hero";
import { UserJourney } from "../sections/home/user-journey";
import { HighlightedProjects } from "~/components/sections/home/highlighted-projects";
import { JoinUs } from "../sections/home/join-us";
import { HowItWorks } from "../sections/home/how-it-works";
import { NewUserGuide } from "../sections/home/new-user-guide";
import { PlatformOverview } from "../sections/home/platform-overview";
import { Community } from "../sections/home/community";
import { FinalCTA } from "../sections/home/final-cta";


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
