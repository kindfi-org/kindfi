interface ErrorFallbackProps {
  error: Error;
}

export const ErrorFallback = ({ error }: ErrorFallbackProps) => (
  <div
    role="alert"
    aria-live="assertive"
    className="p-4 text-red-600 bg-red-100 border border-red-200 rounded"
  >
    <p>Something went wrong:</p>
    <pre className="text-sm">{error.message}</pre>
  </div>
);
