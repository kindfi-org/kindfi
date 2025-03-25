'use client'
import { useCallback, useState } from 'react'
import { BsStars } from 'react-icons/bs'
import { IoMdArrowForward } from 'react-icons/io'

interface HeroSectionProps {
  title?: React.ReactNode;
  description?: string;
  ctaButtons?: Array<{
    text: string;
    isPrimary?: boolean;
    icon?: React.ReactNode;
    onClick?: () => void;
  }>;
  learnerCount?: number;
}

const HeroSection = ({
  title = (
    <>
      Master Blockchain for{' '}
      <span className="bg-gradient-to-l from-[#000124] to-[#7CC635] bg-clip-text text-transparent">
        Social Impact
      </span>
    </>
  ),
  description = 'Master the technologies that are revolutionizing social impact projects. Learn blockchain fundamentals, Stellar blockchain, and strategies for managing digital assets to create meaningful change.',
  ctaButtons = [],
  learnerCount = 2500,
}: HeroSectionProps) => {
  // active button state
  const [activeButton, setActiveButton] = useState<number>(1)

  // slides content
  const slides = [
    { title: "Master Blockchain for Social Impact", description: "Learn blockchain fundamentals, Stellar blockchain, and strategies for managing digital assets to create meaningful change." },
    { title: "Revolutionize Digital Asset Management", description: "Gain expertise in managing and leveraging digital assets for sustainable social projects." },
    { title: "Build Transformative Blockchain Solutions", description: "Develop innovative blockchain applications that drive positive social change." },
    { title: "Become a Social Impact Blockchain Leader", description: "Acquire cutting-edge skills to lead blockchain initiatives in the social impact sector." }
  ]

  // handle button click
  const handleButtonClick = useCallback((buttonNumber: number): void => {
    setActiveButton(buttonNumber)
  }, [])

  return (
    // hero section
    <div className="bg-stone-100 text-center min-h-screen flex items-center px-4 sm:px-6">
      <div className="w-full md:w-3/4 lg:w-1/2 mx-auto">
        <div>
          <p className="bg-stone-200 text-lime-600 p-2 rounded-lg inline-flex items-center text-xs">
            <BsStars className="inline mr-1" /> KindFi's Education Platform
          </p>
          <h1 className="text-gray-900 text-3xl sm:text-4xl lg:text-5xl font-bold mt-6">
            {slides[activeButton - 1].title}
          </h1>
          <p className="text-[#4B5563] mt-3 sm:mt-4 text-sm sm:text-base">
            {slides[activeButton - 1].description}
          </p>

          {/* call to action home buttons */}
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              className="bg-gradient-to-l from-[#000124] to-[#7CC635] shadow px-4 sm:px-5 py-2 rounded-md flex items-center justify-center gap-2 text-white hover:opacity-90 focus:ring-2 focus:ring-lime-300 focus:outline-none transition-all"
              type="button"
              aria-label="Start Your Journey"
            >
              Start Your Journey
              <IoMdArrowForward className="inline" />
            </button>
            <button
              className="border border-slate-400 shadow px-4 sm:px-5 py-2 rounded-md text-[#4B5563] mt-3 sm:mt-0 hover:bg-gray-50 focus:ring-2 focus:ring-gray-300 focus:outline-none transition-all"
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
                    ? 'bg-[#7CC635] text-white'
                    : 'bg-stone-200 text-[#4B5563] hover:bg-stone-300'
                }`}
                aria-label={`Go to slide ${num}`}
              >
                {num}
              </button>
            ))}
          </div>
          <p className="text-[#4B5563] text-xs">
            Join <span className="font-semibold">2,500+</span> learners
            worldwide
          </p>
        </div>
      </div>
    </div>
  )
}

export { HeroSection }