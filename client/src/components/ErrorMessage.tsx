import ErrorIcon from "../icons/ErrorIcon";

interface ErrorProps {
  error: string;
}

const ErrorMessage = ({ error }: ErrorProps) => {
  return (
    <div className="max-w-xl mx-auto p-6 bg-red-50 border-l-8 border-red-500 rounded-lg shadow-lg">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 pt-0.5">
          <ErrorIcon />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-red-800">{error}</h1>
          <p className="mt-2 text-lg text-red-700">Please try again later.</p>
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
