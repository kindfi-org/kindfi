"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { BenefitItem } from "~/components/shared/benefits-items";
import { CTAForm } from "~/components/shared/cta-form";
import { Testimonial } from "~/components/shared/testimonial-card";
import { benefits, testimonialData } from "~/constants/community-data";

export function Community() {
  const prefersReducedMotion = useReducedMotion();
  const [formStatus, setFormStatus] = useState<FormStatus | null>(null);

  const handleFormSubmission = async (data: FormData) => {
    setFormStatus(null);
    try {
      // Possibly set a "loading" status and disable form to prevent multiple submissions
      await submitForm(data);
      setFormStatus({
        type: "success",
        message: "Form submitted successfully!",
      });
    } catch (error) {
      console.error(error); // Logs the error for debugging
      setFormStatus({
        type: "error",
        message: "Failed to submit the form. Please try again.",
      });
    }
  };

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: prefersReducedMotion ? 0 : 0.6, // Respects reduced motion preferences
          }}
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
        <CTAForm onSubmit={handleFormSubmission} />

        {/* Form Status Message */}
        {formStatus && (
          <div
            className={`mt-4 p-4 rounded-lg ${
              formStatus.type === "success"
                ? "bg-green-100 text-green-800"
                : "bg-red-100 text-red-800"
            }`}
          >
            {formStatus.message}
          </div>
        )}
      </div>
    </section>
  );
}

const submitForm = async (data: FormData): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.5) {
        resolve();
      } else {
        reject(new Error("Submission failed"));
      }
    }, 1000);
  });
};

interface FormData {
  name: string;
  project: string;
}

interface FormStatus {
  type: "success" | "error";
  message: string;
}
