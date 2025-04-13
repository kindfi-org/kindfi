"use client";
/// inports
import { motion } from "framer-motion";
import { BookOpen, Clock, MessageSquare, ThumbsUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "~/components/base/button";
import { ProgressBar } from "~/components/base/progress-bar";
import type { Module } from "./learning-materials";

interface LearningModuleCardProps {
  module: Module;
  index: number;
}

export function LearningModuleCard({ module, index }: LearningModuleCardProps) {
  const progress = Math.round((module.completed / module.lessons) * 100);

  return (
    <motion.div
      key={module.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className={`group relative overflow-hidden bg-white rounded-2xl transition-all duration-500 hover:shadow-xl flex flex-col h-full border border-gray-100 shadow-sm ${
        !module.unlocked ? "opacity-90" : ""
      }`}
      aria-label={`Module card: ${module.title}`}
    >
      <div className="absolute top-0 right-0 w-12 h-12 bg-gray-50 rounded-bl-2xl z-10 flex items-center justify-center">
        <div className="w-8 h-8 bg-white rounded-bl-xl shadow-sm"></div>
      </div>
      {/* Hover effect background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Card content */}
      <div className="relative z-10 flex flex-col h-full">
        <div className="h-48 bg-gray-100 relative overflow-hidden flex-shrink-0">
          <Image
            src={module.image || "/placeholder.svg"}
            alt={module.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            width={400}
            height={240}
          />

          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="absolute top-3 left-3 z-20">
            <div className="bg-white/90 backdrop-blur-sm py-1 px-3 rounded-full text-xs font-medium shadow-sm">
              {module.category}
            </div>
          </div>

          {module.category === "Blockchain" && (
            <div className="absolute top-3 right-3 bg-blue-600 text-white py-1 px-3 rounded-full text-xs font-medium shadow-sm z-20">
              article
            </div>
          )}
          {module.category === "Stellar" && (
            <div className="absolute top-3 right-3 bg-red-600 text-white py-1 px-3 rounded-full text-xs font-medium shadow-sm z-20">
              video
            </div>
          )}
          {module.category === "Web3" && (
            <div className="absolute top-3 right-3 bg-green-600 text-white py-1 px-3 rounded-full text-xs font-medium shadow-sm z-20">
              guide
            </div>
          )}
          {module.category === "KindFi" && (
            <div className="absolute top-3 right-3 bg-purple-600 text-white py-1 px-3 rounded-full text-xs font-medium shadow-sm z-20">
              tutorial
            </div>
          )}

          {!module.unlocked && (
            <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-30">
              <div className="bg-white rounded-full p-4 shadow-lg transform transition-transform duration-500 hover:scale-110">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-gray-500"
                >
                  <title>Locked Module Icon</title>
                  <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 flex-grow flex flex-col">
          <h3 className="text-xl font-bold mb-2 group-hover:text-[#7CC635] transition-colors duration-300 line-clamp-1">
            {module.title}
          </h3>
          <p className="text-gray-600 mb-4 line-clamp-2 group-hover:text-gray-800 transition-colors duration-300 flex-grow">
            {module.description}
          </p>

          {module.unlocked && (
            <div className="flex items-center gap-4 mb-3">
              <ProgressBar
                value={progress}
                className="flex-grow"
                variant="success"
              />
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 mr-1" />
              {module.completed}/{module.lessons} lessons
            </div>
            <div className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">
              {module.level}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-4 min-h-[28px]">
            {module.tags.map((tag) => (
              <span
                key={tag.toLowerCase().replace(/\s+/g, "-")}
                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="border-t pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mt-auto">
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center">
                <ThumbsUp className="h-4 w-4 mr-1" />
                {module.likes}
              </div>
              <div className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-1" />
                {module.comments}
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                {module.duration}
              </div>
            </div>

            <Link href={`/learn/${module.id}`} className="w-full sm:w-auto">
              <Button
                variant={module.unlocked ? "default" : "outline"}
                size="sm"
                className={`
                  rounded-xl transition-all duration-300 w-full sm:w-auto
                  ${
                    module.unlocked
                      ? "bg-[#7CC635] hover:bg-[#6bb12a] text-white shadow-sm hover:shadow-md"
                      : "border-gray-300"
                  }
                `}
                disabled={!module.unlocked}
              >
                {module.completed > 0 && module.completed < module.lessons
                  ? "Continue"
                  : module.completed === module.lessons
                  ? "Review"
                  : "Start Learning"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
