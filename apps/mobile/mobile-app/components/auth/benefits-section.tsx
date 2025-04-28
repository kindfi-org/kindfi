import React from 'react';
import { View } from 'react-native';
import { Box, Text, VStack, HStack } from '@gluestack-ui/themed';
import { Motion } from "@legendapp/motion";
import { Shield, Users2, Eye, LockKeyhole, LucideIcon } from 'lucide-react-native';
import { useMobile } from '@/hooks/use-mobile';

interface BenefitCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

interface ImpactStatProps {
  value: string;
  label: string;
}

const BenefitCard: React.FC<BenefitCardProps> = ({ title, description, icon: Icon }) => {
  const { isMobile } = useMobile();
  
  return (
    <Motion.View
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`bg-white/10 rounded-xl p-4 ${isMobile ? 'mb-4' : 'flex-1'}`}
    >
      <HStack alignItems="center" gap={12}>
        <Box className="bg-primary-600/20 p-3 rounded-lg">
          <Icon size={24} className="text-primary-500" />
        </Box>
        <VStack flex={1} gap={4}>
          <Text className="text-lg font-semibold text-gray-100">{title}</Text>
          <Text className="text-sm text-gray-300">{description}</Text>
        </VStack>
      </HStack>
    </Motion.View>
  );
};

const ImpactStat: React.FC<ImpactStatProps> = ({ value, label }) => {
  return (
    <Box className="bg-white/5 rounded-lg p-4 flex-1">
      <Text className="text-2xl font-bold text-primary-500">{value}</Text>
      <Text className="text-sm text-gray-300">{label}</Text>
    </Box>
  );
};

export const BenefitsSection: React.FC = () => {
  const { isMobile } = useMobile();
  const benefits = [
    {
      icon: Shield,
      title: "Simple Blockchain Experience",
      description: "Navigate Web3 with ease through our intuitive platform"
    },
    {
      icon: Users2,
      title: "Collaborate for Greater Impact",
      description: "Connect with like-minded creators and amplify your reach"
    },
    {
      icon: Eye,
      title: "Transparency You Can Trust",
      description: "Track every transaction and impact with complete clarity"
    },
    {
      icon: LockKeyhole,
      title: "Escrow-Backed Verification",
      description: "Secure transactions with our trusted escrow system"
    }
  ];

  return (
    <VStack gap={16} className="p-4">
      {/* Impact Stats */}
      <HStack gap={12} className="mb-6">
        <ImpactStat value="100+" label="Verified Projects" />
        <ImpactStat value="$1.7B" label="Available Regional Funding" />
      </HStack>

      {/* Benefit Cards */}
      {isMobile ? (
        <VStack gap={12}>
          {benefits.map((benefit, index) => (
            <Motion.View
              key={index}
              initial={{ opacity: 0, translateX: -20 }}
              animate={{ opacity: 1, translateX: 0 }}
              transition={{ type: "spring" }}
            >
              <BenefitCard {...benefit} />
            </Motion.View>
          ))}
        </VStack>
      ) : (
        <HStack flexWrap="wrap" gap={12}>
          {benefits.map((benefit, index) => (
            <Motion.View
              key={index}
              style={{ flex: 1, minWidth: '45%' }}
              initial={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: "spring" }}
            >
              <BenefitCard {...benefit} />
            </Motion.View>
          ))}
        </HStack>
      )}
    </VStack>
  );
};