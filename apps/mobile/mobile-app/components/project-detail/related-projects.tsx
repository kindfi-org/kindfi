import { View, Text, ScrollView, TouchableOpacity } from 'react-native';

export default function RelatedProjects() {
  const projects = [
    {
      name: "EcoFlow Energy Solutions",
      description: "Renewable energy storage for residential",
      raised: "1.2M Raised",
      progress: "80%"
    },
    {
      name: "GreenPower Storage Systems",
      description: "Grid-scale energy storage technology",
      raised: "1.2M Raised",
    }
  ];

  return (
    <View className="mt-8 mb-10">
      <Text className="font-bold text-lg mb-4">Similar Projects</Text>
      
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="gap-4">
        {projects.map((project, index) => (
          <TouchableOpacity 
            key={index} 
            className="bg-gray-50 p-4 rounded-lg w-64 mr-4"
          >
            <Text className="font-bold mb-1">{project.name}</Text>
            <Text className="text-gray-600 text-sm mb-2">{project.description}</Text>
            <View className="flex-row justify-between items-center">
              <Text className="text-sm font-medium">{project.raised}</Text>
              <Text className="text-sm text-gray-600">{project.progress}</Text>
            </View>
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity className="bg-gray-50 p-4 rounded-lg w-32 items-center justify-center">
          <Text className="text-blue-600 font-medium">View more</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}