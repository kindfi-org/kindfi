import type React from "react";

import { CircleCheckBig, Clock, Play } from "lucide-react";

import { Button } from "../base/button";
import { Card, CardContent } from "../base/card";

type LessonStatus = "completed" | "ready" | "locked";
interface Lesson {
  id: number;
  title: string;
  description: string;
  duration: string;
  status: LessonStatus;
}

const Lessons: Lesson[] = [
  {
    id: 1,
    title: "Introduction to Stellar",
    description: "Learn about the Stellar blockchain and its purpose.",
    duration: "15 min",
    status: "completed",
  },
  {
    id: 2,
    title: "Consensus Mechanism",
    description: "Understand how the Stellar Consensus Protocol works.",
    duration: "20 min",
    status: "completed",
  },
  {
    id: 3,
    title: "Consensus Mechanism",
    description: "Understand how the Stellar Consensus Protocol works.",
    duration: "20 min",
    status: "ready",
  },
  {
    id: 4,
    title: "Consensus Mechanism",
    description: "Understand how the Stellar Consensus Protocol works.",
    duration: "20 min",
    status: "locked",
  },
  // Add more lessons as needed
];

const ModuleLessons: React.FC = () => {
  return (
    <>
      <main className="p-10">
        <div className="flex items-center mb-6 gap-12 ">
          <h2 className="text-2xl font-bold text-gray-900 ">Module Lessons</h2>
          <div className="h-[1px] w-[55rem] bg-gray-200 " />
        </div>

        <div className="space-y-4">
          {Lessons.length === 0 && (
            <div className="text-center text-gray-500 p-6">
              <p className="text-lg">No lessons available for this module.</p>
            </div>
          )}

          {Lessons.map((lesson) => (
            <Card
              key={lesson.id}
              className={`border-gray-200 ${lesson.status === "completed" ? "bg-[#7CC6351A]" : "bg-white"} cursor-pointer border  hover:border-[#7CC635] py-4 hover:shadow-lg transition-all duration-300 hover:bg-white`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex gap-4">
                    <div className="relative">
                      <div className="relative ">
                        <div
                          className={`w-10 h-10 ${lesson.status === "completed" || lesson.status === "locked" ? "bg-[#7CC635] bg-opacity-20" : "bg-gray-200"}   rounded-lg flex items-center justify-center`}
                        >
                          {lesson.status === "completed" ? (
                            <CircleCheckBig className="size-5 text-[#7CC635]" />
                          ) : lesson.status === "ready" ? (
                            <p className="text-gray-400 font-semibold text-lg">
                              {lesson.id}
                            </p>
                          ) : (
                            <p className="text-[#7CC635] font-semibold text-lg">
                              {lesson.id}
                            </p>
                          )}
                        </div>
                        <div
                          className={`h-[90px] w-[2px] ${lesson.status === "completed" ? "bg-[#7CC635] bg-opacity-90" : "bg-gray-300"}  rounded-full absolute -left-1`}
                        />
                      </div>
                    </div>
                    <div>
                      <h3
                        className={`font-semibold ${lesson.status === "locked" ? "text-[#7CC635]" : "text-gray-900"} mb-1 text-xl`}
                      >
                        {lesson.title}
                      </h3>
                      <p className="text-gray-500 mb-2 text-lg font-medium">
                        {lesson.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span className="font-semibold">
                            {lesson.duration}
                          </span>
                        </div>
                        {lesson.status === "completed" && (
                          <div className="flex items-center gap-1 text-[#7CC635]">
                            <CircleCheckBig className="w-4 h-4" />
                            <span className="text-[#7CC635] font-semibold">
                              Completed
                            </span>
                          </div>
                        )}
                        {lesson.status === "ready" && (
                          <div className="flex items-center gap-1 text-[#7CC635]">
                            <span className="text-[#007BFF] font-semibold">
                              Ready to Start
                            </span>
                          </div>
                        )}
                        {lesson.status === "locked" && (
                          <div className="flex items-center gap-1 text-[#7CC635]">
                            <span className="text-black font-semibold">
                              Locked
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {lesson.status === "ready" && (
                    <Button variant="default" size="lg" className="">
                      <Play />
                      Start Lesson
                    </Button>
                  )}
                  {lesson.status === "completed" && (
                    <Button
                      variant="outline"
                      size="lg"
                      className="text-[#7CC635] border-[#7CC635] hover:bg-green-50"
                    >
                      Review Lesson
                    </Button>
                  )}
                  {lesson.status === "locked" && (
                    <Button variant="default" size="lg" className="" disabled>
                      <Play />
                      Start Lesson
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
};

export default ModuleLessons;
