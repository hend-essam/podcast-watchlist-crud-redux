export const ALLOWED_PODCAST_DOMAINS = [
  "open.spotify.com",
  "podcasts.apple.com",
  "soundcloud.com",
  "youtube.com",
  "anchor.fm",
  "youtu.be",
] as const;

export const CATEGORIES = [
  "News & Politics",
  "Business & Finance",
  "Technology",
  "Health",
  "Comedy",
  "Science",
  "History",
  "Education",
  "Entertainment",
  "Sports",
  "Society & Culture",
  "Music",
  "Travel",
  "Food",
  "Gaming",
  "Art & Design",
  "Other",
];

export const VALIDATION_MESSAGES = {
  URL_REQUIRED: "URL is required",
  TITLE_REQUIRED: "Title is required",
  HOST_REQUIRED: "Host is required",
  CATEGORY_REQUIRED: "Category is required",
  INVALID_URL: "Invalid URL format. Please provide a valid HTTP/HTTPS URL",
  INVALID_DOMAIN: `Unsupported podcast platform. Allowed domains: ${ALLOWED_PODCAST_DOMAINS.join(
    ", "
  )}`,
  PIN_REQUIRED: "PIN is required",
  PIN_INVALID_LENGTH: "PIN must be exactly 4 digits",
  INVALID_PIN: "Invalid PIN",
} as const;
