import React from 'react';
import { SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { OnboardingSection } from '../components/onboarding/onboarding-section';

export default function OnboardingScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <StatusBar style="auto" />
      <OnboardingSection />
    </SafeAreaView>
  );
} 