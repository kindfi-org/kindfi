import { AchievementCardProps } from "@/components/shared/achivement-card";
import {
  Medal,
  Star,
  Wallet,
  TrendingUp,
  Globe,
  Trophy
} from 'lucide-react';
export const achievements: AchievementCardProps[] = [
    {
      title: 'Blockchain Basics',
      description: 'Completed the Introduction to Blockchain module',
      icon: Medal,
      iconColor: '#10B981',
      status: 'completed',
      completedDate: 'April 10, 2025',
      tokenId: 'GDJT4ENAXI4XBCX...',
      viewLink: 'https://stellar.org'
    },
    {
      title: 'Stellar Expert',
      description: 'Mastered the Stellar blockchain fundamentals',
      icon: Star,
      iconColor: '#3B82F6',
      status: 'locked',
      moduleRequired: 'Stellar Blockchain Basics module required'
    },
    {
      title: 'Wallet Master',
      description: 'Learned how to manage Stellar wallets securely',
      icon: Wallet,
      iconColor: '#8B5CF6',
      status: 'locked',
      moduleRequired: 'Stellar Wallets module required'
    },
    {
      title: 'Asset Manager',
      description: 'Demonstrated proficiency in managing XLM and USDC',
      icon: TrendingUp,
      iconColor: '#F59E0B',
      status: 'locked',
      moduleRequired: 'Managing XLM & USDC module required'
    },
    {
      title: 'Web3 Pioneer',
      description: 'Connected projects to the broader web3 ecosystem',
      icon: Globe,
      iconColor: '#EF4444',
      status: 'locked',
      moduleRequired: 'Web3 Integration module required'
    },
    {
      title: 'KindFi Graduate',
      description: 'Completed all modules and demonstrated full proficiency',
      icon: Trophy,
      iconColor: '#06B6D4',
      status: 'locked',
      moduleRequired: 'All modules module required'
    }
  ];