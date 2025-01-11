'use client';

import { Globe, Shield, Users } from 'lucide-react';
import { InvestmentModelCard } from "~/components/shared/investment-model-card";
import { SectionCaption } from "~/components/shared/section-caption";

export const InvestmentModelsSection = () => {
  const models = [
    {
      title: "Secure Escrow",
      description: "Funds are held in a verified escrow account by Trustless work until the project’s goal is met, ensuring the safety and reliability of your contributions.",
      variant: "a" as const,
      icon: <Shield className="w-6 h-6 mb-4 text-emerald-600" />,
      benefits: [
        "Smart Contracts",
        "Secure Fund Custody",
        "Blockchain Transparency"
      ]
    },
    {
      title: "Social ImpactReal",
      description: "Once a project achieves its goal, funds are directly released to the social cause, fully backed by smart contracts to ensure transparency and trust.",
      variant: "b" as const,
      icon: <Users className="w-6 h-6 mb-4 text-blue-600" />,
      benefits: [
        "Impact Reports",
        "Real-Time Tracking",
        "Engaged Communities"
      ]
    },
    {
      title: "Powered by Blockchain and Web3",
      description: "Connect your wallet and participate securely, transparently, and efficiently. Every transaction is recorded on the blockchain.",
      variant: "c" as const,
      icon: <Globe className="w-6 h-6 mb-4 text-teal-600" />,
      benefits: [
        "Instant Transactions",
        "Immutable Records",
        "NFT Certificates and Tokens"
      ]
    }
  ];

  return (
    <section className="w-full px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionCaption
          title="Secure, Transparent, and Powered by Web3"
          subtitle="At KindFi, we ensure that every donation or contribution is backed by the security and transparency of a Web3-based Escrow system. Smart contracts guarantee that funds reach their intended destination to create real impact."

          highlightWords={[
            "Powered by Web3",
          ]} />

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {models.map((model, index) => (
            <InvestmentModelCard
              key={`model-${model.variant}`}
              {...model}
              onLearnMore={() => console.log(`Learn more about model ${model.variant}`)}
            />
          ))}
        </div>
      </div>
    </section>
  );
};