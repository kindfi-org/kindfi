"use client";

import React from "react";
import { HiShieldCheck } from "react-icons/hi";

interface UpdateCardProps {
  title: string;
  description: string;
  date: string;
  link?: string;
  isExclusive?: boolean;
}

const UpdateCard: React.FC<UpdateCardProps> = ({ title, description, date, link, isExclusive }) => {
  return (
    <div className="bg-white rounded-lg p-4 shadow-md relative border border-gray-200">
      <span className="absolute top-4 right-4 text-sm text-gray-400">{date}</span>
      <h4 className="text-base font-semibold text-black mb-2">{title}</h4>
      <p className="text-sm text-gray-600 mb-2">{description}</p>
      <p className="text-sm font-medium text-blue-600 hover:underline mt-2">Read more</p>
    </div>
  );
};

interface SupporterUpdatesProps {
  updates: UpdateCardProps[];
}

const SupporterUpdates: React.FC<SupporterUpdatesProps> = ({ updates }) => {
  return (
    <section className="mt-6 bg-gray-50 rounded-lg p-6 shadow-md border border-gray-200 relative">
      <div className="absolute top-4 right-6 text-sm text-purple-600 font-medium flex items-center">
        <HiShieldCheck className="w-4 h-4 mr-1" />
        Exclusive Content
      </div>
      <h3 className="text-lg font-bold mb-4">Supporter Updates</h3>
      <div className="space-y-4">
        {updates.map((update, index) => (
          <UpdateCard key={index} {...update} />
        ))}
      </div>
    </section>
  );
};

export default SupporterUpdates;
