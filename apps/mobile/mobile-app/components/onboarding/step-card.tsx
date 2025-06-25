import React from 'react';
import { View } from 'react-native';
import { MotiView } from 'moti';
import { Text } from '../ui/text';
import { VStack } from '../ui/vstack';
import { HStack } from '../ui/hstack';

interface StepCardProps {
  step: {
    number: number;
    title: string;
    description: string;
  };
  index: number;
}

export function StepCard({ step, index }: StepCardProps) {
  return (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{
        type: 'timing',
        duration: 300,
        delay: index * 100,
      }}
      className="mb-4"
    >
      <View className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
        <HStack space="md" className="items-start">
          <View className="bg-blue-100 dark:bg-blue-900 rounded-full w-8 h-8 items-center justify-center flex-shrink-0 mt-1">
            <Text className="text-blue-600 dark:text-blue-400 font-bold text-sm">
              {step.number}
            </Text>
          </View>
          
          <VStack space="xs" className="flex-1">
            <Text className="font-semibold text-lg text-gray-900 dark:text-white">
              {step.title}
            </Text>
            <Text className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              {step.description}
            </Text>
          </VStack>
        </HStack>
      </View>
    </MotiView>
  );
} 