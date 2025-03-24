"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const FeaturedResources = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="flex justify-between items-center mb-6"
    >
      <h2 className="text-2xl md:text-3xl font-bold text-black">
        Featured Resources
      </h2>
      <motion.div whileHover={{ x: 5 }} transition={{ duration: 0.2 }}>
        <Link
          href="/resources"
          className="flex items-center text-primary hover:text-primary/80 font-medium"
        >
          View all resources
          <ArrowRight className="ml-1 h-5 w-5" />
        </Link>
      </motion.div>
    </motion.div>
  );
};
