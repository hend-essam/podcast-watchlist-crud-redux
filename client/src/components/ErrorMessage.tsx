interface ErrorProps {
  error: string;
}

const ErrorMessage = ({ error }: ErrorProps) => {
  const handleReload = () => {
    window.location.reload();
  };
  return (
    <div className="h-full flex flex-col items-center justify-center gap-4">
      <h1 className="xxs:text-4xl xs:text-5xl font-bold text-red-800">
        {error}
      </h1>
      <p className="text-xl text-red-700">Please try again later.</p>
      <button
        onClick={handleReload}
        className="mt-2 px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition"
      >
        Reload
      </button>
    </div>
  );
};

export default ErrorMessage;
