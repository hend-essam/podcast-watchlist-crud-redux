import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { closeModal } from "../../store/modalSlice";
import ModalFrame from "../ModalFrame";
import PodcastInfo from "./PodcastInfo";
import EditPodcastForm from "./EditPodcastForm";
import DeletePodcastForm from "./DeletePodcastForm";
import ActionButtons from "./ActionButtons";
import { usePodcastDetails } from "./usePodcastDetails";

const PodcastDetails = () => {
  const dispatch = useAppDispatch();
  const podcast = useAppSelector((state) => state.podcast.singlePodcast);
  const {
    openEdit,
    openDelete,
    setOpenEdit,
    setOpenDelete,
    handleEdit,
    handleDelete,
    editData,
    setEditData,
    pin,
    setPin,
    error,
    setError,
    urlError,
    validateUrl,
  } = usePodcastDetails(podcast);

  if (!podcast) return null;

  const handleClose = () => dispatch(closeModal());

  return (
    <ModalFrame
      onClose={handleClose}
      title={podcast.title}
      subTitle={`Hosted by ${podcast.host}`}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-green-700 max-h-[70vh] overflow-y-auto pr-2">
        <PodcastInfo podcast={podcast} />

        <ActionButtons
          onEdit={() => {
            setOpenEdit(!openEdit);
            setOpenDelete(false);
            setError("");
          }}
          onDelete={() => {
            setOpenDelete(!openDelete);
            setOpenEdit(false);
            setError("");
          }}
        />

        {openEdit && (
          <EditPodcastForm
            editData={editData}
            setEditData={setEditData}
            pin={pin}
            setPin={setPin}
            error={error}
            setError={setError}
            urlError={urlError}
            onSave={handleEdit}
            validateUrl={validateUrl}
          />
        )}

        {openDelete && (
          <DeletePodcastForm
            pin={pin}
            setPin={setPin}
            error={error}
            setError={setError}
            onDelete={handleDelete}
          />
        )}
      </div>
    </ModalFrame>
  );
};

export default PodcastDetails;
