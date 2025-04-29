import { steps } from "@/components/onboarding/OnboardingSteps";
import { Box } from "@/components/ui/box";
import { Text } from "@/components/ui/text";
import React, { useState, useEffect } from "react";
import { Modal as RNModal, ScrollView, TouchableOpacity, Linking } from "react-native";

const Onboarding = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCurrentStep(0);
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDotClick = (index: number) => {
    setCurrentStep(index);
  };

  const handleLearnMore = () => {
    // Dummy URL for "Learn More" - replace with your actual URL
    const learnMoreUrl = "https://kindfi.com/learn";
    
    // Open the URL in the device's browser
    Linking.openURL(learnMoreUrl).catch(err => {
      console.error("Failed to open URL:", err);
      // Optionally add error handling here
    });
  };

  const CurrentStepIcon = steps[currentStep].Icon;

  return (
    <RNModal
      animationType="slide"
      transparent={true}
      visible={isOpen}
      onRequestClose={() => {
        setCurrentStep(0);
        onClose();
      }}
    >
      <Box className="flex-1 justify-center items-center bg-black bg-opacity-50">
        <Box className="bg-white rounded-xl w-5/6 max-h-5/6">
          <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            {/* Header */}
            <Box className="px-4 pt-6 pb-3 items-center">
              <Text className="text-xl font-bold text-typography-black">
                New in KindFi?
              </Text>
              <Box className="mt-1">
                <Text className="text-base font-semibold text-center gradient-text">
                  Start Supporting Real Causes in 3 Easy Steps
                </Text>
              </Box>
              <Text className="text-xs text-typography-500 mt-2 text-center">
                No crypto experience needed. Just choose a cause, learn what it
                is about, and support it securely using your wallet all in
                minutes
              </Text>
            </Box>

            {/* Main Content - Step Card */}
            <Box className="px-4 py-2">
              <Box className="bg-green-primary-500 bg-opacity-5 rounded-xl p-6 mb-4">
                {/* Step Number */}
                <Text className="text-xs font-semibold gradient-text">
                  Step {currentStep + 1}
                </Text>

                {/* Icon */}
                <Box className="py-4 items-center">
                  {CurrentStepIcon && (
                    <CurrentStepIcon width={64} height={64} />
                  )}
                </Box>

                {/* Step Content */}
                <Text className="text-lg font-bold mb-2 text-typography-800">
                  {steps[currentStep].title}
                </Text>
                <Text className="text-typography-700 text-sm mb-4">
                  {steps[currentStep].description}
                </Text>

                <Box className="mb-4">
                  <TouchableOpacity onPress={handleLearnMore}>
                    <Text className="text-sm font-medium gradient-text">
                      Learn More
                    </Text>
                  </TouchableOpacity>
                </Box>
              </Box>
            </Box>

            {/* Step Indicator */}
            <Box className="flex-row justify-center mb-4">
              {steps.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleDotClick(index)}
                  accessibilityLabel={`Go to step ${index + 1}`}
                >
                  <Box
                    className={`mx-1 w-2 h-2 rounded-full ${
                      index === currentStep
                        ? "bg-green-primary-500"
                        : "bg-gray-300"
                    }`}
                  />
                </TouchableOpacity>
              ))}
            </Box>
          </ScrollView>

          {/* Navigation Buttons */}
          <Box className="p-4 border-t border-gray-100">
            <Box className="flex-row">
              {currentStep > 0 && (
                <TouchableOpacity
                  onPress={handlePrev}
                  className="flex-1 py-3 mr-2 border border-green-primary-500 rounded-lg items-center justify-center"
                >
                  <Text className="gradient-text font-medium">Previous</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={handleNext}
                className="flex-1 py-3 gradient-btn rounded-lg items-center justify-center"
              >
                <Text className="text-white font-medium">
                  {currentStep < steps.length - 1 ? "Continue" : "Get Started"}
                </Text>
              </TouchableOpacity>
            </Box>
          </Box>
        </Box>
      </Box>
    </RNModal>
  );
};

export default Onboarding;