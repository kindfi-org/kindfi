import { HR } from '@expo/html-elements';
import { Check, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useState } from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

const DropdownSection = ({ title, items }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View className="border border-gray-200 rounded-lg p-4 mb-4">
      <TouchableOpacity 
        className="flex-row justify-between items-center"
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text className="text-xl font-bold">{title}</Text>
        {isOpen ? (
          <ChevronUp size={20} color="#6b7280" />
        ) : (
          <ChevronDown size={20} color="#6b7280" />
        )}
      </TouchableOpacity>

      {isOpen && (
        <View className="mt-3">
          {items.map((item, index) => (
            <View 
              key={index} 
              className={`py-2 ${index !== items.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <Text className="text-gray-600">{item.label}</Text>
              <Text className="font-bold mt-1">{item.value}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};


export default function Details() {

  const applicationImages = {
    dataCenter: require('@/assets/images/icon.png'),
    utilities: require('@/assets/images/splash.png'),
    manufacturing: require('@/assets/images/splash.png'),
    commercial: require('@/assets/images/splash.png'),
  };

  const items = [
    "Environmental impact of mining and disposing of battery materials",
    "Performance degradation over time in chemical batteries",
    "Limited cycle life of conventional batteries",
    "Safety concerns with thermal runaway in lithium-ion systems",
    "Supply chain vulnerabilities for rare earth materials",
  ];

  const items2 = [
    "Increasing renewable energy penetration requiring storage solutions",
"Growing demand for grid stability and resilience",
"Rising electricity costs driving behind-the-meter storage adoption",
"Corporate sustainability commitments and ESG requirements",
"Government incentives and policies supporting clean energy storage",
  ];

  const items3 = [
    "Energy density of 200 Wh/kg (comparable to lithium-ion)",
"Power density of 1000 W/kg (5x higher than lithium-ion)",
"100,000+ full charge cycles with zero degradation",
"Operating temperature range of -40°C to +85°C",
"Expected lifetime of 30+ years",
  ];

  const valuationItems = [
    { label: 'Pre-money valuation', value: '$12M' },
    { label: 'Post-money valuation', value: '$13.5M' }
  ];

  const minInvestmentItems = [
    { label: 'Amount', value: '$10,000' }
  ];

  const securityTypeItems = [
    { label: 'Type', value: 'SAFE' }
  ];

  const investorPerksItems = [
    { label: 'Early access', value: 'Product previews' },
    { label: 'Updates', value: 'Quarterly reports' },
    { label: 'Other benefits', value: 'Founder meetings' }
  ];

  return (
    <View className="mt-4">
      <Text className="font-extrabold mb-1">Detailed Project Information</Text>

      <View className="mb-6">
        <Text className="text-lg font-bold mb-4">Project Overview</Text>
        <Text className="text-gray-600">Qnetic is developing a revolutionary mechanical battery technology that stores energy through kinetic motion rather than chemical reactions. Our patented flywheel-based system achieves energy densities comparable to lithium-ion batteries but with zero degradation over time, unlimited charge cycles, and no rare earth materials or toxic chemicals.</Text>
      </View>

      <View className="mb-6">
        <Text className="font-extrabold mb-1">Project Description</Text>
        <Text className="text-gray-600 bg-gray-50 rounded p-6">At Qnetic, we're addressing one of the most critical challenges in the renewable energy transition: efficient, sustainable energy storage. Our innovative mechanical battery technology represents a paradigm shift in how we think about storing and deploying energy.

          The core of our technology is a high-performance flywheel system that stores energy kinetically rather than chemically. By using advanced composite materials and magnetic bearings, we've created a system that achieves energy densities comparable to lithium-ion batteries but without the environmental drawbacks or performance degradation.

          Our solution addresses several critical pain points in the current energy storage market:
          {items.map((item, index) => (
            <View key={index} style={{ flexDirection: 'row', marginTop: 8 }}>
              <Text style={{ marginRight: 8 }}>•</Text>
              <Text style={{ fontSize: 16 }}>{item}</Text>
            </View>
          ))}</Text>
      </View>

      <HR/>

      <View className="mb-6 mt-6">
        <Text className="font-extrabold mb-1">Business Model</Text>
        <Text className="text-gray-600">Our business model is based on manufacturing and selling energy storage systems, with a focus on the following revenue streams:</Text>
        <View className="flex-row flex-wrap justify-between">
          <View className="w-[48%] bg-gray-50 p-4 rounded-lg mb-4 items-center">
            <Image 
              source={applicationImages.dataCenter} 
              style={{ width: 64, height: 64, marginBottom: 8 }}
            />
            <Text className="font-bold text-lg mb-1 text-center">Data Centers</Text>
            <Text className="text-gray-600 text-center">
              Uninterruptible power supply with lower TCO than traditional battery systems.
            </Text>
          </View>
          
          <View className="w-[48%] bg-gray-50 p-4 rounded-lg mb-4 items-center">
            <Image 
              source={applicationImages.utilities} 
              style={{ width: 64, height: 64, marginBottom: 8 }}
            />
            <Text className="font-bold text-lg mb-1 text-center">Utilities</Text>
            <Text className="text-gray-600 text-center">
              Grid-scale energy storage for renewable energy integration and frequency regulation.
            </Text>
          </View>
          
          <View className="w-[48%] bg-gray-50 p-4 rounded-lg mb-4 items-center">
            <Image 
              source={applicationImages.manufacturing} 
              style={{ width: 64, height: 64, marginBottom: 8 }}
            />
            <Text className="font-bold text-lg mb-1 text-center">Manufacturing</Text>
            <Text className="text-gray-600 text-center">
              Energy storage to reduce peak demand charges and provide backup power.
            </Text>
          </View>
          
          <View className="w-[48%] bg-gray-50 p-4 rounded-lg mb-4 items-center">
            <Image 
              source={applicationImages.commercial} 
              style={{ width: 64, height: 64, marginBottom: 8 }}
            />
            <Text className="font-bold text-lg mb-1 text-center">Commercial Buildings</Text>
            <Text className="text-gray-600 text-center">
              Behind-the-meter storage for demand charge reduction and emergency backup.
            </Text>
          </View>
        </View>
      </View>

      <HR/>

      <View className="mb-6">
        <Text className="font-extrabold mb-1">Market Opportunity</Text>
        <Text className="text-black">The global energy storage market is projected to grow from $211 billion in 2022 to $413 billion by 2030, with a CAGR of 8.7%. Key drivers include:
        {items2.map((item, index) => (
            <View key={index} style={{ flexDirection: 'row', marginTop: 8 }}>
              <Text style={{ marginRight: 8 }}>•</Text>
              <Text style={{ fontSize: 16 }}>{item}</Text>
            </View>
          ))}
        </Text>
      </View>

      <HR/>

      <View className="mb-6">
        <Text className="font-extrabold mb-1">Technology</Text>
        <Text className="text-gray-600">
        Our proprietary flywheel technology uses advanced composite materials and magnetic bearings to achieve:
        {items3.map((item, index) => (
            <View key={index} style={{ flexDirection: 'row', marginTop: 8 }}>
              <Text style={{ marginRight: 8 }}>•</Text>
              <Text style={{ fontSize: 16 }}>{item}</Text>
            </View>
          ))}
        </Text>
        <View className="mb-8">
        <Text className="text-2xl font-bold mb-4">Competitive Advantages</Text>
        
        <View className="flex-row items-start mb-3">
          <Check className="text-green-500 mr-2 mt-1 border border-green-500 rounded-full" size={20} />
          <View className="flex-1">
            <Text className="font-bold">Zero Degradation:</Text>
            <Text className="text-gray-600">
              Unlike lithium-ion batteries that lose capacity over time, our system maintains 100% capacity throughout its lifetime.
            </Text>
          </View>
        </View>
        
        <View className="flex-row items-start mb-3">
          <Check className="text-green-500 mr-2 mt-1 border border-green-500 rounded-full" size={20} />
          <View className="flex-1">
            <Text className="font-bold">Sustainable Materials:</Text>
            <Text className="text-gray-600">
              No rare earth elements, toxic chemicals, or conflict minerals.
            </Text>
          </View>
        </View>
        
        <View className="flex-row items-start mb-3">
          <Check className="text-green-500 mr-2 mt-1 border border-green-500 rounded-full" size={20} />
          <View className="flex-1">
            <Text className="font-bold">Safety:</Text>
            <Text className="text-gray-600">
              No risk of thermal runaway, fire, or explosion.
            </Text>
          </View>
        </View>
        
        <View className="flex-row items-start">
          <Check className="text-green-500 mr-2 mt-1 border border-green-500 rounded-full" size={20} />
          <View className="flex-1">
            <Text className="font-bold">Lower TCO:</Text>
            <Text className="text-gray-600">
              40% lower total cost of ownership over 10 years compared to lithium-ion.
            </Text>
          </View>
        </View>
      </View>
      </View>

      <HR/>

      <View className="mb-8">
        <Text className="text-2xl font-bold mb-4">Traction & Milestones</Text>
        
        <View className="space-y-6">
          <View className="flex-row">
            <View className="bg-blue-500 w-8 h-8 rounded-full items-center justify-center mr-3">
              <Text className="text-white font-bold">1</Text>
            </View>
            <View className="flex-1">
              <Text className="font-bold text-lg mb-1">Q2 2022: Proof of Concept</Text>
              <Text className="text-gray-600">
                Successfully demonstrated 5kWh prototype with energy density of 150 Wh/kg.
              </Text>
            </View>
          </View>
          
          <View className="flex-row">
            <View className="bg-blue-500 w-8 h-8 rounded-full items-center justify-center mr-3">
              <Text className="text-white font-bold">2</Text>
            </View>
            <View className="flex-1">
              <Text className="font-bold text-lg mb-1">Q4 2022: Seed Funding</Text>
              <Text className="text-gray-600">
                Raised $2.1M from Clean Energy Ventures and angel investors.
              </Text>
            </View>
          </View>
          
          <View className="flex-row">
            <View className="bg-blue-500 w-8 h-8 rounded-full items-center justify-center mr-3">
              <Text className="text-white font-bold">3</Text>
            </View>
            <View className="flex-1">
              <Text className="font-bold text-lg mb-1">Q2 2023: 40% Scale Prototype</Text>
              <Text className="text-gray-600">
                Completed 20kWh system with improved energy density of 200 Wh/kg.
              </Text>
            </View>
          </View>
          
          <View className="flex-row">
            <View className="bg-blue-500 w-8 h-8 rounded-full items-center justify-center mr-3">
              <Text className="text-white font-bold">4</Text>
            </View>
            <View className="flex-1">
              <Text className="font-bold text-lg mb-1">Q4 2023: First Customer LOIs</Text>
              <Text className="text-gray-600">
                Secured $110M in Letters of Intent from data center operators and utilities.
              </Text>
            </View>
          </View>
          
          <View className="flex-row">
            <View className="bg-blue-500 w-8 h-8 rounded-full items-center justify-center mr-3">
              <Text className="text-white font-bold">5</Text>
            </View>
            <View className="flex-1">
              <Text className="font-bold text-lg mb-1">Q3 2024: Full-Scale Prototype (In Progress)</Text>
              <Text className="text-gray-600">
                100kWh commercial-ready system for pilot installations.
              </Text>
            </View>
          </View>
        </View>
      </View>

      <HR/>

      <View className="mb-8">
        <Text className="text-2xl font-bold mb-4">Investment Details</Text>
        
        <DropdownSection title="Valuation" items={valuationItems} />
      <DropdownSection title="Minimum Investment" items={minInvestmentItems} />
      <DropdownSection title="Security Type" items={securityTypeItems} />
      <DropdownSection title="Investor Perks" items={investorPerksItems} />

      </View>

      <View className="border border-gray-200 rounded-lg p-4">
        <Text className="text-xl font-bold mb-3">Documents</Text>
        
        <View className="border-b border-gray-100 pb-3 mb-3">
          <TouchableOpacity className="flex-row justify-between items-center">
            <Text className="text-gray-600">SPV Subscription Agreement</Text>
            <ChevronDown size={16} color="#6b7280" />
          </TouchableOpacity>
        </View>
        
        <View className="border-b border-gray-100 pb-3 mb-3">
          <TouchableOpacity className="flex-row justify-between items-center">
            <Text className="text-gray-600">SAFE Agreement</Text>
            <ChevronDown size={16} color="#6b7280" />
          </TouchableOpacity>
        </View>
        
        <View>
          <TouchableOpacity className="flex-row justify-between items-center">
            <Text className="text-gray-600">Pitch Deck</Text>
            <ChevronDown size={16} color="#6b7280" />
          </TouchableOpacity>
        </View>
      </View>


    </View>
  );
}