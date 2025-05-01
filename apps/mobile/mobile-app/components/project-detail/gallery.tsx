import { View, Image } from 'react-native';

export default function Gallery() {
  return (
    <View className="h-64 bg-gray-200 mt-4">
      {/* Placeholder for project image gallery */}
      <Image 
        source={{ uri: 'https://placehold.co/600x400' }} 
        className="w-full h-full"
      />
    </View>
  );
}