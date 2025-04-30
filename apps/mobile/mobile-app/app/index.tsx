import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';

// Sample data
const allItems = [
  { id: '1', category: 'animal welfare', image: require('../assets/images/artesania.webp'), text: 'Animal Welfare 1' },
  { id: '2', category: 'animal welfare', image: require('../assets/images/bosques.webp'), text: 'Animal Welfare 2' },
  { id: '3', category: 'environment', image: require('../assets/images/education.webp'), text: 'Environment 1' },
  { id: '4', category: 'environment', image: require('../assets/images/healthcare.webp'), text: 'Environment 2' },
  { id: '5', category: 'animal welfare, environment', image: require('../assets/images/healthcare.webp'), text: 'Animal & Environment' },
];

// Header Component
const Header = () => (
  <View style={styles.header}>
    {/* <Image source={require('../assets/images/logo.svg')} style={styles.logo} /> */}
    <Text style={styles.headerText} numberOfLines={2} adjustsFontSizeToFit>
      Change Lives One Block at a Time
    </Text>
  </View>
);

// Filter Component
const Filter = ({ filters, selectedFilter, onSelect }: { filters: string[]; selectedFilter: string | null; onSelect: (filter: string | null) => void }) => (
  <View style={styles.filterContainer}>
    <TouchableOpacity onPress={() => onSelect(null)} style={[styles.filterButton, !selectedFilter && styles.activeFilter]}>
      <Text style={styles.filterText}>All</Text>
    </TouchableOpacity>
    {filters.map((filter) => (
      <TouchableOpacity
        key={filter}
        onPress={() => onSelect(filter)}
        style={[styles.filterButton, selectedFilter === filter && styles.activeFilter]}
      >
        <Text style={styles.filterText}>{filter}</Text>
      </TouchableOpacity>
    ))}
  </View>
);

// ItemList Component
const ItemList = ({ items }: { items: typeof allItems }) => (
  <View style={styles.itemList}>
    {items.map((item) => (
      <View key={item.id} style={styles.item}>
        <Image source={item.image} style={styles.itemImage} />
        <Text style={styles.itemText}>{item.text}</Text>
      </View>
    ))}
  </View>
);

// Main Component
export default function Home() {
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const handleFilterSelect = (filter: string | null) => {
    setSelectedFilter(filter);
  };

  const filteredItems = selectedFilter
    ? allItems.filter((item) => item.category.split(', ').includes(selectedFilter))
    : allItems;

  const filters = Array.from(new Set(allItems.flatMap((item) => item.category.split(', '))));

  return (
    <View style={{ flex: 1 }}>
      <Header />
      <Filter filters={filters} selectedFilter={selectedFilter} onSelect={handleFilterSelect} />
      <ScrollView>
        <ItemList items={filteredItems} />
      </ScrollView>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 10,
  },
  headerText: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'justify',
    paddingRight: 10,
    paddingLeft: 10,
    flex: 1,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
  },
  filterButton: {
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  activeFilter: {
    backgroundColor: '#007bff',
  },
  filterText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  itemList: {
    padding: 16,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f1f1f1',
  },
  itemImage: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
  itemText: {
    fontSize: 16,
    color: '#333',
  },
});