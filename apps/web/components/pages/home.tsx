import { DynamicComponents } from "~/constants/home-page-data";

export function HomeDashboard() {
  return (
    <>
      <DynamicComponents.Hero />
      <DynamicComponents.UserJourney />
      <DynamicComponents.HighlightedProjects />
      <DynamicComponents.JoinUs />
      <DynamicComponents.HowItWorks />
      <DynamicComponents.NewUserGuide />
      <DynamicComponents.PlatformOverview />
      <DynamicComponents.Community />
      <DynamicComponents.FinalCTA />
    </>
  );
}
