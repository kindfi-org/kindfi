/**
 * Props for the ErrorFallback component that displays error messages
 */
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
    <button
      type="button"
      onClick={() => location.reload()}
      className="px-3 py-1 mt-3 text-white bg-red-600 rounded"
    >
      Reload
    </button>
  </div>
);
