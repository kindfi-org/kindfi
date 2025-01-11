'use client'

import { motion } from "framer-motion";
import { ArrowRight, Globe, Heart, Users } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/base/button";

const rippleVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: 1,
    opacity: [0, 0.2, 0],
    transition: {
      duration: 2,
      repeat: Number.POSITIVE_INFINITY,
      repeatDelay: 1
    }
  }
};

const iconVariants = {
  initial: { scale: 0, rotate: -180 },
  animate: {
    scale: 1,
    rotate: 0,
    transition: { type: "spring", duration: 1.5 }
  }
};

const Custom404 = () => {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-50 to-indigo-50 text-center overflow-hidden">
      {/* Animated background ripples */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          variants={rippleVariants}
          initial="initial"
          animate="animate"
          className="absolute w-96 h-96 rounded-full border-2 border-blue-200"
        />
        <motion.div
          variants={rippleVariants}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.5 }}
          className="absolute w-72 h-72 rounded-full border-2 border-blue-200"
        />
      </div>

      <div className="relative z-10 max-w-xl px-4">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-7xl font-bold gradient-text mb-4">404</h1>
        </motion.div>

        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-2xl font-semibold gradient-text mb-6"
        >
          Lost in the World of Good
        </motion.h2>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-gray-600 text-lg mb-8"
        >
          This page seems to have wandered off, but there are still countless ways to make an impact.
          Explore other meaningful projects or return home to start your journey of change.
        </motion.p>

        {/* Animated icons */}
        <div className="flex justify-center gap-8 mb-8">
          {[
            { Icon: Heart, color: "text-red-500" },
            { Icon: Globe, color: "text-green-500" },
            { Icon: Users, color: "text-blue-500" }
          ].map(({ Icon, color }, index) => (
            <motion.div
              // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
              key={index}
              variants={iconVariants}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.7 + index * 0.2 }}
            >
              <Icon className={`w-12 h-12 ${color}`} />
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          <Link href="/">
            <Button className="w-full sm:w-auto bg-green-600 text-white hover:bg-emerald-700 group">
              Return Home
              <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
          <Link href="/projects">
            <Button className="w-full sm:w-auto bg-white text-green-600 border-2 border-emerald-600 hover:bg-blue-50">
              Discover Projects
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Custom404;