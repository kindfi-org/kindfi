import React, { useState } from 'react';
import { View, ScrollView, Text, Image } from 'react-native';
import Header from '../components/Header';
import Filter from '../components/Filter';
import ItemList from '../components/ItemList';
import { Item } from '../types';


// const FeatureCard = ({ iconSvg: IconSvg, name, desc }: any) => {
//   return (
//     <Box
//       className="flex-column border border-w-1 border-outline-700 md:flex-1 m-2 p-4 rounded"
//       key={name}
//     >
//       <Box className="items-center flex flex-row">
//         <Text>
//           <IconSvg />
//         </Text>
//         <Text className="text-typography-white font-medium ml-2 text-xl">
//           {name}
//         </Text>
//       </Box>
//       <Text className="text-typography-400 mt-2">{desc}</Text>
//     </Box>
//   );
// };
const allItems: Item[] = [
  // { id: '1', category: 'animal welfare', image: require('..assets/images/artesania.webp'), text: 'Animal Welfare 1', title: 'Animal Welfare 1', imageUrl: '../assets/images/artesania.webp' },
  { id: '2', category: 'animal welfare', image: require('../assets/images/bosques.webp'), text: 'Animal Welfare 2', title: 'Animal Welfare 2', imageUrl: '../assets/images/bosques.webp' },
  { id: '3', category: 'environment', image: require('../assets/images/education.webp'), text: 'Environment 1', title: 'Environment 1', imageUrl: '../assets/images/education.webp' },
  { id: '4', category: 'environment', image: require('../assets/images/healthcare.webp'), text: 'Environment 2', title: 'Environment 2', imageUrl: '../assets/images/healthcare.webp' },
  // Add more items as needed
];

export default function Home() {
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const handleFilterSelect = (filter: string) => {
      setSelectedFilter(filter);
  };

  const filteredItems = selectedFilter ? allItems.filter(item => item.category === selectedFilter) : allItems;

  return (
      <View style={{ flex: 1 }}>
          <Header logo={require('../assets/images/logo.svg')}  />
          {/* <Filter items={['animal welfare', 'environment']} onSelect={handleFilterSelect} />
          <ScrollView>
              <Text style={{ fontSize: 24, textAlign: 'center', marginVertical: 20 }}>Change Lives One Block at a Time</Text>
              <ItemList items={filteredItems} />
          </ScrollView> */}
      </View>
  );
}
