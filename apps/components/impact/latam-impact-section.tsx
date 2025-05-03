import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Box, Heading, VStack, HStack } from '@gluestack-ui/themed';
import { MotiView } from 'moti';
import ImpactFeatureCard from './impact-feature-card';
import ImpactStat from './impact-stat';
import styled from 'styled-components/native';

// Define constants for featureCards and impactStats
const FEATURE_CARDS = [
  {
    title: 'Every Contribution, Recorded On-Chain',
    stat: '$1.7B in regional funding',
    backgroundColor: '#2563eb',
    onPress: () => alert('Contributions card tapped'),
  },
  {
    title: 'Every Project, Fully Reviewed',
    stat: '100% of campaigns',
    backgroundColor: '#16a34a',
    onPress: () => alert('Projects card tapped'),
  },
  {
    title: 'From Crypto to Real Change',
    bullets: [
      'Real-Time Impact Metrics',
      'Proof-backed fund releases',
      'Transparent governance',
      'Built on Stellar smart contracts',
    ],
    backgroundColor: '#d97706',
    onPress: () => alert('Crypto card tapped'),
  },
];

const IMPACT_STATS = [
  { label: '100% Verified Projects', backgroundColor: '#4b5563', onPress: () => alert('Verified Projects tapped') },
  { label: '0% Hidden Fees', backgroundColor: '#4b5563', onPress: () => alert('Hidden Fees tapped') },
  { label: '24/7 Project Transparency', backgroundColor: '#4b5563', onPress: () => alert('Transparency tapped') },
];

const ExplainerCard = styled(Box)`
  background-color: ${({ theme }) => theme?.colors?.primary?.dark || '#1e3a8a'};
  padding: 16px;
  border-radius: 12px;
  align-items: center;
  margin-vertical: 16px;
`;

const LatamImpactSection = () => {
  const featureCards = FEATURE_CARDS;
  const impactStats = IMPACT_STATS;

  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <VStack space="md">
        {/* Title and Description */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500 }}
        >
          <Heading size="xl" textAlign="center" color="$black">
            Transforming Social Impact in LATAM With Blockchain You Can Trust
          </Heading>
          <Text textAlign="center" color="$gray600" mt={8}>
            KindFi’s Stellar-based escrow system ensures every contribution is secure, transparent, and
            impactful, with milestone-based fund releases.
          </Text>
        </MotiView>

        {/* Feature Cards */}
        <HStack space="md" justifyContent="space-between" flexWrap="wrap">
          {featureCards.map((card, index) => (
            <MotiView
              key={`feature-${index}-${card.title.replace(/\s+/g, '-').toLowerCase()}`} // Updated key
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 500, delay: index * 100 }}
              style={{ flex: 1, minWidth: '30%' }}
            >
              <ImpactFeatureCard {...card} />
            </MotiView>
          ))}
        </HStack>

        {/* Explainer Card */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 500, delay: 300 }}
        >
          <ExplainerCard>
            <Text color="$white" textAlign="center" fontSize="$lg" fontWeight="bold">
              Real Progress, Real Accountability
            </Text>
            <Text color="$white" textAlign="center" mt={8}>
              Funds are released only when milestones are verified, ensuring every dollar drives measurable
              impact.
            </Text>
          </ExplainerCard>
        </MotiView>

        {/* Impact Stats */}
        <HStack space="md" justifyContent="space-between" flexWrap="wrap">
          {impactStats.map((stat, index) => (
            <MotiView
              key={`stat-${index}-${stat.label.replace(/\s+/g, '-').toLowerCase()}`}
              from={{ opacity: 0, translateY: 20 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 500, delay: index * 100 + 400 }}
              style={{ flex: 1, minWidth: '30%' }}
            >
              <ImpactStat {...stat} />
            </MotiView>
          ))}
        </HStack>
      </VStack>
    </ScrollView>
  );
};

export default LatamImpactSection;