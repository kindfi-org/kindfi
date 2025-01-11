"use client";

import { Card, CardContent } from "~/components/base/card";
import { cn } from "~/lib/utils";

interface StepProps {
  number: number;
  title: string;
  description: string;
  active: boolean;
  isLast: boolean;
}

export const Step = ({
  number,
  title,
  description,
  active,
  isLast,
}: StepProps) => (
  <div className="relative flex flex-1 flex-col items-center">
    {/* Card */}
    <Card
      className={cn(
        "w-full max-w-[250px] bg-white shadow-sm transition-all duration-200",
        "hover:shadow-md hover:-translate-y-1"
      )}
    >
      <CardContent className="p-4">
        <h3 className="font-semibold mb-2">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </CardContent>
    </Card>

    {/* Step Number Circle */}
    <div
      className={cn(
        "mt-4 w-8 h-8 rounded-full flex items-center justify-center z-10",
        "transition-colors duration-200",
        "bg-blue-600 text-white"
      )}
    >
      {number}
    </div>
  </div>
);
