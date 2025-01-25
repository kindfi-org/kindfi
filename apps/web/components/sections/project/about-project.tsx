"use client";

import React from "react";

interface Highlight {
  label: string;
  value: string;
  icon?: React.ReactNode;
}

interface Update {
  title: string;
  description: string;
  date: string;
}

interface AboutProjectProps {
  description: string;
  highlights: Highlight[];
  updates: Update[];
  titleAboveHighlights?: boolean;
}

const AboutProject: React.FC<AboutProjectProps> = ({
  description,
  highlights,
  updates,
  titleAboveHighlights,
}) => {
  return (
    <div className="about-project mt-6 bg-white rounded-lg p-6 shadow-md font-inter">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-black mb-2">About this project</h3>
        <p className="text-gray-600">{description}</p>
      </div>

      <div className="border-t border-gray-200 my-4"></div>

      <div className="project-highlights mb-6">
        <h3 className="text-xl font-bold text-black mb-2">Project Highlights</h3>
        <ul className="grid grid-cols-2 gap-4">
          {highlights.map((highlight, index) => (
            <li key={index} className="flex items-start pl-4">
              {highlight.icon && (
                <span className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full text-sky-500 mr-3">
                  {highlight.icon}
                </span>
              )}
              <div>
                {titleAboveHighlights ? (
                  <>
                    <span className="text-black font-bold mb-1 block">
                      {highlight.label}
                    </span>
                    <span className="text-gray-600">{highlight.value}</span>
                  </>
                ) : (
                  <>
                    <span className="text-black font-bold mr-2">
                      {highlight.label}:
                    </span>
                    {highlight.value}
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t border-gray-200 my-4"></div>

      <div className="latest-updates">
        <h3 className="text-xl font-bold text-black mb-2">Latest Updates</h3>
        <ul>
          {updates.map((update, index) => (
            <li
              key={index}
              className="bg-gray-100 rounded-lg p-4 mb-4 relative"
            >
              <span className="absolute top-2 right-4 text-sm text-gray-400">
                {update.date}
              </span>
              <h4 className="text-black font-bold mb-1">{update.title}</h4>
              <p className="text-gray-600">{update.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AboutProject;
