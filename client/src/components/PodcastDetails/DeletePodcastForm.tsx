interface DeletePodcastFormProps {
  pin: string;
  setPin: (pin: string) => void;
  error: string;
  setError: (error: string) => void;
  onDelete: () => void;
}

const DeletePodcastForm = ({
  pin,
  setPin,
  error,
  setError,
  onDelete,
}: DeletePodcastFormProps) => {
  return (
    <div className="md:col-span-2 flex flex-col gap-4 p-4 bg-[#dac8a5] rounded-xl break-words">
      <div className="p-3 bg-red-100 border-l-4 border-red-600 text-red-700 rounded-r">
        <p className="font-medium">
          ⚠️ Warning: This action cannot be undone
        </p>
        <p className="text-sm mt-1">
          All podcast data will be permanently deleted from your watchlist.
        </p>
      </div>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600">
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="password"
          placeholder="Enter PIN to confirm deletion"
          value={pin}
          onChange={(e) => {
            setPin(e.target.value);
            setError("");
          }}
          className="flex-1 h-10 rounded-md border border-gray-300 px-3 py-2"
          required
        />
        <button
          onClick={onDelete}
          disabled={!pin}
          className={`bg-red-600 hover:bg-red-700 h-10 text-white sm:w-[40%] rounded-3xl transition-colors ${
            !pin ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Delete Permanently
        </button>
      </div>
    </div>
  );
};

export default DeletePodcastForm;