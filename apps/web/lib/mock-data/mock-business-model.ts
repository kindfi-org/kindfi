import { Building, Building2, Factory, Server } from "lucide-react";

export const businessModelData = {
  title: "Business Model",
  description:
    "Our business model is based on manufacturing and selling energy storage systems, with a focus on the following revenue streams:",
  revenueStreams: [
    {
      id: "1",
      title: "Hardware Sales",
      description:
        "Sale of energy storage systems to customers in various sectors.",
    },
    {
      id: "2",
      title: "Service Contracts",
      description:
        "Annual maintenance and warranty services for installed systems.",
    },
    {
      id: "3",
      title: "Software Subscriptions",
      description:
        "Energy management software for optimizing storage performance.",
    },
  ],
  markets: [
    {
      title: "Data Centers",
      description:
        "Uninterruptible power supply with lower TCO than traditional battery systems.",
      icon: Server,
      iconBgColor: "bg-blue-100",
      color: "text-blue-500",
    },
    {
      title: "Utilities",
      description:
        "Grid-scale energy storage for renewable energy integration and frequency regulation.",
      icon: Building2,
      iconBgColor: "bg-green-100",
      color: "text-green-500",
    },
    {
      title: "Manufacturing",
      description:
        "Energy storage to reduce peak demand charges and provide backup power.",
      icon: Factory,
      iconBgColor: "bg-amber-100",
      color: "text-amber-500",
    },
    {
      title: "Commercial Buildings",
      description:
        "Behind-the-meter storage for demand charge reduction and emergency backup.",
      icon: Building,
      iconBgColor: "bg-purple-100",
      color: "text-purple-500",
    },
  ],
};
