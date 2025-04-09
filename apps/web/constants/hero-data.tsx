import {
  Baby,
  Coins,
  GraduationCap,
  HandHelping,
  Heart,
  Leaf,
  LineChart,
  NewspaperIcon,
  Rocket,
  Sprout,
  Stethoscope,
  UtensilsCrossed,
} from "lucide-react";
import type { Category, Stat } from "~/lib/types";

export const categories: Category[] = [
  {
    id: "empowering-communities-id",
    icon: <Rocket className="w-4 h-4" />,
    label: "Empowering Communities",
    color:
      "bg-teal-50/80 text-teal-700 hover:bg-teal-100/80 border-teal-200/50",
  },
  {
    id: "environmental-projects-id",
    icon: <Leaf className="w-4 h-4" />,
    label: "Environmental Projects",
    color:
      "bg-green-50/80 text-green-700 hover:bg-green-100/80 border-green-200/50",
  },
  {
    id: "animal-shelters-id",
    icon: <Heart className="w-4 h-4" />,
    label: "Animal Shelters",
    color:
      "bg-rose-50/80 text-rose-700 hover:bg-rose-100/80 border-rose-200/50",
  },
  {
    id: "community-news-id",
    icon: <NewspaperIcon className="w-4 h-4" />,
    label: "Community News Initiatives",
    color:
      "bg-slate-50/80 text-slate-700 hover:bg-slate-100/80 border-slate-200/50",
  },
  {
    id: "healthcare-support-id",
    icon: <Stethoscope className="w-4 h-4" />,
    label: "Healthcare Support",
    color:
      "bg-cyan-50/80 border-cyan-200/50 text-cyan-700 hover:bg-cyan-200/80",
  },
  {
    id: "food-security-id",
    icon: <UtensilsCrossed className="w-4 h-4" />,
    label: "Food Security Campaigns",
    color:
      "bg-orange-50/80 border-orange-200/50 text-orange-700 hover:bg-orange-200/80",
  },
  {
    id: "child-welfare-id",
    icon: <Baby className="w-4 h-4" />,
    label: "Child Welfare Programs",
    color:
      "bg-purple-50/80 border-purple-200/50 text-purple-700 hover:bg-purple-200/80",
  },
  {
    id: "sustainable-agriculture-id",
    icon: <Sprout className="w-4 h-4" />,
    label: "Sustainable Agriculture",
    color:
      "bg-sky-50/80 border-emerald-200/50 text-emerald-700 hover:bg-emerald-200/80",
  },
  {
    id: "social-finance-id",
    icon: <Coins className="w-4 h-4" />,
    label: "Social Finance & Innovation",
    color: "bg-sky-50/80 text-sky-700 hover:bg-sky-100/80 border-sky-200/50",
  },
  {
    id: "education-for-all-id",
    icon: <GraduationCap className="w-4 h-4" />,
    label: "Education for All",
    color:
      "bg-indigo-50/80 text-indigo-700 hover:bg-indigo-100/80 border-indigo-200/50",
  },
  {
    id: "disaster-relief-id",
    icon: <HandHelping className="w-4 h-4" />,
    label: "Disaster Relief Efforts",
    color: "bg-red-50/80 text-red-700 hover:bg-red-100/80 border-red-200/50",
  },
];

export const stats: Stat[] = [
  {
    id: "successful-investments-id",
    value: "250+",
    label: "Successful Investments",
    icon: <LineChart className="w-6 h-6 text-teal-600 mb-2" />,
  },
  {
    id: "funded-projects-id",
    value: "3,325",
    label: "Funded Projects",
    icon: <Rocket className="w-6 h-6 text-teal-600 mb-2" />,
  },
  {
    id: "total-invested-capital-id",
    value: "$720M",
    label: "Total Invested Capital",
    icon: <Coins className="w-6 h-6 text-teal-600 mb-2" />,
    highlight: true,
  },
];
