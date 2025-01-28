import {
  Apple,
  Facebook,
  Globe,
  Mail,
  Settings,
  Shield,
  Target,
  Zap,
} from 'lucide-react';

export interface Feature {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

export interface SocialButtonProps {
  id: string;
  icon: React.ReactNode;
  provider: string;
  onClick: () => void;
  className: string;
}

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

export const socialButtons: SocialButtonProps[] = [
  {
    id: 'email-social-button-id',
    icon: <Mail className="w-5 h-5" />,
    provider: 'Correo',
    onClick: () => console.log('Email login'),
    className: 'bg-teal-600 hover:bg-teal-700 text-white',
  },
  {
    id: 'google-social-button-id',
    icon: <Globe className="w-5 h-5" />,
    provider: 'Google',
    onClick: () => console.log('Google login'),
    className: 'bg-teal-600 hover:bg-teal-700 text-white',
  },
  {
    id: 'facebook-social-button-id',
    icon: <Facebook className="w-5 h-5" />,
    provider: 'Facebook',
    onClick: () => console.log('Facebook login'),
    className: 'bg-teal-600 hover:bg-teal-700 text-white',
  },
  {
    id: 'apple-social-button-id',
    icon: <Apple className="w-5 h-5" />,
    provider: 'Apple',
    onClick: () => console.log('Apple login'),
    className: 'bg-teal-600 hover:bg-teal-700 text-white',
  },
];

export const statistics = {
  projects: {
    value: "100+",
    label: "Verified Projects"
  },
  capitalRaised: {
    value: "$720M",
    label: "Capital Raised"
  }
};
