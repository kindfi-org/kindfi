// import React, { useState } from 'react';
// import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
// import { MaterialIcons } from '@expo/vector-icons';
// import { allItems } from '../components/StyledText';
// import { ItemList } from '../components/StyledText';
// import Kindifi from '@/assets/Icons/Kindifi';


// // Header Component
// const Header = () => (
//   <View style={styles.header}>
//     <Text style={styles.headerText} numberOfLines={2} adjustsFontSizeToFit>
//       Change Lives One Block at a Time
//     </Text>
//   </View>
// );


// const Navbar = () => (
//   <View style={styles.header}>
//     {/* Hamburger Menu */}
 
//     <TouchableOpacity>
//       <Kindifi width={120} height={33} />
//     </TouchableOpacity>


//     <TouchableOpacity>
//       <MaterialIcons name="menu" size={24} color="#333" />
//     </TouchableOpacity>
//     {/* Separator */}
//     <View style={styles.separator} />
//   </View>
// )
// // Filter Component
// const Filter = ({ filters, selectedFilter, onSelect }: { filters: string[]; selectedFilter: string | null; onSelect: (filter: string | null) => void }) => (
//   <View style={styles.filterContainer}>
//     {/* "All" Filter */}
//     <TouchableOpacity
//       onPress={() => onSelect(null)}
//       style={[
//         styles.filterButton,
//         !selectedFilter && styles.activeFilter,
//       ]}
//     >
//       <Text style={[styles.filterText, !selectedFilter && styles.activeFilterText]}>All</Text>
//     </TouchableOpacity>

//     {/* Dynamic Filters */}
//     {filters.map((filter) => (
//       <TouchableOpacity
//         key={filter}
//         onPress={() => onSelect(filter)}
//         style={[
//           styles.filterButton,
//           selectedFilter === filter && styles.activeFilter, 
//         ]}
//       >
//         <Text style={[styles.filterText, selectedFilter === filter && styles.activeFilterText]}>{filter}</Text>
//       </TouchableOpacity>
//     ))}
//   </View>
// );

// // Main Component
// export default function Home() {
//   const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

//   const handleFilterSelect = (filter: string | null) => {
//     setSelectedFilter(filter);
//   };

//   const filteredItems = selectedFilter
//     ? allItems.filter((item) => item.category.split(', ').includes(selectedFilter))
//     : allItems;

//   const filters = Array.from(new Set(allItems.flatMap((item) => item.category.split(', '))));

//   return (
//     <View style={{ flex: 1 }}>
//       <Navbar />
//       <Header />
//       <Filter filters={filters} selectedFilter={selectedFilter} onSelect={handleFilterSelect} />
//       <ScrollView>
//         <ItemList items={filteredItems} />
//       </ScrollView>
//     </View>
//   );
// }

// // Styles
// const styles = StyleSheet.create({
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     padding: 16,
//     backgroundColor: '#f8f9fa',
//   },
//   hamburgerIcon: {
//     width: 24,
//     height: 24,
//   },
//   logo: {
//     width: 40,
//     height: 40,
//   },
//   headerText: {
//     flex: 1,
//     textAlign: 'justify',
//     fontSize: 23,
//     fontWeight: 'bold',
//     color: '#333',
//     marginHorizontal: 10,
//   },
//   separator: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     height: 1,
//     backgroundColor: '#ccc',
//   },
//   filterContainer: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//     gap: 8, 
//     marginVertical: 10,
//     justifyContent: 'center',
//   },
//   filterButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 12,
//     paddingVertical: 6, 
//     borderRadius: 9999, 
//     borderWidth: 1, 
//     borderColor: 'rgba(156, 39, 176, 0.5)', 
//     backgroundColor: '#f3f4f6', 
//     shadowColor: '#000', 
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.1,
//     shadowRadius: 2,
    
//   },
//   activeFilter: {
//     backgroundColor: 'rgba(156, 39, 176, 0.8)', 
//     borderColor: 'rgba(156, 39, 176, 0.8)', 
//   },
//   filterText: {
//     fontSize: 12, 
//     fontWeight: '600', 
//     color: '#6b7280', 
//   },
//   activeFilterText: {
//     color: '#fff', 
//   },
//   itemList: {
//     padding: 16,
//   },
//   item: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//     padding: 10,
//     borderRadius: 8,
//     backgroundColor: '#f1f1f1',
//   },
//   itemImage: {
//     width: 50,
//     height: 50,
//     marginRight: 10,
//   },
//   itemText: {
//     fontSize: 16,
//     color: '#333',
//   },
// });