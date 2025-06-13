'use client'

import { Award, BookOpen, Clock } from "lucide-react";

interface CourseStatsProps {
NumberofLesson ?: number;
TotalDuration?: string;
StellarBadge ?: string;	
}

export function CourseStats({
	NumberofLesson = 4,
	TotalDuration = '75 min total',
	StellarBadge = 'Stellar Expert ',		
}: CourseStatsProps) {
	return (
	
	<>
	  {/* Course Stats */}
                <div className="flex items-center gap-6 text-sm text-gray-600 mb-8">
                  <div className="flex items-center gap-1 bg-gray-200 p-2 rounded-lg">
                    <BookOpen className="w-4 h-4 text-[#7CC635] " />
                    <span className="font-medium text-sm">{NumberofLesson} Lessons</span>
                  </div>
                  <div className="flex items-center gap-1 bg-gray-200 p-2 rounded-lg ">
                    <Clock className="w-4 h-4 text-[#7CC635]" />
                    <span className="font-medium text-sm">{TotalDuration}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-gray-200 p-2 rounded-lg">
                    <Award className="w-4 h-4 text-[#7CC635]" />
                    <span className="font-medium text-sm">{StellarBadge} Badge</span>
                  </div>
                </div>
	</>
	)
}
