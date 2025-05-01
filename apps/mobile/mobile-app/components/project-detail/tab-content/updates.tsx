import { View, Text } from 'react-native';

export default function Updates() {
  return (
    <View className="mt-4">
      <Text className="text-lg font-bold mb-6">Project Updates</Text>
      
      <View className="bg-gray-50 p-4 rounded-lg mb-4">
       
        <Text className="font-light text-lg mt-1">No updates has been posted yet</Text>

      </View>

    </View>
  );
}