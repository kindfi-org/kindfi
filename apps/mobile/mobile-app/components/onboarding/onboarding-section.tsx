import React, { useState, useRef } from 'react';
import { ScrollView } from 'react-native';
import { MotiView } from 'moti';
import { OnboardingToggle } from './onboarding-toggle';
import { StepCard } from './step-card';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';
import { Button, ButtonText } from '../ui/button';

interface Step {
  number: number;
  title: string;
  description: string;
}

const kindlersSteps: Step[] = [
  {
    number: 1,
    title: "Create Your Project",
    description: "Define your cause, set funding goals, and outline the impact you want to make in your community."
  },
  {
    number: 2,
    title: "Build Your Campaign",
    description: "Add compelling visuals, detailed descriptions, and transparent budget breakdowns to inspire supporters."
  },
  {
    number: 3,
    title: "Launch & Share",
    description: "Publish your project and share it across social networks to reach potential supporters worldwide."
  },
  {
    number: 4,
    title: "Engage Your Community",
    description: "Respond to supporters, provide updates, and build lasting relationships with your contributor base."
  },
  {
    number: 5,
    title: "Deliver Impact",
    description: "Execute your project, track progress, and share the positive outcomes with your supporters."
  }
];

const kindersSteps: Step[] = [
  {
    number: 1,
    title: "Discover Projects",
    description: "Browse through carefully curated causes and projects that align with your values and interests."
  },
  {
    number: 2,
    title: "Learn & Connect",
    description: "Read project details, watch videos, and connect directly with project creators to ask questions."
  },
  {
    number: 3,
    title: "Choose Your Support",
    description: "Select from various contribution levels and reward tiers that match your budget and preferences."
  },
  {
    number: 4,
    title: "Make Secure Contributions",
    description: "Support projects safely using our blockchain-powered platform with transparent transaction tracking."
  },
  {
    number: 5,
    title: "Track Your Impact",
    description: "Follow project progress, receive updates, and see the real-world impact of your contributions."
  }
];

export function OnboardingSection() {
  const [activeTab, setActiveTab] = useState<'kindlers' | 'kinders'>('kindlers');
  const scrollViewRef = useRef<ScrollView>(null);

  const currentSteps = activeTab === 'kindlers' ? kindlersSteps : kindersSteps;
  const ctaText = activeTab === 'kindlers' ? 'Register Your Project' : 'Explore Causes';

  const handleTabChange = (tab: 'kindlers' | 'kinders') => {
    setActiveTab(tab);
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleCtaPress = () => {
    // Navigation logic will be implemented when routing is set up
    console.log(`Navigate to ${activeTab === 'kindlers' ? 'project registration' : 'causes browser'}`);
  };

  return (
    <ScrollView 
      ref={scrollViewRef}
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      showsVerticalScrollIndicator={false}
    >
      <VStack space="lg" className="px-6 py-8">
        <VStack space="sm" className="items-center">
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 800, delay: 300 }}
          >
            <Text className="text-3xl font-bold text-gray-900 dark:text-white text-center">
              How KindFi Works
            </Text>
          </MotiView>
          <MotiView
            from={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ type: 'timing', duration: 800, delay: 600 }}
          >
            <Text className="text-lg text-gray-600 dark:text-gray-300 text-center max-w-2xl">
              Whether you're creating positive change or supporting meaningful causes, 
              KindFi makes it simple to make a difference.
            </Text>
          </MotiView>
        </VStack>

        <OnboardingToggle activeTab={activeTab} onTabChange={handleTabChange} />

        <VStack space="md" className="w-full">
          {currentSteps.map((step, index) => (
            <StepCard key={`${activeTab}-${step.number}`} step={step} index={index} />
          ))}
        </VStack>

        <VStack space="md" className="items-center mt-8">
          <Button
            onPress={handleCtaPress}
            size="lg"
            action="primary"
            className="px-8 py-4 rounded-xl min-w-64"
          >
            <ButtonText className="font-semibold text-lg">
              {ctaText}
            </ButtonText>
          </Button>
        </VStack>
      </VStack>
    </ScrollView>
  );
} 