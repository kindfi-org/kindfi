"use client";

import { InvestmentModelCard } from "~/components/shared/investment-model-card";
import { SectionCaption } from "~/components/shared/section-caption";
import { models } from "~/lib/mock-data/mock-how-it-works-section";
import { HOME as constants } from "~/constants";

export function HowItWorks() {
  return (
    <section className="w-full px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <SectionCaption
          title={constants.CAPTIONS.HOW_IT_WORKS.title}
          subtitle={constants.CAPTIONS.HOW_IT_WORKS.subtitle}
          highlightWords={constants.CAPTIONS.HOW_IT_WORKS.highlighted}
        />

        <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {models.map((model) => (
            <InvestmentModelCard
              key={model.id}
              {...model}
              onLearnMore={() =>
                console.log(`Learn more about model ${model.variant}`)
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
