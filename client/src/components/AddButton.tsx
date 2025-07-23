import Add from "../icons/Add";
import { useAppDispatch } from "../store/hooks";
import { openAddPodcast } from "../store/modalSlice";

const AddButton = () => {
  const dispatch = useAppDispatch();
  return (
    <button
      onClick={() => dispatch(openAddPodcast())}
      className="fixed top-4 right-4 z-5 bg-[#016630] text-white p-2 cursor-pointer rounded-full shadow-md focus:ring-2 focus:ring-[#d9941f]"
    >
      <Add width={24} height={24} />
    </button>
  );
};

export default AddButton;
