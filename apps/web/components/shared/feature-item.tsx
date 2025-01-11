import React from "react";

// Feature Item Component
interface FeatureItemProps {
  title: string;
  description: string;
}

export const FeatureItem = ({ title, description }: FeatureItemProps) => (
  <div className="mb-8">
    <h3 className="font-semibold mb-2">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);
