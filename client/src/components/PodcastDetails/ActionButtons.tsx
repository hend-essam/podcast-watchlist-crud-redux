interface ActionButtonsProps {
  onEdit: () => void;
  onDelete: () => void;
}

const ActionButtons = ({ onEdit, onDelete }: ActionButtonsProps) => {
  return (
    <div className="md:col-span-2 flex flex-col sm:flex-row gap-2 justify-between items-center">
      <button
        className="text-white w-full sm:w-auto rounded-3xl cursor-pointer font-semibold bg-[#c78a0f7e] hover:bg-[#c78a0f] transition-colors py-2 px-4"
        onClick={onEdit}
      >
        Edit
      </button>
      <button
        className="text-white w-full sm:w-auto rounded-3xl cursor-pointer font-semibold bg-[#c78a0f7e] hover:bg-[#c78a0f] transition-colors py-2 px-4"
        onClick={onDelete}
      >
        Delete
      </button>
    </div>
  );
};

export default ActionButtons;