"use client";

import React, { useState } from "react";
import SectionContainer from "~/components/sections/project/section-container";
import SuccessGallery from "~/components/sections/project/success-gallery";
import { showcaseData } from "~/mocks/mock-data";

const ProjectShowcaseSection = () => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<{ src: string; type: string } | null>(null);

  const openLightbox = (item: { src: string; type: string }) => {
    setSelectedMedia(item);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setSelectedMedia(null);
    setLightboxOpen(false);
  };

  return (
    <SectionContainer>
      <SuccessGallery
        items={showcaseData.map(({ src, alt }) => ({ src, alt }))}
        onMediaClick={(index) => openLightbox(showcaseData[index])}
      />
      
      {lightboxOpen && selectedMedia && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white text-2xl font-bold"
          >
            &times;
          </button>
          {selectedMedia.type === "image" ? (
            <img src={selectedMedia.src} alt="Showcase" className="max-w-full max-h-full rounded-lg" />
          ) : (
            <video
              src={selectedMedia.src}
              controls
              className="max-w-full max-h-full rounded-lg"
            />
          )}
        </div>
      )}
    </SectionContainer>
  );
};

export default ProjectShowcaseSection;
