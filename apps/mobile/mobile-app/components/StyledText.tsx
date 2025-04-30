import { View, StyleSheet, Image, Text } from "react-native";


export const allItems = [
  {
    id: '1',
    category: 'animal welfare',
    image: require('../assets/images/artesania.webp'),
    text: 'Animal Welfare 1',
    title: 'Healthy Kids Workshop',
    description: 'Provide nourishing meals and support to children at risk of malnutrition in Costa Rica. Together, we can ensure a brighter future for every child.',
    progress: {
      amountRaised: '$22,800',
      percentage: '90%',
      goal: '$25,000',
    },
    stats: {
      goal: '$25,000',
      investors: 18,
      minInvestment: '$5',
    },
    tags: ['NGO', 'NUTRITION', 'CHILDREN'],
  },
  {
    id: '2',
    category: 'animal welfare',
    image: require('../assets/images/bosques.webp'),
    text: 'Animal Welfare 2',
    title: 'Animal Shelter Support',
    description: 'Help provide food, shelter, and medical care to abandoned animals in need. Your contribution makes a difference.',
    progress: {
      amountRaised: '$15,000',
      percentage: '60%',
      goal: '$25,000',
    },
    stats: {
      goal: '$25,000',
      investors: 12,
      minInvestment: '$10',
    },
    tags: ['ANIMALS', 'WELFARE'],
  },
  {
    id: '3',
    category: 'environment',
    image: require('../assets/images/education.webp'),
    text: 'Environment 1',
    title: 'Tree Planting Initiative',
    description: 'Join us in planting trees to combat deforestation and promote a greener planet. Every tree counts!',
    progress: {
      amountRaised: '$10,000',
      percentage: '40%',
      goal: '$25,000',
    },
    stats: {
      goal: '$25,000',
      investors: 25,
      minInvestment: '$20',
    },
    tags: ['ENVIRONMENT', 'TREES'],
  },
  {
    id: '4',
    category: 'environment',
    image: require('../assets/images/healthcare.webp'),
    text: 'Environment 2',
    title: 'Clean Water Project',
    description: 'Provide access to clean and safe drinking water for communities in need. Together, we can save lives.',
    progress: {
      amountRaised: '$18,000',
      percentage: '72%',
      goal: '$25,000',
    },
    stats: {
      goal: '$25,000',
      investors: 30,
      minInvestment: '$15',
    },
    tags: ['WATER', 'HEALTH'],
  },
  {
    id: '5',
    category: 'animal welfare, environment',
    image: require('../assets/images/healthcare.webp'),
    text: 'Animal & Environment',
    title: 'Wildlife Conservation',
    description: 'Support efforts to protect endangered species and their habitats. Your help ensures a sustainable future.',
    progress: {
      amountRaised: '$20,000',
      percentage: '80%',
      goal: '$25,000',
    },
    stats: {
      goal: '$25,000',
      investors: 22,
      minInvestment: '$50',
    },
    tags: ['WILDLIFE', 'CONSERVATION'],
  },
];


export const ItemList = ({ items }: { items: typeof allItems }) => (
  <View style={styles.itemList}>
    {items.map((item) => (
      <View key={item.id} style={styles.card}>
        {/* Image Section */}
        <View style={styles.imageContainer}>
          <Image source={item.image} style={styles.image} />
        </View>

        {/* Text Section */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>

          {/* Progress Section */}
          <View style={styles.progressContainer}>
            <View style={styles.progressTextContainer}>
              <Text style={styles.progressAmount}>{item.progress.amountRaised}</Text>
              <Text style={styles.progressPercentage}>{item.progress.percentage} of {item.progress.goal}</Text>
            </View>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${parseFloat(item.progress.percentage)}%` }]} />
            </View>
          </View>

          {/* Stats Section */}
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{item.stats.goal}</Text>
              <Text style={styles.statLabel}>Goal</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{item.stats.investors}</Text>
              <Text style={styles.statLabel}>Investors</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{item.stats.minInvestment}</Text>
              <Text style={styles.statLabel}>Min. Investment</Text>
            </View>
          </View>

          {/* Tags Section */}
          <View style={styles.tagsContainer}>
            {item.tags.map((tag, index) => (
              <Text key={index} style={styles.tag}>{tag}</Text>
            ))}
          </View>
        </View>
      </View>
    ))}
  </View>
);


const styles = StyleSheet.create({
  itemList: {
    padding: 16,
  },
  card: {
    overflow: 'hidden',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    marginBottom: 16,
    // transition: 'all 0.3s', // Removed as it is not supported in react-native
  },
  imageContainer: {
    width: '100%',
    height: 192, // Equivalent to h-48
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  textContainer: {
    padding: 20, // Equivalent to p-5
    flex: 1,
  },
  title: {
    fontSize: 18, // Equivalent to text-lg
    fontWeight: '600', // Equivalent to font-semibold
    marginBottom: 8, // Equivalent to mb-2
  },
  description: {
    color: '#6b7280', // Equivalent to text-gray-600
    marginBottom: 16, // Equivalent to mb-4
    fontSize: 14, // Equivalent to text-sm
    lineHeight: 20,
  },
  progressContainer: {
    marginBottom: 16, // Equivalent to mb-4
  },
  progressTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4, // Equivalent to mb-1
  },
  progressAmount: {
    fontWeight: '600', // Equivalent to font-semibold
  },
  progressPercentage: {
    color: '#9ca3af', // Equivalent to text-gray-500
  },
  progressBarBackground: {
    width: '100%',
    height: 8, // Equivalent to h-2
    backgroundColor: '#f3f4f6', // Equivalent to bg-gray-100
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    width: '90%', // 90% progress
    height: '100%',
    backgroundColor: '#3b82f6', // Gradient or solid color
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16, // Equivalent to mb-4
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontWeight: '600', // Equivalent to font-semibold
  },
  statLabel: {
    fontSize: 12, // Equivalent to text-xs
    color: '#9ca3af', // Equivalent to text-gray-500
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8, // Equivalent to gap-2
    marginTop: 16, // Equivalent to mt-4
  },
  tag: {
    paddingHorizontal: 8, // Equivalent to px-2
    paddingVertical: 4, // Equivalent to py-1
    fontSize: 10, // Equivalent to text-xs
    textTransform: 'uppercase', // Equivalent to uppercase
    borderRadius: 4,
    backgroundColor: '#f3f4f6', // Light background
  },
});