export const ALLOWED_PODCAST_DOMAINS = [
  "open.spotify.com",
  "podcasts.apple.com",
  "soundcloud.com",
  "youtube.com",
  "anchor.fm",
  "youtu.be",
] as const;

export const categories = [
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
  INVALID_URL: "Please enter a valid URL (https://example.com)",
  INVALID_DOMAIN: `Allowed domains: ${ALLOWED_PODCAST_DOMAINS.join(", ")}`,
  PIN_REQUIRED: "Please enter PIN",
  TITLE_REQUIRED: "Title is required",
  HOST_REQUIRED: "Host is required",
  CATEGORY_REQUIRED: "Category is required",
  INVALID_PIN: "Invalid PIN or operation failed",
} as const;
