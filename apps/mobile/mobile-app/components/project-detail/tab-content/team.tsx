import { View, Text, Image } from 'react-native';

export default function Team() {
  const teamMembers = [
    {
      name: "Jane Smith",
      role: "Founder & CEO",
      bio: "Education specialist with 10+ years experience in nonprofit sector."
    },
    {
      name: "John Doe",
      role: "CTO",
      bio: "Tech entrepreneur focused on educational technology solutions."
    },
    {
      name: "Maria Garcia",
      role: "Head of Operations",
      bio: "Former school principal with extensive community outreach experience."
    }
  ];

  return (
    <View className="mt-4">
      <Text className="text-lg font-bold mb-6">Our Team</Text>
      
      {teamMembers.map((member, index) => (
        <View key={index} className="flex-row mb-6">
          <Image 
            source={{ uri: 'https://placehold.co/100x100' }}
            className="w-16 h-16 rounded-full mr-4"
          />
          <View className="flex-1">
            <Text className="font-bold text-lg">{member.name}</Text>
            <Text className="text-blue-600 mb-1">{member.role}</Text>
            <Text className="text-gray-600">{member.bio}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}