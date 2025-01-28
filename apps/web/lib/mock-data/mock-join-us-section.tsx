import { motion } from "framer-motion";
import { ArrowUpRight, Megaphone, RefreshCw } from "lucide-react";

const ANIMATION_DURATION = 20;

export interface Feature {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  highlight: string;
}

export const features: Feature[] = [
  {
    id: "collaborate-and-earn-rewards-id",
    icon: (
      <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center relative overflow-hidden group-hover:bg-teal-100 transition-colors duration-300">
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{
            duration: ANIMATION_DURATION,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(20,184,166,0.1),transparent)]"
        />
        <ArrowUpRight className="w-8 h-8 text-teal-600 relative z-10" />
      </div>
    ),
    title: "Collaborate and Earn Rewards",
    description:
      "Every contribution brings us closer to real change and meaningful rewards. Receive exclusive benefits like limited-edition NFTs, access to special events, and more. Collaboration has never been this rewarding.",
    highlight: "Community Rewards",
  },
  {
    id: "build-a-better-world-id",
    icon: (
      <div className="w-16 h-16 rounded-full bg-sky-50 flex items-center justify-center relative overflow-hidden group-hover:bg-sky-100 transition-colors duration-300">
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: -360 }}
          transition={{
            duration: ANIMATION_DURATION,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(14,165,233,0.1),transparent)]"
        />
        <RefreshCw className="w-8 h-8 text-sky-600 relative z-10" />
      </div>
    ),
    title: "Build a Better World",
    description:
      "Support a diverse range of social initiatives, from animal welfare to cultural preservation. Diversify your contributions and become a driving force for global change.",
    highlight: "+50 Social Initiatives",
  },
  {
    id: "be-the-revolution-id",
    icon: (
      <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center relative overflow-hidden group-hover:bg-purple-100 transition-colors duration-300">
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{
            duration: ANIMATION_DURATION,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(89, 16, 185, 0.1),transparent)]"
        />
        <Megaphone className="w-8 h-8 text-purple-600 relative z-10" />
      </div>
    ),
    title: "Be the Revolution",
    description:
      "Raise the flag and prove that Web3 is the future of social impact. By empowering causes through decentralized technology, you can create real, lasting change beyond the limits of traditional systems.",
    highlight: "Web3 Revolution Advocate",
  },
];
