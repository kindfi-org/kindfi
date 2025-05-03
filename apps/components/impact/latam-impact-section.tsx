import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Box, Heading, VStack, HStack } from '@gluestack-ui/themed';
import { MotiView } from 'moti';
import ImpactFeatureCard from './impact-feature-card';
import ImpactStat from './impact-stat';
import styled from 'styled-components/native';

const ExplainerCard = styled(Box)`
  background-color: #1e3a8a;
  padding: 16px;
  border-radius: 12px;
  align-items: center;
  margin-vertical: 16px;
`;

const LatamImpactSection = () => {
  const featureCards = [
    {
      title: 'Every Contribution, Recorded On-Chain',
      stat: '$1.7B in regional funding',
      backgroundColor: '#2563eb',
    },
    {
      title: 'Every Project, Fully Reviewed',
      stat: '100% of campaigns',
      backgroundColor: '#16a34a',
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
    },
  ];

  const impactStats = [
    { label: '100% Verified Projects', backgroundColor: '#4b5563' },
    { label: '0% Hidden Fees', backgroundColor: '#4b5563' },
    { label: '24/7 Project Transparency', backgroundColor: '#4b5563' },
  ];

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
              key={index}
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
              key={index}
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
