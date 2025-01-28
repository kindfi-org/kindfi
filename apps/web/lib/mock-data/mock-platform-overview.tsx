import {
  ChartBar,
  Clock,
  ShieldCheck,
  Target,
  Wallet,
} from "lucide-react";
import { PlatformFeature, Stat } from "~/lib/types/home.types";

export const features: PlatformFeature[] = [
  {
    id: "transparency-powered-by-web3-id",
    title: "Transparency Powered by Web3",
    description:
      "Every contribution is recorded on the blockchain, providing real-time reports so you always know how and where the funds are being used.",
    icon: <Wallet className="w-6 h-6 text-purple-600" />,
    stats: {
      value: "$720K+",
      label: "USD has helped Social Causes",
    },
  },
  {
    id: "decentralized-verification-id",
    title: "Decentralized Verification",
    description:
      "Each project is carefully reviewed and approved by our team to ensure feasibility, security, and alignment with social impact goals. By leveraging the power of decentralization, we provide unmatched transparency and trust.",
    icon: <ShieldCheck className="w-6 h-6 text-blue-600" />,
    stats: {
      value: "100%",
      label: "Verified Projects",
    },
  },
  {
    id: "measurable-social-impact-id",
    title: "Measurable Social Impact",
    description:
      "Track the tangible impact of every project with full transparency, ensuring your contributions drive meaningful change.",
    icon: <Target className="w-6 h-6 text-purple-600" />,
    checkList: [
      { id: "metrics", text: "Real-Time Impact Metrics" },
      { id: "escrows", text: "Social Impact Through Smart Escrows" },
      { id: "governance", text: "Transparent Governance" },
      { id: "blockchain", text: "Blockchain-Powered Assurance" },
    ],
  },
];

export const stats: Stat[] = [
  {
    id: "verified-projects-id",
    value: "100%",
    label: "Verified Projects",
    icon: <ShieldCheck className="w-6 h-6 text-blue-600" />,
  },
  {
    id: "transparency-id",
    value: "0%",
    label: "Hidden Fees",
    icon: <ChartBar className="w-6 h-6 text-blue-600" />,
  },
  {
    id: "information-availability-id",
    value: "24/7",
    label: "Information Availability",
    icon: <Clock className="w-6 h-6 text-blue-600" />,
  },
];
