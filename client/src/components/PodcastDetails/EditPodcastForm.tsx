import { Podcast } from "../../../types";
import {
  ALLOWED_PODCAST_DOMAINS,
  CATEGORIES,
  VALIDATION_MESSAGES,
} from "../../constants";
import StarRating from "../StarRating";

interface EditPodcastFormProps {
  editData: Partial<Podcast>;
  setEditData: React.Dispatch<React.SetStateAction<Partial<Podcast>>>;
  pin: string;
  setPin: (pin: string) => void;
  error: string;
  setError: (error: string) => void;
  urlError: string;
  onSave: () => void;
  validateUrl: (url: string) => boolean;
}

const EditPodcastForm = ({
  editData,
  setEditData,
  pin,
  setPin,
  error,
  setError,
  urlError,
  onSave,
  validateUrl,
}: EditPodcastFormProps) => {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setEditData((prev) => ({
      ...prev,
      [name]:
        name === "rating"
          ? Math.min(5, Math.max(0, parseInt(value) || 0))
          : value,
    }));

    if (name === "url") {
      validateUrl(value);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEditData((prev) => ({
      ...prev,
      category: e.target.value,
    }));
  };

  const isFormValid = () => {
    return (
      !urlError &&
      editData.title &&
      editData.host &&
      editData.url &&
      editData.category &&
      pin.length === 4
    );
  };

  return (
    <div className="md:col-span-2 flex flex-col gap-4 p-4 bg-[#dac8a5] rounded-xl break-words">
      <h4 className="font-medium text-green-700">Edit Podcast</h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="break-words">
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={editData.title || ""}
            onChange={handleInputChange}
            className={`w-full rounded-md border p-2 ${
              !editData.title ? "border-red-500" : "border-gray-300"
            }`}
            required
          />
          {!editData.title && (
            <p className="text-red-500 text-sm mt-1">
              {VALIDATION_MESSAGES.TITLE_REQUIRED}
            </p>
          )}
        </div>

        <div className="break-words">
          <label className="block text-sm font-medium mb-1">Host</label>
          <input
            type="text"
            name="host"
            value={editData.host || ""}
            onChange={handleInputChange}
            className={`w-full rounded-md border p-2 ${
              !editData.host ? "border-red-500" : "border-gray-300"
            }`}
            required
          />
          {!editData.host && (
            <p className="text-red-500 text-sm mt-1">
              {VALIDATION_MESSAGES.HOST_REQUIRED}
            </p>
          )}
        </div>

        <div className="break-words">
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            name="category"
            value={editData.category || ""}
            onChange={handleCategoryChange}
            className={`w-full rounded-md border p-2 ${
              !editData.category ? "border-red-500" : "border-gray-300"
            }`}
            required
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          {!editData.category && (
            <p className="text-red-500 text-sm mt-1">
              {VALIDATION_MESSAGES.CATEGORY_REQUIRED}
            </p>
          )}
        </div>

        <div className="break-words">
          <label className="block text-sm font-medium mb-1">Rating</label>
          <StarRating
            rating={editData.rating || 0}
            onRatingChange={(rating) =>
              setEditData((prev) => ({ ...prev, rating }))
            }
          />
          <p className="text-xs text-gray-500 mt-1">
            Click stars to rate from 0 to 5
          </p>
        </div>

        <div className="md:col-span-2 break-words">
          <label className="block text-sm font-medium mb-1">URL</label>
          <input
            type="url"
            name="url"
            value={editData.url || ""}
            onChange={handleInputChange}
            className={`w-full rounded-md border p-2 ${
              !editData.url || urlError ? "border-red-500" : "border-gray-300"
            }`}
            required
          />
          {urlError && <p className="text-red-500 text-sm mt-1">{urlError}</p>}
          <p className="text-xs text-gray-500 mt-1">
            Supported platforms: {ALLOWED_PODCAST_DOMAINS.join(", ")}
          </p>
        </div>

        <div className="md:col-span-2 break-words">
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={editData.description || ""}
            onChange={handleInputChange}
            className="w-full rounded-md border border-gray-300 p-2"
            rows={3}
            placeholder="Add a description (optional)"
          />
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex flex-col sm:flex-row gap-4">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={4}
          placeholder="Enter 4-digit PIN to confirm changes"
          value={pin}
          onChange={(e) => {
            const value = e.target.value;
            if (value.length <= 4) {
              setPin(value);
              setError("");
            }
          }}
          onKeyPress={(e) => {
            if (!/[0-9]/.test(e.key)) {
              e.preventDefault();
            }
          }}
          className="flex-1 h-10 rounded-md border border-gray-300 px-3 py-2"
          required
        />
        <button
          onClick={onSave}
          disabled={!isFormValid()}
          className={`bg-green-700 hover:bg-green-800 h-10 text-white sm:w-[40%] rounded-3xl transition-colors ${
            !isFormValid() ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default EditPodcastForm;
