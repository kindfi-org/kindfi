"use client";

import React from "react";

interface ImpactCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  bgColor?: string;
  textColor?: string;
}

const ImpactCard: React.FC<ImpactCardProps> = ({
  icon,
  label,
  value,
  bgColor = "bg-blue-100",
  textColor = "text-blue-800",
}) => {
  return (
    <div className={`rounded-lg p-4 shadow-sm ${bgColor} flex flex-col items-start`}>
      <div className="flex items-center mb-2">
        <span className={`text-lg mr-2 ${textColor}`}>{icon}</span>
        <p className="text-sm font-medium text-gray-600">{label}</p>
      </div>
      <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
    </div>
  );
};

interface ImpactCardsProps {
  data: {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    bgColor?: string;
    textColor?: string;
  }[];
}

const ImpactCards: React.FC<ImpactCardsProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {data.map((item, index) => (
        <ImpactCard
          key={index}
          icon={item.icon}
          label={item.label}
          value={item.value}
          bgColor={item.bgColor}
          textColor={item.textColor}
        />
      ))}
    </div>
  );
};

export default ImpactCards;
