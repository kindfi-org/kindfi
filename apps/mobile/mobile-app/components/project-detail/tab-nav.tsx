import { View, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { useLocalSearchParams } from 'expo-router';

export default function TabNav() {
  const { id } = useLocalSearchParams();
  const { tab = 'overview' } = useLocalSearchParams();
  
  const isActive = (tabName: string) => tab === tabName;
  
  return (
    <View className="flex-row border-b border-gray-200 mt-6">
      <Link href={`/project/${id}?tab=overview`} asChild>
        <TouchableOpacity 
          className={`pb-3 px-4 ${isActive('overview') ? 'border-b-2 border-blue-600' : ''}`}
        >
          <Text className={`${isActive('overview') ? 'font-bold text-blue-600' : 'text-gray-600'}`}>
            Overview
          </Text>
        </TouchableOpacity>
      </Link>
      <Link href={`/project/${id}?tab=details`} asChild>
        <TouchableOpacity 
          className={`pb-3 px-4 ${isActive('details') ? 'border-b-2 border-blue-600' : ''}`}
        >
          <Text className={`${isActive('details') ? 'font-bold text-blue-600' : 'text-gray-600'}`}>
            Details
          </Text>
        </TouchableOpacity>
      </Link>
      <Link href={`/project/${id}?tab=team`} asChild>
        <TouchableOpacity 
          className={`pb-3 px-4 ${isActive('team') ? 'border-b-2 border-blue-600' : ''}`}
        >
          <Text className={`${isActive('team') ? 'font-bold text-blue-600' : 'text-gray-600'}`}>
            Team
          </Text>
        </TouchableOpacity>
      </Link>
      <Link href={`/project/${id}?tab=updates`} asChild>
        <TouchableOpacity 
          className={`pb-3 px-4 ${isActive('updates') ? 'border-b-2 border-blue-600' : ''}`}
        >
          <Text className={`${isActive('updates') ? 'font-bold text-blue-600' : 'text-gray-600'}`}>
            Updates
          </Text>
        </TouchableOpacity>
      </Link>
      <Link href={`/project/${id}?tab=qna`} asChild>
        <TouchableOpacity 
          className={`pb-3 px-4 ${isActive('qna') ? 'border-b-2 border-blue-600' : ''}`}
        >
          <Text className={`${isActive('qna') ? 'font-bold text-blue-600' : 'text-gray-600'}`}>
            Q&A
          </Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}