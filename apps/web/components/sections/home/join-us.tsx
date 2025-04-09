"use client";

import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Button } from "~/components/base/button";
import { SectionCaption } from "~/components/shared/section-caption";
import { fadeInUpAnimation } from "~/lib/constants/animations";
import { features } from "~/constants/join-us-data";

export function JoinUs() {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
      </div>

      <div className="relative container mx-auto px-4">
        {/* Section Caption */}
        <motion.div {...fadeInUpAnimation}>
          <SectionCaption
            title="Join the KindFi Revolution: Collaborate and Transform the World with Web3"
            subtitle="The Web3 community has the power to give back. Support causes that matter, collaborate on impactful projects, and be part of a revolution leveraging Web3 technology to improve lives. Together, we can create lasting and meaningful change."
            highlightWords={["Transform the World with Web3", "KindFi"]}
          />
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <article
                className="group h-full bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300"
                aria-labelledby={`feature-title-${feature.id}`}
              >
                {feature.icon}

                <h3
                  id={`feature-title-${feature.id}`}
                  className="mt-6 text-xl font-semibold text-gray-900"
                >
                  {feature.title}
                </h3>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  {feature.description}
                </p>

                <div className="mt-6 flex items-center text-sm font-medium text-blue-600">
                  {feature.highlight}
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </article>
            </motion.div>
          ))}
        </div>

        <motion.aside
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative bg-white rounded-2xl p-8 lg:p-12 shadow-lg max-w-3xl mx-auto overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-sky-50 opacity-50" />

          <div className="relative">
            <h4 className="text-xl font-semibold text-center text-gray-900 mb-4">
              KindFi: One Better World
            </h4>
            <p className="text-gray-600 mb-8 leading-relaxed">
              At KindFi, you’re part of a movement demonstrating that Web3 is
              reshaping the future of social impact. From saving the planet to
              empowering communities, every contribution makes a difference. Now
              is the time to use decentralized power to drive true change. Join
              us in making a real impact, free from the limitations of
              traditional systems.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="gradient-btn text-white px-8"
                onClick={() => {}}
              >
                Join the Revolution
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="gradient-border-btn hover:bg-teal-50"
                onClick={() => {}}
              >
                Discover more about KindFi
              </Button>
            </div>
          </div>
        </motion.aside>
      </div>
    </section>
  );
}
