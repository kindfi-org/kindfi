interface ErrorFallbackProps {
  error: Error;
}

export const ErrorFallback = ({ error }: ErrorFallbackProps) => (
  <div role="alert" className="p-4 text-red-600 bg-red-100 rounded">
    <p>Something went wrong:</p>
    <pre className="text-sm">{error.message}</pre>
  </div>
);
