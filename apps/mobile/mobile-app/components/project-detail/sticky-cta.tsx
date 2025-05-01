import { View, Text, TouchableOpacity } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  interpolate,
  Extrapolate
} from 'react-native-reanimated';
import { useScrollViewOffset } from 'react-native-reanimated';

export default function StickyCTA({ scrollRef }) {
  const scrollOffset = useScrollViewOffset(scrollRef);
  
  const animatedStyle = useAnimatedStyle(() => {
    // Show/hide based on scroll position
    const translateY = interpolate(
      scrollOffset.value,
      [100, 150], // Adjust these values based on when you want it to appear
      [100, 0],
      Extrapolate.CLAMP
    );
    
    return {
      transform: [{ translateY }],
      opacity: interpolate(
        scrollOffset.value,
        [100, 150],
        [0, 1],
        Extrapolate.CLAMP
      )
    };
  });

  return (
    <Animated.View 
      style={[animatedStyle]}
      className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg"
    >
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="font-bold">$40,000 raised</Text>
          <Text className="text-gray-600 text-sm">73% of $55,000 goal</Text>
        </View>
        <TouchableOpacity className="bg-blue-600 px-6 py-3 rounded-lg">
          <Text className="text-white font-bold">Invest Now</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}