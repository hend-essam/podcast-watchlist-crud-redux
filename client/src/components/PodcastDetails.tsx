import { useAppSelector } from "../store/hooks";
import ModalFrame from "./ModalFrame";
import { useAppDispatch } from "../store/hooks";
import { closeModal } from "../store/modalSlice";
import { useState } from "react";
import Star from "../icons/Star";
import { deletePodcastByPin, updatePodcast } from "../store/podcastSlice";
import { Podcast } from "../../types";

const PodcastDetails = () => {
  const dispatch = useAppDispatch();
  const { data: podcast } = useAppSelector((state) => state.modal);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [editData, setEditData] = useState<Partial<Podcast>>({
    title: podcast?.title || "",
    host: podcast?.host || "",
    category: podcast?.category || "",
    rating: podcast?.rating || 0,
    url: podcast?.url || "",
    description: podcast?.description || "",
  });

  if (!podcast) return null;

  const handleDelete = async () => {
    if (!pin) {
      setError("Please enter PIN");
      return;
    }

    try {
      await dispatch(deletePodcastByPin({ id: podcast.id, pin })).unwrap();
      setTimeout(() => dispatch(closeModal()), 500);
    } catch (err) {
      setError("Invalid PIN or deletion failed");
    }
  };

  const handleUpdate = async () => {
    if (!pin) {
      setError("Please enter PIN");
      return;
    }

    try {
      await dispatch(
        updatePodcast({ id: podcast.id, data: editData, pin })
      ).unwrap();
      setOpenEdit(false);
      setError("");
      setTimeout(() => dispatch(closeModal()), 500);
    } catch (err) {
      setError("Invalid PIN or update failed");
    }
  };

  const handleEditChange = (
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
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <div
            key={star}
            className={`p-1 rounded-full ${
              star <= rating
                ? "border-2 border-yellow-400 bg-yellow-50"
                : "border-2 border-gray-300"
            }`}
          >
            <div className="w-5 h-5">
              <Star fill={star <= rating ? "#F9B618" : "none"} />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderRatingInput = () => {
    return (
      <div className="flex flex-col gap-2">
        <input
          type="number"
          name="rating"
          min="0"
          max="5"
          value={editData.rating}
          onChange={handleEditChange}
          className="w-full rounded-md border p-2"
        />
        <p className="text-xs text-gray-500">Rate from 0 to 5 stars</p>
      </div>
    );
  };

  return (
    <ModalFrame
      onClose={() => dispatch(closeModal())}
      title={podcast.title}
      subTitle={`Hosted by ${podcast.host}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-green-700 max-h-[70vh] overflow-y-auto pr-2">
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="font-medium">Category</p>
            <p>{podcast.category}</p>
          </div>

          <div>
            <p className="font-medium">Rating</p>
            {renderStars(podcast.rating)}
          </div>

          <div className="sm:col-span-2">
            <p className="font-medium">URL</p>
            <a
              href={podcast.url}
              className="text-green-600 hover:underline break-all"
              target="_blank"
              rel="noopener noreferrer"
            >
              {podcast.url}
            </a>
          </div>

          <div className="sm:col-span-2">
            <p className="font-medium">Description</p>
            <p className={`${!podcast.description && "text-gray-600"}`}>
              {podcast.description || "No description"}
            </p>
          </div>
        </div>

        <div className="md:col-span-2 flex flex-col sm:flex-row gap-2 justify-between items-center">
          <button
            className="text-white w-full sm:w-auto rounded-3xl cursor-pointer font-semibold bg-[#c78a0f7e] py-2 px-4"
            onClick={() => {
              setOpenEdit(!openEdit);
              setOpenDelete(false);
              setError("");
            }}
          >
            Edit
          </button>
          <button
            className="text-white w-full sm:w-auto rounded-3xl cursor-pointer font-semibold bg-[#c78a0f7e] py-2 px-4"
            onClick={() => {
              setOpenDelete(!openDelete);
              setOpenEdit(false);
              setError("");
            }}
          >
            Delete
          </button>
        </div>

        {openEdit && (
          <div className="md:col-span-2 flex flex-col gap-4 p-4 bg-[#dac8a5] rounded-xl">
            <h4 className="font-medium text-green-700">Edit Podcast</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Title</label>
                <input
                  type="text"
                  name="title"
                  value={editData.title}
                  onChange={handleEditChange}
                  className="w-full rounded-md border p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Host</label>
                <input
                  type="text"
                  name="host"
                  value={editData.host}
                  onChange={handleEditChange}
                  className="w-full rounded-md border p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Category</label>
                <input
                  type="text"
                  name="category"
                  value={editData.category}
                  onChange={handleEditChange}
                  className="w-full rounded-md border p-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Rating</label>
                {renderRatingInput()}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium">URL</label>
                <input
                  type="url"
                  name="url"
                  value={editData.url}
                  onChange={handleEditChange}
                  className="w-full rounded-md border p-2"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium">Description</label>
                <textarea
                  name="description"
                  value={editData.description}
                  onChange={handleEditChange}
                  className="w-full rounded-md border p-2"
                  rows={3}
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="password"
                placeholder="Enter PIN to confirm changes"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError("");
                }}
                className="flex-1 h-10 rounded-md border px-3 py-2 glass focus-visible:outline-0 focus-visible:border-green-500"
              />
              <button
                onClick={handleUpdate}
                className="bg-green-700 hover:bg-green-800 h-10 text-white sm:w-[40%] cursor-pointer rounded-3xl"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

        {openDelete && (
          <div className="md:col-span-2 flex flex-col gap-4 p-4 bg-[#dac8a5] rounded-xl">
            <div className="p-3 bg-red-100 border-l-4 border-red-600 text-red-700">
              <p className="font-medium">
                Warning: This action cannot be undone
              </p>
              <p className="text-sm">
                All podcast data will be permanently deleted.
              </p>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="password"
                placeholder="Enter PIN to confirm deletion"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setError("");
                }}
                className="flex-1 h-10 rounded-md border px-3 py-2 glass focus-visible:outline-0 focus-visible:border-green-500"
              />
              <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 h-10 text-white sm:w-[40%] cursor-pointer rounded-3xl"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        )}
      </div>
    </ModalFrame>
  );
};

export default PodcastDetails;
