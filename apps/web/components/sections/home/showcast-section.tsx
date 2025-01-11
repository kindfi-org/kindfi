"use client";

import { motion } from "framer-motion";
import {
  ChartBar,
  Clock,
  ShieldCheck,
  Target,
  Users,
  Wallet,
} from "lucide-react";
import { Card, CardContent } from "~/components/base/card";

const LatamWeb3Platform = () => {
  const features = [
    {
      title: "Transparency Powered by Web3",
      description:
        "Every contribution is recorded on the blockchain, providing real-time reports so you always know how and where the funds are being used.",
      icon: <Wallet className="w-6 h-6 text-purple-600" />,
      stats: {
        value: "$720K+",
        label: "USD has helped Social Causes",
      },
    },
    {
      title: "Decentralized Verification",
      description:
        "Each project is carefully reviewed and approved by our team to ensure feasibility, security, and alignment with social impact goals. By leveraging the power of decentralization, we provide unmatched transparency and trust.",
      icon: <ShieldCheck className="w-6 h-6 text-blue-600" />,
      stats: {
        value: "100%",
        label: "Verified Projects",
      },
    },
    {
      title: "Measurable Social Impact",
      description:
        "Track the tangible impact of every project with full transparency, ensuring your contributions drive meaningful change.",
      icon: <Target className="w-6 h-6 text-purple-600" />,
      checkList: [
        "Real-Time Impact Metrics",
        "Social Impact Through Smart Escrows",
        "Transparent Governance",
        "Blockchain-Powered Assurance",
      ],
    },
  ];

  const stats = [
    {
      value: "100%",
      label: "Verified Projects",
      icon: <ShieldCheck className="w-6 h-6 text-blue-600" />,
    },
    {
      value: "0%",
      label: "Hidden Fees",
      icon: <ChartBar className="w-6 h-6 text-blue-600" />,
    },
    {
      value: "24/7",
      label: "Information Availability",
      icon: <Clock className="w-6 h-6 text-blue-600" />,
    },
  ];

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const FeatureCard = ({ title, description, icon, stats, checkList }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="p-3 rounded-xl bg-teal-50">{icon}</div>
        <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
      </div>

      <p className="text-gray-600 mb-6 leading-relaxed">{description}</p>

      {stats && (
        <div className="bg-gradient-to-r from-purple-50 to-purple-50/50 rounded-xl p-4 mb-4">
          <div className="text-2xl font-bold gradient-text mb-1">
            {stats.value}
          </div>
          <div className="text-sm gradient-text">{stats.label}</div>
        </div>
      )}

      {checkList && (
        <ul className="space-y-3">
          {checkList.map((item: string, index: number) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
            <li key={index} className="flex items-center gap-3 text-gray-600">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              {item}
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );

  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <FeatureCard
              key={`feature-${
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                index
                }`}
              {...feature}
            />
          ))}
        </div>

        {/* Bottom Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
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
                  className="text-blue-600 underline hover:text-blue-800"
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
              key={`stat-${
                // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                index
                }`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
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
};

export default LatamWeb3Platform;
