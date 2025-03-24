"use client";
import { useState, useCallback } from "react";
import { BsStars } from "react-icons/bs";
import { IoMdArrowForward } from "react-icons/io";

const HeroSection = (): JSX.Element => {
  // active button state
  const [activeButton, setActiveButton] = useState<number>(1);

  // handle button click
  const handleButtonClick = useCallback((buttonNumber: number): void => {
    setActiveButton(buttonNumber);
  }, []);

  return (
    // hero section
    <div className="bg-stone-100 text-center min-h-screen flex items-center px-4 sm:px-6">
      <div className="w-full md:w-3/4 lg:w-1/2 mx-auto">
        <div>
          <p className="bg-stone-200 text-lime-600 p-2 rounded-lg inline-flex items-center text-xs">
            <BsStars className="inline mr-1" /> KindFi's Education Platform
          </p>
          <h1 className="text-gray-900 text-3xl sm:text-4xl lg:text-5xl font-bold mt-6">
            Master Blockchain for{" "}
            <span className="bg-gradient-to-r from-lime-600 to-lime-950 bg-clip-text text-transparent">
              Social Impact
            </span>
          </h1>
          <p className="text-gray-800 mt-3 sm:mt-4 text-sm sm:text-base">
            Master the technologies that are revolutionizing social impact
            projects. Learn blockchain fundamentals, Stellar blockchain, and
            strategies for managing digital assets to create meaningful change.
          </p>
          {/* call to action home buttons */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              className="bg-gradient-to-r from-lime-600 to-lime-950 shadow px-4 sm:px-5 py-2 rounded-md flex items-center justify-center gap-2 text-white hover:opacity-90 focus:ring-2 focus:ring-lime-300 focus:outline-none transition-all"
              type="button"
              aria-label="Start Your Journey"
            >
              Start Your Journey
              <IoMdArrowForward className="inline" />
            </button>
            <button 
              className="border border-slate-400 shadow px-4 sm:px-5 py-2 rounded-md text-gray-700 mt-3 sm:mt-0 hover:bg-gray-50 focus:ring-2 focus:ring-gray-300 focus:outline-none transition-all"
              type="button"
              aria-label="Try Passkey Login"
            >
              Try Passkey Login
            </button>
          </div>
        </div>
        {/* pagination buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-3/4 md:w-1/2 mx-auto mt-8 sm:mt-10 text-xs sm:text-sm justify-center items-center">
          <div className="flex gap-2 mb-3 sm:mb-0">
            {[1, 2, 3, 4].map((num) => (
              <button
                key={num}
                onClick={() => handleButtonClick(num)}
                type="button"
                className={`h-6 w-6 flex items-center justify-center rounded transition-all duration-300 ${
                  activeButton === num
                    ? "bg-lime-600 text-white"
                    : "bg-stone-200 text-gray-700 hover:bg-stone-300"
                }`}
                aria-label={`Go to slide ${num}`}
              >
                {num}
              </button>
            ))}
          </div>
          <p className="text-gray-700 text-xs">
            Join <span className="font-semibold">2,500+</span> learners
            worldwide
          </p>
        </div>
      </div>
    </div>
  );
};

export { HeroSection };
