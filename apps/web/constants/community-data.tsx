import { Rocket, Shield, TrendingUp, Users } from "lucide-react";
import type { Benefit, TestimonialData } from "~/lib/types";

export const benefits: Benefit[] = [
  {
    id: "community-social-impact",
    icon: <Users className="w-5 h-5" />,
    text: "Community for Social Impact",
  },
  {
    id: "empowering-crypto-supporters",
    icon: <TrendingUp className="w-5 h-5" />,
    text: "Empowering Crypto Supporters",
  },
  {
    id: "blockchain-verification",
    icon: <Shield className="w-5 h-5" />,
    text: "Blockchain Verification and Security",
  },
  {
    id: "accelerating-blockchain-adoption",
    icon: <Rocket className="w-5 h-5" />,
    text: "Accelerating Blockchain Adoption",
  },
];

export const testimonialData: TestimonialData = {
  quote: [
    "The KindFi community becomes an ambassador for your social cause, ",
    "taking your impact far beyond what traditional Web2 methods can achieve. ",
    "Web3 connects and empowers people worldwide, creating a transparent, ",
    "global, and secure network of support and verification powered by ",
    "blockchain technology and Trustless work's Escrows. Supporting meaningful ",
    "causes isn't something you can buy—it's a reward you earn by being part ",
    "of a movement dedicated to real change.",
  ].join(""),
  author: "KindFi",
  role: "Social Impact Platform",
  imageUrl: "/placeholder-image.jpg", // Replace with actual image
};
