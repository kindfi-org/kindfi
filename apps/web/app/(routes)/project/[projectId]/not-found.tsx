import Link from "next/link";

export default function ProjectNotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16">
      <div className="text-center max-w-lg">
        <h1 className="text-4xl font-bold mb-4">Project Not Found</h1>
        <p className="text-gray-600 mb-8">
          We couldn't find the project you're looking for. It may have been
          removed or the URL might be incorrect.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/"
            className="bg-primary text-white px-6 py-2 rounded-md shadow-sm hover:bg-primary/90 transition-colors"
          >
            Go to Home
          </Link>
          <Link
            href="/projects"
            className="bg-gray-100 text-gray-800 px-6 py-2 rounded-md shadow-sm hover:bg-gray-200 transition-colors"
          >
            Explore Projects
          </Link>
        </div>
      </div>
    </div>
  );
}
