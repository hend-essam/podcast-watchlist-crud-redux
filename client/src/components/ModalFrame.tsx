type ModalFrameProps = {
  title: string;
  subTitle?: string;
  children: React.ReactNode;
  onClose: () => void;
};

const ModalFrame: React.FC<ModalFrameProps> = ({
  title,
  subTitle,
  children,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-[#000000a1] bg-opacity-60">
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 glass p-6 w-full h-fit max-w-2xl mx-auto bg-[#eadcc2] border-[4px] border-double border-[#d89615] rounded-3xl">
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div className="mb-6 min-w-0 break-words flex-1">
              <h2 className="text-2xl font-serif text-green-800 break-words">
                {title}
              </h2>
              {subTitle && (
                <p className="text-green-700 break-words mt-1">{subTitle}</p>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-3xl text-red-700 font-bold cursor-pointer mt-[-7px] flex-shrink-0"
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <>{children}</>
        </div>
      </div>
    </div>
  );
};

export default ModalFrame;
