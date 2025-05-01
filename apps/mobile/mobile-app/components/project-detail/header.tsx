import { View, Text } from 'react-native';

export default function ProjectHeader() {
  return (
    <View className="px-4 pt-6">
      <Text className="font-medium text-sm text-gray-500">INVEST IN <span className='bg-gray-450 text-black border px-3 py-1 rounded-full text-sm ml-5'>EDUCATION </span></Text>
      <Text className="text-xl text-black font-bold mt-2">Empowering Education</Text>
    </View>
  );
}