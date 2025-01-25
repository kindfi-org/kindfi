"use client";

import React from "react";

interface SuccessGalleryProps {
  items: { src: string; alt: string }[];
  onMediaClick?: (index: number) => void; 
}

const SuccessGallery: React.FC<SuccessGalleryProps> = ({ items, onMediaClick }) => {
  return (
    <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold mb-4">Success Gallery</h3>
        <button className="text-sm font-medium text-blue-600 hover:underline">View All</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {items.map((item, index) => (
          <div
            key={index}
            className="w-full h-40 bg-gray-100 rounded-lg overflow-hidden shadow-sm cursor-pointer"
            onClick={() => onMediaClick?.(index)} 
          >
            <img
              src={item.src}
              alt={item.alt}
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuccessGallery;
