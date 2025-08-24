import { useState } from "react";
import { useAppDispatch } from "../store/hooks";
import { closeModal } from "../store/modalSlice";
import { createPodcast } from "../store/podcastSlice";
import Add from "../icons/Add";
import StarRating from "./StarRating";
import {
  ALLOWED_PODCAST_DOMAINS,
  VALIDATION_MESSAGES,
  CATEGORIES,
} from "../constants";

const AddPodcastForm = () => {
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    title: "",
    host: "",
    url: "",
    category: "",
    pin: "",
    rating: 0,
    description: "",
  });
  const [touched, setTouched] = useState({
    title: false,
    host: false,
    url: false,
    category: false,
    pin: false,
  });
  const [urlError, setUrlError] = useState("");
  const [pinError, setPinError] = useState("");
  const [apiError, setApiError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validateUrl = (url: string): boolean => {
    if (!url) {
      setUrlError(VALIDATION_MESSAGES.URL_REQUIRED);
      return false;
    }

    try {
      const parsedUrl = new URL(url);
      const domain = parsedUrl.hostname.replace("www.", "");
      const isAllowed = ALLOWED_PODCAST_DOMAINS.some(
        (allowed) => domain === allowed || domain.endsWith(`.${allowed}`)
      );

      if (!isAllowed) {
        setUrlError(VALIDATION_MESSAGES.INVALID_DOMAIN);
        return false;
      }

      setUrlError("");
      return true;
    } catch {
      setUrlError(VALIDATION_MESSAGES.INVALID_URL);
      return false;
    }
  };

  const validatePin = (pin: string): boolean => {
    if (!pin) {
      setPinError(VALIDATION_MESSAGES.PIN_REQUIRED);
      return false;
    }

    if (pin.length !== 4) {
      setPinError(VALIDATION_MESSAGES.PIN_INVALID_LENGTH);
      return false;
    }
    setPinError("");
    return true;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    if (!touched[name as keyof typeof touched]) {
      setTouched((prev) => ({
        ...prev,
        [name]: true,
      }));
    }

    if (name === "pin" && value.length > 4) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "url") {
      validateUrl(value);
    }
    if (name === "pin") {
      validatePin(value);
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    if (!touched.category) {
      setTouched((prev) => ({
        ...prev,
        category: true,
      }));
    }

    setFormData((prev) => ({
      ...prev,
      category: value,
    }));
  };

  const handleRatingChange = (newRating: number) => {
    setFormData((prev) => ({
      ...prev,
      rating: newRating,
    }));
  };

  const shouldShowError = (fieldName: keyof typeof touched) => {
    return (touched[fieldName] || isSubmitted) && !formData[fieldName];
  };

  const shouldShowUrlError = () => {
    return (touched.url || isSubmitted) && urlError;
  };

  const isFormValid = () => {
    return (
      !urlError &&
      formData.title &&
      formData.host &&
      formData.url &&
      formData.category &&
      formData.pin &&
      formData.pin.length === 4 &&
      !pinError
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setApiError("");

    if (!validateUrl(formData.url)) {
      return;
    }
    if (!validatePin(formData.pin)) {
      return;
    }

    try {
      await dispatch(
        createPodcast({
          data: {
            title: formData.title,
            host: formData.host,
            url: formData.url,
            category: formData.category,
            rating: formData.rating,
            description: formData.description,
          },
          pin: formData.pin,
        })
      ).unwrap();

      dispatch(closeModal());
    } catch (error) {
      console.error("Failed to add podcast:", error);
      setApiError(
        error instanceof Error ? error.message : "Failed to add podcast"
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-2"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="break-words">
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={`w-full rounded-md border p-2 ${
              shouldShowError("title") ? "border-red-500" : "border-green-800"
            }`}
            placeholder="Enter podcast title"
            required
          />
          {shouldShowError("title") && (
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
            value={formData.host}
            onChange={handleInputChange}
            className={`w-full rounded-md border p-2 ${
              shouldShowError("host") ? "border-red-500" : "border-green-800"
            }`}
            placeholder="Enter host name"
            required
          />
          {shouldShowError("host") && (
            <p className="text-red-500 text-sm mt-1">
              {VALIDATION_MESSAGES.HOST_REQUIRED}
            </p>
          )}
        </div>

        <div className="break-words">
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleCategoryChange}
            className={`w-full rounded-md border p-2 ${
              shouldShowError("category")
                ? "border-red-500"
                : "border-green-800"
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
          {shouldShowError("category") && (
            <p className="text-red-500 text-sm mt-1">
              {VALIDATION_MESSAGES.CATEGORY_REQUIRED}
            </p>
          )}
        </div>

        <div className="break-words">
          <label className="block text-sm font-medium mb-1">Rating</label>
          <StarRating
            rating={formData.rating}
            onRatingChange={handleRatingChange}
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
            value={formData.url}
            onChange={handleInputChange}
            className={`w-full rounded-md border p-2 ${
              shouldShowError("url") || shouldShowUrlError()
                ? "border-red-500"
                : "border-green-800"
            }`}
            placeholder="https://example.com/podcast"
            required
          />
          {shouldShowUrlError() && (
            <p className="text-red-500 text-sm mt-1">{urlError}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Supported platforms: {ALLOWED_PODCAST_DOMAINS.join(", ")}
          </p>
        </div>

        <div className="md:col-span-2 break-words">
          <label className="block text-sm font-medium mb-1">PIN</label>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            name="pin"
            value={formData.pin}
            onChange={handleInputChange}
            onKeyPress={(e) => {
              if (!/[0-9]/.test(e.key)) {
                e.preventDefault();
              }
            }}
            maxLength={4}
            className={`w-full rounded-md border p-2 ${
              shouldShowError("pin") || pinError
                ? "border-red-500"
                : "border-green-800"
            }`}
            placeholder="Enter 4-digit PIN for future edits"
            required
          />
          {pinError && <p className="text-red-500 text-sm mt-1">{pinError}</p>}
          <p className="text-xs text-gray-500 mt-1">
            You'll need this PIN to edit or delete the podcast later
          </p>
        </div>
      </div>

      {apiError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600">
          <p className="text-sm">{apiError}</p>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => dispatch(closeModal())}
          className="mr-3 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!isFormValid()}
          className={`bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded-md flex items-center justify-center gap-2 transition-colors ${
            !isFormValid() ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          <Add />
          Add Podcast
        </button>
      </div>
    </form>
  );
};

export default AddPodcastForm;
