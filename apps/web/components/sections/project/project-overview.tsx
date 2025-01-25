"use client";

import React, { useState, JSX } from "react";
import SectionContainer from "~/components/sections/project/section-container";
import AboutProject from "~/components/sections/project/about-project";
import { projectOverviewMediaItems, aboutProjectProps } from "~/mocks/mock-data";
import { FaBullseye, FaUsers, FaGlobe, FaCheckCircle } from "react-icons/fa";

type IconKey = "target" | "user" | "language" | "status";

const ICONS: Record<IconKey, React.JSX.Element> = {
  target: <FaBullseye color="#4F46E5" />,
  user: <FaUsers color="#4F46E5" />,
  language: <FaGlobe color="#4F46E5" />,
  status: <FaCheckCircle color="#4F46E5" />,
};

const ProjectOverview = () => {
  const [mediaList, setMediaList] = useState(projectOverviewMediaItems);

  const handleThumbnailClick = (index: number) => {
    const newMediaList = [...mediaList];
    [newMediaList[0], newMediaList[index]] = [newMediaList[index], newMediaList[0]];
    setMediaList(newMediaList);
  };

  return (
    <SectionContainer>
      <div className="relative w-full h-[500px] bg-gray-100 rounded-lg overflow-hidden mb-10">
        <div className="absolute inset-4 flex items-center justify-center shadow-lg rounded-lg">
          <img
            src={mediaList[0].src}
            alt={mediaList[0].alt}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>

        <div className="absolute bottom-8 left-8 flex space-x-2">
          {mediaList.map((item, index) =>
            index > 0 ? (
              <img
                key={index}
                src={item.src}
                alt={item.alt}
                onClick={() => handleThumbnailClick(index)}
                className="w-24 h-24 rounded object-cover cursor-pointer transition-transform transform hover:scale-105 shadow-sm"
              />
            ) : null
          )}
        </div>
      </div>

      <div className="mt-6">
        <AboutProject
          {...aboutProjectProps}
          highlights={aboutProjectProps.highlights.map((highlight) => ({
            ...highlight,
            icon: ICONS[highlight.icon as IconKey],
          }))}
        />
      </div>
    </SectionContainer>
  );
};

export default ProjectOverview;
