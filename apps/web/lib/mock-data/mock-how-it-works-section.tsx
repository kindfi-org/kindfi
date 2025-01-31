import { Globe, Shield, Users } from 'lucide-react';
import { type Model, ModelVariant } from '~/lib/types/home.types';

export const models: Model[] = [
  {
    id: `model-${ModelVariant.SECURE}`,
    title: 'Secure Escrow',
    description:
      "Funds are held in a verified escrow account by Trustless work until the project’s goal is met, ensuring the safety and reliability of your contributions.",
    variant: ModelVariant.SECURE,
    icon: <Shield className="w-6 h-6 mb-4 text-emerald-600" />,
    capabilities: [
      { id: 'smart-contracts-id', text: 'Smart Contracts' },
      { id: 'secure-fund-custody-id', text: 'Secure Fund Custody' },
      { id: 'blockchain-transparency-id', text: 'Blockchain Transparency' },
    ],
  },
  {
    id: `model-${ModelVariant.SOCIAL}`,
    title: 'Social Impact',
    description:
      "Once a project achieves its goal, funds are directly released to the social cause, fully backed by smart contracts to ensure transparency and trust.",
    variant: ModelVariant.SOCIAL,
    icon: <Users className="w-6 h-6 mb-4 text-blue-600" />,
    capabilities: [
      { id: 'impact-reports-id', text: 'Impact Reports' },
      { id: 'real-time-tracking-id', text: 'Real-Time Tracking' },
      { id: 'engaged-communities-id', text: 'Engaged Communities' },
    ],
  },
  {
    id: `model-${ModelVariant.BLOCKCHAIN}`,
    title: 'Powered by Blockchain and Web3',
    description:
      "Connect your wallet and participate securely, transparently, and efficiently. Every transaction is recorded on the blockchain.",
    variant: ModelVariant.BLOCKCHAIN,
    icon: <Globe className="w-6 h-6 mb-4 text-teal-600" />,
    capabilities: [
      { id: 'instant-transactions-id', text: 'Instant Transactions' },
      { id: 'immutable-records-id', text: 'Immutable Records' },
      { id: 'nft-certificates-tokens-id', text: 'NFT Certificates and Tokens' },
    ],
  },
];
