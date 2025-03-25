import React, { forwardRef } from "react"; // Importing React and forwardRef

const CTAButton = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  return (
    <div className="flex justify-center md:justify-start">
      <button
        ref={ref}
        className={`bg-gradient-to-r from-green-600 to-gray-900 text-white font-semibold py-3 px-6 my-4 rounded-xl shadow-lg hover:from-green-500 hover:to-green-700 transition duration-300 ${className}`}
      >
        {" "}
        {/* Button styling */}
        Explore Learning Paths ➔
      </button>
    </div>
  );
});

CTAButton.displayName = "CTAButton";
export { CTAButton };
