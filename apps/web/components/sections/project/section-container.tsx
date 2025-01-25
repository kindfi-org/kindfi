"use client";

import React from "react";

interface SectionContainerProps {
  title?: string; 
  children: React.ReactNode;
}

const SectionContainer: React.FC<SectionContainerProps> = ({ title, children }) => {
  return (
    <div className="section-container">
      {title && <h1 className="section-title text-xl font-bold mb-4 text-black">{title}</h1>} 
      <div className="section-content">{children}</div>
    </div>
  );
};

export default SectionContainer;
