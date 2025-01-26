'use client';

import { motion } from 'framer-motion';
import { Rocket, Shield, TrendingUp, Users } from 'lucide-react';
import { BenefitItem } from '~/components/shared/benefits-items';
import { CTAForm } from '~/components/shared/cta-form';
import { Testimonial } from '~/components/shared/testimonial-card';

// Constants
const benefits: Benefit[] = [
  {
    id: 'community-social-impact',
    icon: <Users className="w-5 h-5" />,
    text: 'Community for Social Impact',
  },
  {
    id: 'empowering-crypto-supporters',
    icon: <TrendingUp className="w-5 h-5" />,
    text: 'Empowering Crypto Supporters',
  },
  {
    id: 'blockchain-verification',
    icon: <Shield className="w-5 h-5" />,
    text: 'Blockchain Verification and Security',
  },
  {
    id: 'accelerating-blockchain-adoption',
    icon: <Rocket className="w-5 h-5" />,
    text: 'Accelerating Blockchain Adoption',
  },
];

const testimonialData: TestimonialData = {
  quote:
    "The KindFi community becomes an ambassador for your social cause, taking your impact far beyond what traditional Web2 methods can achieve. Web3 connects and empowers people worldwide, creating a transparent, global, and secure network of support and verification powered by blockchain technology and Trustless work's Escrows. Supporting meaningful causes isn’t something you can buy—it’s a reward you earn by being part of a movement dedicated to real change.",
  author: 'KindFi',
  role: 'Social Impact Platform',
  imageUrl: '/placeholder-image.jpg', // Replace with actual image
};

// Component
export function Community() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20 max-w-3xl mx-auto"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            <span className="block">More Than Just DeFi</span>
            <span className="block gradient-text">
              Join a Web3 Community of Impact
            </span>
          </h2>
          <p className="text-lg font-medium text-gray-600 leading-relaxed text-justify">
            KindFi is about building a thriving community that drives real
            change. Each project fosters a network of passionate ambassadors,
            contributors, and changemakers working together to ensure success.
            Through Web3 blockchain technology, you become part of an
            unstoppable ecosystem dedicated to creating measurable social
            impact. Collaborate, connect, and help shape a future where crypto
            and purpose unite for the greater good.
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Benefits List */}
          <div className="container space-y-2">
            {benefits.map((benefit, index) => (
              <BenefitItem
                key={benefit.id}
                {...benefit}
                isActive={index === 0}
              />
            ))}
          </div>

          {/* Testimonial */}
          <Testimonial {...testimonialData} />
        </div>

        {/* CTA Form */}
        <CTAForm onSubmit={(data) => console.log(data)} />
      </div>
    </section>
  );
};

// Interfaces
interface Benefit {
  id: string;
  icon: React.ReactNode;
  text: string;
}

interface TestimonialData {
  quote: string;
  author: string;
  role: string;
  imageUrl: string;
}
