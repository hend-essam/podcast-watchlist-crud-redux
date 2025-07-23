import { useState } from "react";
import { useAppDispatch } from "../store/hooks";
import { closeModal } from "../store/modalSlice";
import { createPodcast } from "../store/podcastSlice";
import Add from "../icons/Add";
import StarRating from "./StarRating";
import { categories } from "../data";

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

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
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
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-h-[70vh] overflow-y-auto pr-2"
    >
      {["title", "host", "url"].map((field) => (
        <div key={field} className="space-y-2">
          <input
            type={field === "url" ? "url" : "text"}
            name={field}
            placeholder={
              field === "url"
                ? "Podcast URL"
                : `${field.charAt(0).toUpperCase() + field.slice(1)}${
                    field === "host" ? " Name" : ""
                  }`
            }
            value={formData[field as keyof typeof formData]}
            onChange={handleChange}
            className="flex h-10 w-full rounded-md border px-3 py-2 glass"
            required
          />
        </div>
      ))}

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
        <StarRating value={formData.rating} onChange={handleRatingChange} />
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
      <button
        type="submit"
        className="w-full bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md flex items-center justify-center gap-2"
      >
        <Add />
        Add Podcast
      </button>
    </form>
  );
};

export default AddPodcastForm;
