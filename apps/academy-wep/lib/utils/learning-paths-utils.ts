import { LearningPathCardProps } from "~/components/learningpaths/LearningPathCard";

export const LEARNING_PATHS: LearningPathCardProps[] = [
  {
    icon: "table2",
    title: "Blockchain Fundamentals",
    description:
      "Master the core concepts of blockchain technology and understand how it enables transparent, secure transactions.",
    modules: 6,
    level: "Beginner",
    duration: "4 weeks",
    cta: "/learn/blockchain-fundamentals",
    ctaColor: "green" as const,
  },
  {
    icon: "zap",
    title: "Impact Crowdfunding",
    description:
      "Discover strategies for creating successful crowdfunding campaigns that leverage blockchain for transparency and trust.",
    modules: 5,
    level: "All Levels",
    duration: "3 weeks",
    ctaColor: "blue" as const,
    cta: "/learn/impact-crowdfunding",
  },
];
