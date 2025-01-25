"use client";

import React from "react";
import SectionContainer from "~/components/sections/project/section-container";
import ImpactCards from "~/components/sections/project/impact-cards";
import SupporterUpdates from "~/components/sections/project/supporter-updates";
import { statsData, updatesData } from "~/mocks/mock-data";

const YourImpactSection = () => {
  return (
    <SectionContainer>
      <div className="relative w-full h-[500px] bg-gray-100 rounded-lg overflow-hidden shadow-lg">
        <img
          src="/images/video.png"
          alt="Main Video"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="bg-gray-50 rounded-lg p-6 shadow-lg border border-gray-200 mt-6">
        <h2 className="text-xl font-semibold text-black mb-4">Your Impact</h2>
        <ImpactCards data={statsData} />
      </div>

      <div className="mt-6">
        <SupporterUpdates updates={updatesData} />
      </div>
    </SectionContainer>
  );
};

export default YourImpactSection;
