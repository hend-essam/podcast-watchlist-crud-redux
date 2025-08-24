import { ALLOWED_PODCAST_DOMAINS, VALIDATION_MESSAGES } from "../../constants";

export const validatePodcastUrl = (url) => {
  if (!url) {
    return { valid: false, error: VALIDATION_MESSAGES.URL_REQUIRED };
  }

  try {
    const parsedUrl = new URL(url);
    const domain = parsedUrl.hostname.replace("www.", "");
    const isAllowed = ALLOWED_PODCAST_DOMAINS.some(
      (allowed) => domain === allowed || domain.endsWith(`.${allowed}`)
    );

    if (!isAllowed) {
      return { valid: false, error: VALIDATION_MESSAGES.INVALID_DOMAIN };
    }

    return { valid: true };
  } catch {
    return { valid: false, error: VALIDATION_MESSAGES.INVALID_URL };
  }
};

export const validatePin = (pin) => {
  if (!pin) {
    return { valid: false, error: VALIDATION_MESSAGES.PIN_REQUIRED };
  }
  if (pin.length !== 4 || !/^\d+$/.test(pin)) {
    return { valid: false, error: VALIDATION_MESSAGES.PIN_INVALID_LENGTH };
  }
  return { valid: true };
};
