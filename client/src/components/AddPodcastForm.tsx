import { useAppDispatch } from "../store/hooks";
import { closeModal } from "../store/modalSlice";
import Add from "../icons/Add";

const AddPodcastForm = () => {
  const dispatch = useAppDispatch();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(closeModal());
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Podcast Title"
          className="flex h-10 w-full rounded-md border px-3 py-2 glass"
        />
      </div>
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Host Name"
          className="flex h-10 w-full rounded-md border px-3 py-2 glass"
        />
      </div>
      <div className="space-y-2">
        <input
          type="url"
          placeholder="Podcast URL"
          className="flex h-10 w-full rounded-md border px-3 py-2 glass"
        />
      </div>
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Category"
          className="flex h-10 w-full rounded-md border px-3 py-2 glass"
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
