import {
  Settings,
  Shield,
  Target,
  Zap,
} from 'lucide-react';

export const features: Feature[] = [
  {
    id: 'feature-1',
    icon: <Zap className="w-6 h-6 text-blue-700" />,
    title: 'Intuitive Web3 Interface',
    description:
      'We simplify blockchain interaction for both creators and contributors, offering a seamless, user-friendly experience with digital wallets and smart contracts.',
  },
  {
    id: 'feature-2',
    icon: <Target className="w-6 h-6 text-purple-700" />,
    title: 'Diversified Impact',
    description:
      'Unlock multiple ways to collaborate using Web3 wallets, maximizing social impact and expanding opportunities for meaningful change.',
  },
  {
    id: 'feature-3',
    icon: <Shield className="w-6 h-6 text-blue-700" />,
    title: 'Blockchain Transparency',
    description:
      'Every project is traceable in real-time, showcasing direct impact on the blockchain. This ensures all participants trust that their support reaches its intended destination.',
  },
  {
    id: 'feature-4',
    icon: <Settings className="w-6 h-6 text-purple-700" />,
    title: 'Decentralized Verification with Smart Escrow',
    description:
      'Through a secure escrow system and decentralized validation, we guarantee that every project’s funds are protected and released only when conditions are met.',
  },
];

interface Feature {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}