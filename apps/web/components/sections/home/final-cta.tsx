'use client';

import { motion } from 'framer-motion';
import {
  Apple,
  Facebook,
  Globe,
  Mail,
  Settings,
  Shield,
  Target,
  Zap,
} from 'lucide-react';
import { Card, CardContent } from '~/components/base/card';
import { SocialButton } from '~/components/shared/social-cta';

// Constants
const features: Feature[] = [
  {
    id: 'feature-1',
    icon: <Zap className="w-6 h-6 text-blue-700" />,
    title: 'Intuitive Web3 Interface',
    description:
      'We simplify blockchain interaction for both creators and contributors, offering a seamless, user-friendly experience with digital wallets and smart contracts.',
  },
  {
    id: 'feature-2',
    icon: <Target className="w-6 h-6 text-purple-700" />,
    title: 'Diversified Impact',
    description:
      'Unlock multiple ways to collaborate using Web3 wallets, maximizing social impact and expanding opportunities for meaningful change.',
  },
  {
    id: 'feature-3',
    icon: <Shield className="w-6 h-6 text-blue-700" />,
    title: 'Blockchain Transparency',
    description:
      'Every project is traceable in real-time, showcasing direct impact on the blockchain. This ensures all participants trust that their support reaches its intended destination.',
  },
  {
    id: 'feature-4',
    icon: <Settings className="w-6 h-6 text-purple-700" />,
    title: 'Decentralized Verification with Smart Escrow',
    description:
      'Through a secure escrow system and decentralized validation, we guarantee that every project’s funds are protected and released only when conditions are met.',
  },
];

const socialButtons: SocialButtonProps[] = [
  {
    id: 'email-social-button-id',
    icon: <Mail className="w-5 h-5" />,
    provider: 'Correo',
    onClick: () => console.log('Email login'),
    className: 'bg-teal-600 hover:bg-teal-700 text-white',
  },
  {
    id: 'google-social-button-id',
    icon: <Globe className="w-5 h-5" />,
    provider: 'Google',
    onClick: () => console.log('Google login'),
    className: 'bg-teal-600 hover:bg-teal-700 text-white',
  },
  {
    id: 'facebook-social-button-id',
    icon: <Facebook className="w-5 h-5" />,
    provider: 'Facebook',
    onClick: () => console.log('Facebook login'),
    className: 'bg-teal-600 hover:bg-teal-700 text-white',
  },
  {
    id: 'apple-social-button-id',
    icon: <Apple className="w-5 h-5" />,
    provider: 'Apple',
    onClick: () => console.log('Apple login'),
    className: 'bg-teal-600 hover:bg-teal-700 text-white',
  },
];

// Component
export const FinalCTA = () => {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-bg-blue-purple to-white">
        <div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />
      </div>

      <div className="relative container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
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
                      100+
                    </div>
                    <div className="text-gray-600">Verified Project</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold gradient-text mb-2">
                      $720M
                    </div>
                    <div className="text-gray-600">Capital Raised</div>
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
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Interfaces
interface Feature {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface SocialButtonProps {
  id: string;
  icon: React.ReactNode;
  provider: string;
  onClick: () => void;
  className: string;
}
