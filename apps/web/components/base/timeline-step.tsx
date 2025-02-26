"use client";

import { motion } from "framer-motion";
import Icon from "~/components/base/icon";
import { Card, CardContent, CardTitle, CardDescription } from "~/components/base/card";

interface TimelineStepProps {
  step: {
    icon: string;
    title: string;
    description: string;
  };
  isLeft: boolean;
}

const TimelineStep = ({ step, isLeft }: TimelineStepProps) => {
  return (
    <div className="relative flex w-full py-6 items-center">
      {isLeft ? (
        <>
          <div className="w-1/2 flex justify-end pr-10">
            <motion.div
              initial={{ opacity: 0, x: -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              viewport={{ once: true, amount: 0.2 }}
            >
              <Card className="w-96 h-32 shadow-lg border border-gray-200 flex items-center justify-center text-center">
                <CardContent className="flex flex-col items-center justify-center text-center">
                  <CardTitle className="mb-2">{step.title}</CardTitle>
                  <CardDescription className="leading-relaxed">{step.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              viewport={{ once: true, amount: 0.2 }}
            >
              <div className="w-10 h-10 bg-gray-500 text-white flex items-center justify-center rounded-full shadow-lg">
                <Icon name={step.icon} className="w-5 h-5 text-white" />
              </div>
            </motion.div>
          </div>
          <div className="w-1/2" />
        </>
      ) : (
        <>
          <div className="w-1/2" />
          <div className="absolute left-1/2 transform -translate-x-1/2 flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
              viewport={{ once: true, amount: 0.2 }}
            >
              <div className="w-10 h-10 bg-gray-500 text-white flex items-center justify-center rounded-full shadow-lg">
                <Icon name={step.icon} className="w-5 h-5 text-white" />
              </div>
            </motion.div>
          </div>
          <div className="w-1/2 flex justify-start pl-10">
            <motion.div
              initial={{ opacity: 0, x: 60 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              viewport={{ once: true, amount: 0.2 }}
            >
              <Card className="w-96 h-32 shadow-lg border border-gray-200 flex items-center justify-center text-center">
                <CardContent className="flex flex-col items-center justify-center text-center">
                  <CardTitle className="mb-2">{step.title}</CardTitle>
                  <CardDescription className="leading-relaxed">{step.description}</CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
};

export default TimelineStep;
