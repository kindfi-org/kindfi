'use client';

import { motion, useReducedMotion } from 'framer-motion';

import { useCallback } from 'react';
import { Badge } from '~/components/base/badge';
import { Button } from '~/components/base/button';
import { badgeVariants, staggerChildren } from '~/lib/constants/animations';
import { categories } from '~/lib/mock-data/mock-hero-section';
import type { Category } from '~/lib/types/home.types';

export function Hero() {
  const shouldReduceMotion = useReducedMotion();

  const renderCategory = useCallback((category: Category) => (
    <motion.div
      key={category.id}
      variants={badgeVariants}
      whileHover="hover"
      whileTap="tap"
      className="relative"
      layout // Add layout prop for smooth reflow
    >
      <Badge
        variant="secondary"
        className={`px-4 py-2 cursor-pointer transition-all duration-300 ${category.color}`}
      >
        <motion.span
          className="mr-2"
          animate={shouldReduceMotion ? {} : { rotate: [0, 5, -5, 0] }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: 'easeInOut',
          }}
        >
          {category.icon}
        </motion.span>
        {category.label}
      </Badge>
    </motion.div>
  ), []);

  return (
    <section 
      className="relative z-0 min-h-[80vh] bg-gradient-to-b from-purple-50/50 to-white px-4 py-20"
      aria-labelledby="hero-title"
      role="banner"
    >
      <div className="container mx-auto max-w-6xl">
        <div className="text-center">
          <motion.h2
            className="text-2xl font-bold text-gray-800 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Revolutionizing Social Impact
          </motion.h2>

          <motion.h1
            className="text-4xl md:text-5xl font-bold gradient-text mb-8 py-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Support Social Causes Using Web3
          </motion.h1>

          <motion.p
            className="text-lg text-gray-700 pt-2 my-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            Every contribution fuels real-world impact. You can support social
            causes through crypto donations to escrows and unlock exclusive
            NFTs. KindFi is driving the adoption of Web3 technology for a more
            connected and empowered world where everyone can make a difference.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Button size="lg" className="gradient-btn text-white">
              Support with Crypto
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gradient-border-btn"
            >
              Explore Causes
            </Button>
          </motion.div>

          <motion.div
            className="flex flex-wrap justify-center gap-3 mb-6"
            variants={staggerChildren}
            initial="initial"
            animate="animate"
          >
            {categories.map(renderCategory)}
          </motion.div>
        </div>
      </div>
    </section>
  );
};
