'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Card, CardContent } from '~/components/base/card';
import { SocialButton } from '~/components/shared/social-cta';
import { features, socialButtons, statistics } from '~/lib/mock-data/mock-final-cta-section';

export const FinalCTA = () => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-bg-blue-purple to-white" role="presentation" aria-hidden="true">
        <div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" role="presentation" aria-hidden="true" />
      </div>

      <div className="relative container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{
            opacity: 1,
            y: shouldReduceMotion ? 0 : 20
          }}
          viewport={{ once: true }}
          transition={{
            duration: shouldReduceMotion ? 0.3 : 0.6
          }}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Built by Web3 Developers to
            <span className="block gradient-text">Drive Social Change</span>
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            We are the first blockchain platform dedicated to uniting social
            causes and collaborators from the crypto world. Designed to maximize
            social impact across Latin America and beyond, KindFi is building
            the future of social collaboration. With KindFi, you’re part of a
            movement to create real and measurable change.
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Features List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-2 rounded-xl bg-teal-50">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed pl-14">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Cards */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Stats Card */}
            <Card className="bg-white shadow-sm border-gray-100">
              <CardContent className="p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold gradient-text mb-2">
                      {statistics.projects.value}
                    </div>
                    <div className="text-gray-600">{statistics.projects.label}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold gradient-text mb-2">
                      {statistics.capitalRaised.value}
                    </div>
                    <div className="text-gray-600">{statistics.capitalRaised.label}</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CTA Card */}
            <Card className="bg-white border-gray-100 shadow-sm">
              <CardContent className="p-8">
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Ready to Empower Projects?
                </h3>
                <p className="text-gray-600 mb-8">
                  Join the revolution of Web3 impact creators. Be the
                  change-maker that drives social transformation.
                </p>
                <div className="space-y-3">
                  {socialButtons.map((button) => (
                    <SocialButton
                      key={button.id}
                      {...button}
                      className={`w-full ${button.className}`}
                      aria-label={`Sign in with ${button.provider}`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section >
  );
};
