"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Users } from "lucide-react";
import { Card, CardContent } from "~/components/base/card";
import { Web3FeatureCard } from "~/components/shared/web3-feature-card";
import { fadeInUpAnimation } from "~/lib/constants/animations";
import { features, stats } from "~/constants/platform-overview-data";

export function PlatformOverview() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
      </div>

      <div className="relative container mx-auto px-4">
        {/* Header */}
        <motion.div
          {...fadeInUpAnimation}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            <span className="block">The Web3 Platform Transforming</span>
            <span className="block gradient-text">
              Social Impact in Latin America
            </span>
          </h2>
          <p className="text-lg text-gray-600">
            Connect your wallet and join verified social projects. We leverage
            Escrow Blockchain Technology to ensure complete transparency and
            traceability, guaranteeing that every contribution shapes the future
            of our society.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-16">
          {features.map((feature) => (
            <Web3FeatureCard key={feature.id} {...feature} />
          ))}
        </div>

        {/* Bottom Info */}
        <motion.div {...fadeInUpAnimation}>
          <Card className="bg-gradient-to-r from-purple-50 to-purple-50 max-w-4xl mx-auto border-none shadow-sm">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center mb-6">
                <Users className="w-8 h-8 text-purple-700" />
              </div>
              <p className="text-gray-600 leading-relaxed font-medium text-center">
                Using the power of Web3 technology, each project becomes an
                opportunity to create measurable social change. Smart escrow
                system powered by:{" "}
                <a
                  href="https://www.trustlesswork.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  referrerPolicy="no-referrer"
                  className="text-blue-600 underline hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Trustless Work
                </a>
                , ensures that funds are released only when goals are met.
                Blockchain traceability guarantees full transparency and
                accountability for every collaboration. Together, we are
                building a bridge between the blockchain crypto world and
                meaningful social impact across the world.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-3xl mx-auto">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: shouldReduceMotion ? 0.3 : 0.5,
                delay: shouldReduceMotion ? 0 : index * 0.1,
              }}
              className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="flex justify-center mb-4">{stat.icon}</div>
              <div className="text-3xl font-bold gradient-text mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
