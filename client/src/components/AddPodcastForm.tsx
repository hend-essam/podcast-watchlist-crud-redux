import { useState } from "react";
import { useAppDispatch } from "../store/hooks";
import { closeModal } from "../store/modalSlice";
import { createPodcast } from "../store/podcastSlice";
import Add from "../icons/Add";
import StarRating from "./StarRating";
import {
  ALLOWED_PODCAST_DOMAINS,
  VALIDATION_MESSAGES,
  categories,
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
    createdAt: new Date().toISOString(),
  });
  const [validationError, setValidationError] = useState("");
  const [apiError, setApiError] = useState("");

  const validateUrl = (url: string): boolean => {
    if (!url) {
      setValidationError(VALIDATION_MESSAGES.URL_REQUIRED);
      return false;
    }

    try {
      const parsedUrl = new URL(url);
      const domain = parsedUrl.hostname.replace("www.", "");
      const isAllowed = ALLOWED_PODCAST_DOMAINS.some(
        (allowed) => domain === allowed || domain.endsWith(`.${allowed}`)
      );

      if (!isAllowed) {
        setValidationError(VALIDATION_MESSAGES.INVALID_DOMAIN);
        return false;
      }

      setValidationError("");
      return true;
    } catch {
      setValidationError(VALIDATION_MESSAGES.INVALID_URL);
      return false;
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    if (name === "url") {
      validateUrl(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRatingChange = (newRating: number) => {
    setFormData((prev) => ({
      ...prev,
      rating: newRating,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    if (!validateUrl(formData.url)) {
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
            pin: formData.pin,
            rating: formData.rating,
            description: formData.description,
            createdAt: formData.createdAt,
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
      className="space-y-4 max-h-[70vh] overflow-y-auto pr-2"
    >
      {["title", "host"].map((field) => (
        <div key={field} className="space-y-2">
          <input
            type="text"
            name={field}
            placeholder={`${field.charAt(0).toUpperCase() + field.slice(1)}${
              field === "host" ? " Name" : ""
            }`}
            value={formData[field as keyof typeof formData]}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border px-3 py-2 glass"
            required
          />
        </div>
      ))}

      <div className="space-y-2">
        <input
          type="url"
          name="url"
          placeholder="Podcast URL"
          value={formData.url}
          onChange={handleChange}
          className={`flex h-10 w-full rounded-md border px-3 py-2 glass ${
            validationError ? "border-red-500" : ""
          }`}
          required
        />
        {validationError && (
          <p className="text-red-500 text-sm">{validationError}</p>
        )}
        <p className="text-xs text-gray-400">
          Supported platforms: {ALLOWED_PODCAST_DOMAINS.join(", ")}
        </p>
      </div>

      <div className="space-y-2">
        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="flex h-10 w-full rounded-md border px-3 py-2 glass"
          required
        >
          <option value="" disabled hidden>
            Select a category
          </option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
          className="flex h-20 w-full rounded-md border px-3 py-2 glass"
        />
      </div>

      <div className="flex xxs:flex-col sm:flex-row items-center gap-4">
        <label className="block font-medium">Rating</label>
        <StarRating
          rating={formData.rating}
          onRatingChange={handleRatingChange}
        />
      </div>

      <div className="space-y-2">
        <input
          type="number"
          name="pin"
          placeholder="PIN"
          value={formData.pin}
          onChange={handleChange}
          className="flex h-10 w-full rounded-md border px-3 py-2 glass"
          required
        />
      </div>

      {apiError && (
        <div className="p-2 bg-red-100 text-red-700 rounded-md">{apiError}</div>
      )}

      <button
        type="submit"
        className={`w-full bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2 ${
          validationError ? "opacity-50 cursor-not-allowed" : ""
        }`}
        disabled={!!validationError}
      >
        <Add />
        Add Podcast
      </button>
    </form>
  );
};

export default AddPodcastForm;
