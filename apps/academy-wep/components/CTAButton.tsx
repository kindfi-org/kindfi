import React from "react";
const CTAButton: React.FC = () => {
  const handleClick = () => {
    // Placeholder for future functionality
    console.log("Button clicked!");
  };

  return (
    <div className="flex justify-center md:justify-start">
      <button
        onClick={handleClick}
        className="bg-gradient-to-r from-green-600 to-gray-900 text-white font-semibold py-3 px-6 my-4 rounded-xl shadow-lg hover:from-green-500 hover:to-green-700 transition duration-300"
      >
        Explore Learning Paths ➔
      </button>
    </div>
  );
};

export default CTAButton;
