"use client";

import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { Button } from "~/components/base/button";
import { investorSteps, projectSteps } from "~/constants/user-journey-data";
import { cn } from "~/lib/utils";

type ViewType = "project" | "investor";

export function UserJourney() {
  const [activeView, setActiveView] = React.useState<ViewType>("project");

  const steps = activeView === "project" ? projectSteps : investorSteps;

  const [shouldReduceMotion, setShouldReduceMotion] = React.useState(false);

  const fadeInUpAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: (delay = 0) => ({
      duration: shouldReduceMotion ? 0 : 0.5,
      delay,
      y: { duration: shouldReduceMotion ? 0 : 0.5 },
    }),
  };

  React.useEffect(() => {
    setShouldReduceMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);

  return (
    <section className="gradient-bg-blue-purple relative overflow-hidden px-4 py-14">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.div {...fadeInUpAnimation}>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Transform Realities Using the{" "}
              <span className="gradient-text">Power of the Web3</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              From creation to launch, follow a transparent and secure process
              powered by Smart Blockchain Escrows. Every step is verified to
              ensure the success of your social campaign.
            </p>
          </motion.div>

          {/* Toggle Buttons */}
          <motion.div
            className="mt-12 mb-16 flex justify-center"
            {...fadeInUpAnimation}
          >
            <div className="inline-flex rounded-full p-1 bg-white shadow-sm border border-gray-100">
              <Button
                variant={activeView === "project" ? "default" : "ghost"}
                className={cn(
                  "rounded-full px-6 py-2 text-sm font-medium transition-all duration-200",
                  activeView === "project"
                    ? "gradient-btn text-white"
                    : "text-gray-600 hover:text-emerald-600",
                )}
                onClick={() => setActiveView("project")}
                aria-pressed={activeView === "project"}
                aria-label="Show project creator journey"
                onKeyDown={(e) => {
                  if (e.key === "ArrowRight") {
                    e.preventDefault();
                    setActiveView("investor");
                  }
                }}
              >
                Social Cause Path
              </Button>
              <Button
                variant={activeView === "investor" ? "default" : "ghost"}
                className={`rounded-full px-6 py-2 text-sm font-medium transition-all duration-200 ${
                  activeView === "investor"
                    ? "gradient-btn text-white"
                    : "text-gray-600 hover:text-emerald-600"
                }`}
                onClick={() => setActiveView("investor")}
                aria-pressed={activeView === "investor"}
                aria-label="Show investor journey"
                onKeyDown={(e) => {
                  if (e.key === "ArrowLeft") {
                    e.preventDefault();
                    setActiveView("project");
                  }
                }}
              >
                Supporter Path
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="grid gap-8 sm:gap-6 md:gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
          >
            {steps.map((step) => (
              <motion.div key={`step-${step.number}`} {...fadeInUpAnimation}>
                <div className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300 h-full border border-gray-100">
                  <div className="flex items-center mb-4">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-purple-600 font-semibold text-sm">
                      {step.number}
                    </div>
                    <div className="ml-3 font-semibold text-gray-900">
                      {step.title}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Action Button */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <Button
            size="lg"
            className="bg-indigo-900 hover:bg-indigo-800 text-white px-8"
          >
            {activeView === "project"
              ? "Register Your Project"
              : "Explore Causes"}
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
