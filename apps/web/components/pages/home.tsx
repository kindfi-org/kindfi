import { DynamicComponents } from '~/lib/constants/home-page-data'

export function HomeDashboard() {
	return (
		<>
			<DynamicComponents.NewUserGuide />
			<DynamicComponents.UserJourney />
			<DynamicComponents.JoinUs />
			<DynamicComponents.HowItWorks />
			<DynamicComponents.PlatformOverview />
		</>
	)
}
