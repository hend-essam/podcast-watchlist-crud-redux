import { useState, useEffect } from "react";
import { useAppDispatch } from "../../store/hooks";
import { closeModal } from "../../store/modalSlice";
import { deletePodcastByPin, updatePodcast } from "../../store/podcastSlice";
import { Podcast } from "../../../types";
import {
  ALLOWED_PODCAST_DOMAINS,
  VALIDATION_MESSAGES,
} from "../../../../constants";

export const usePodcastDetails = (podcast: Podcast | null) => {
  const dispatch = useAppDispatch();
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [urlError, setUrlError] = useState("");
  const [editData, setEditData] = useState<Partial<Podcast>>({
    title: "",
    host: "",
    category: "",
    rating: 0,
    url: "",
    description: "",
  });

  useEffect(() => {
    if (podcast) {
      setEditData({
        title: podcast.title,
        host: podcast.host,
        category: podcast.category,
        rating: podcast.rating,
        url: podcast.url,
        description: podcast.description,
      });
      validateUrl(podcast.url);
    }
  }, [podcast]);

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

  const handleDelete = async () => {
    if (!pin) {
      setError(VALIDATION_MESSAGES.PIN_REQUIRED);
      return;
    }
    if (pin.length !== 4) {
      setError("PIN must be exactly 4 digits");
      return;
    }

    if (!podcast) return;

    try {
      await dispatch(deletePodcastByPin({ id: podcast._id, pin })).unwrap();
      setTimeout(() => dispatch(closeModal()), 500);
    } catch (err) {
      setError(VALIDATION_MESSAGES.INVALID_PIN);
    }
  };

  const handleEdit = async () => {
    setError("");
    if (!pin) {
      setError(VALIDATION_MESSAGES.PIN_REQUIRED);
      return;
    }
    if (pin.length !== 4) {
      setError("PIN must be exactly 4 digits");
      return;
    }
    if (!validateUrl(editData.url || "")) {
      return;
    }

    if (!podcast) return;

    try {
      await dispatch(
        updatePodcast({ id: podcast._id, data: editData, pin })
      ).unwrap();
      setError("");
      setTimeout(() => {
        dispatch(closeModal());
        setOpenEdit(false);
      }, 500);
    } catch (err) {
      setError(VALIDATION_MESSAGES.INVALID_PIN);
    }
  };

  return {
    openEdit,
    openDelete,
    setOpenEdit,
    setOpenDelete,
    pin,
    setPin,
    error,
    setError,
    urlError,
    editData,
    setEditData,
    validateUrl,
    handleDelete,
    handleEdit,
    ALLOWED_PODCAST_DOMAINS,
  };
};
