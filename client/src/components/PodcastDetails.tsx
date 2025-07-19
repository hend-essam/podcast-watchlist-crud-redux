import { useAppSelector } from "../store/hooks";
import ModalFrame from "./ModalFrame";
import { useAppDispatch } from "../store/hooks";
import { closeModal } from "../store/modalSlice";
import { useState } from "react";

const PodcastDetails = () => {
  const dispatch = useAppDispatch();
  const { data: podcast } = useAppSelector((state) => state.modal);

  if (!podcast) return null;

  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);

  return (
    <ModalFrame
      onClose={() => dispatch(closeModal())}
      title={podcast.title}
      subTitle={`Hosted by ${podcast.host}`}
    >
      <div className="grid grid-cols-2 gap-4 text-green-700">
        <div>
          <p className="font-medium">Category</p>
          <p>{podcast.category}</p>
        </div>

        <div>
          <p className="font-medium">Rating</p>
          <p>{podcast.rating}/5</p>
        </div>
        <div>
          <p className="font-medium">URL</p>
          <a
            href={podcast.url}
            className="text-green-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit Podcast
          </a>
        </div>

        <div>
          <p className="font-medium">Description</p>
          <p className={`${!podcast.description && "text-gray-600"}`}>
            {podcast.description || "No description"}
          </p>
        </div>

        <button
          className="text-white rounded-3xl cursor-pointer font-semibold bg-[#c78a0f7e] mt-6"
          onClick={() => {
            setOpenEdit(!openEdit);
            setOpenDelete(false);
          }}
        >
          Edit
        </button>
        <button
          className="text-white rounded-3xl cursor-pointer font-semibold bg-[#c78a0f7e] mt-6"
          onClick={() => {
            setOpenDelete(!openDelete);
            setOpenEdit(false);
          }}
        >
          Delete
        </button>
        {openEdit && (
          <div className="col-span-2 flex flex-col gap-4 p-4 bg-[#dac8a5] rounded-xl">
            <h4 className="font-medium text-green-700">Edit Podcast</h4>
            <div className="col-span-2 flex gap-5">
              <input
                type="text"
                placeholder="Enter PIN to confirm changes"
                className="flex h-10 w-full rounded-md border px-3 py-2 glass focus-visible:outline-0 focus-visible:border-green-500 "
              />
              <button
                type="submit"
                className="bg-green-700 hover:bg-green-800 h-10 text-white w-[50%] mx-auto cursor-pointer rounded-3xl"
              >
                Start Editing
              </button>
            </div>
          </div>
        )}

        {openDelete && (
          <div className="col-span-2 flex flex-col gap-4 p-4 bg-[#dac8a5] rounded-xl">
            <div className="p-3 bg-red-100 border-l-4 border-red-600 text-red-700">
              <p className="font-medium">
                Warning: This action cannot be undone
              </p>
              <p className="text-sm">
                All podcast data will be permanently deleted.
              </p>
            </div>
            <div className="col-span-2 flex gap-5">
              <input
                type="text"
                placeholder="Enter PIN to confirm deletion"
                className="flex h-10 w-full rounded-md border px-3 py-2 glass focus-visible:outline-0 focus-visible:border-green-500 "
              />
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 h-10 text-white w-[50%] mx-auto cursor-pointer rounded-3xl"
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
