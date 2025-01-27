import { ChevronRight, Rocket, Users } from "lucide-react";

interface Step {
  number: number;
  title: string;
  description: string;
  active: boolean;
  icon: React.ReactNode;
}

export const projectSteps: Step[] = [
  {
    number: 1,
    title: "Project Registration",
    description:
      "Share the key details of your idea and set clear fundraising goals to kickstart your campaign.",
    active: true,
    icon: <Rocket className="w-5 h-5" />,
  },
  {
    number: 2,
    title: "Review and Approval",
    description:
      "Our team evaluates the feasibility of your proposal to ensure transparency and maximize its potential for success.",
    active: false,
    icon: <ChevronRight className="w-5 h-5" />,
  },
  {
    number: 3,
    title: "Campaign Preparation",
    description:
      "Refine and optimize your campaign to make it ready for an impactful launch on the platform.",
    active: false,
    icon: <ChevronRight className="w-5 h-5" />,
  },
  {
    number: 4,
    title: "Launch and Promotion",
    description:
      "Bring your project to life by launching it for investors and start collecting contributions.",
    active: false,
    icon: <ChevronRight className="w-5 h-5" />,
  },
  {
    number: 5,
    title: "Fund Reception",
    description:
      "Once your goal is reached, withdraw your funds and begin building your vision for the future.",
    active: false,
    icon: <ChevronRight className="w-5 h-5" />,
  },
];

export const investorSteps: Step[] = [
  {
    number: 1,
    title: "Explore Projects",
    description:
      "Browse a diverse range of projects aligned with your interests and values, and discover opportunities to make an impact.",
    active: true,
    icon: <Users className="w-5 h-5" />,
  },
  {
    number: 2,
    title: "Analyze Project Details",
    description:
      "Access key information about each project, including objectives, progress, and potential impact.",
    active: false,
    icon: <ChevronRight className="w-5 h-5" />,
  },
  {
    number: 3,
    title: "Contribute to Projects",
    description:
      "Choose the projects that resonate with you the most and make your contribution with ease.",
    active: false,
    icon: <ChevronRight className="w-5 h-5" />,
  },
  {
    number: 4,
    title: "Real-Time Tracking",
    description:
      "Monitor project progress in real-time and receive regular updates on milestones and achievements.",
    active: false,
    icon: <ChevronRight className="w-5 h-5" />,
  },
  {
    number: 5,
    title: "Rewards and Engagement",
    description:
      "Receive exclusive rewards like NFTs, tokens, or access to special activities as the projects you supported reach completion.",
    active: false,
    icon: <ChevronRight className="w-5 h-5" />,
  },
];