// Chage the production/local URL according to the environment
export const REDIRECT_URL_LOCAL = "http://localhost:3000";

export const getRedirectUrl = () => {
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return REDIRECT_URL_LOCAL;
};

export const APP_NAME = "CHAT-APP E";
export const APP_VERSION = "v1.0.4";
export const DEFAULT_BIO = `Hey there! I'm using ${APP_NAME}!`;
export const DARK_THEME = "dark";
export const LIGHT_THEME = "light";
export const LOCAL_STORAGE_KEY = "theme";

// Lengths and limits for various fields
export const MAX_BIO_LENGTH = 140;
export const MAX_NAME_LENGTH = 70;
export const MIN_USERNAME_LENGTH = 4;
export const MAX_USERNAME_LENGTH = 30;
export const MIN_PASSWORD_LENGTH = 8;
export const MINIMUM_SEARCH_LENGTH = 2;
export const MAX_PREFETCHED_CONVERSATIONS = 10;
export const MAX_MESSAGES_PER_PAGE = 25;
export const MAX_MESSAGE_LENGTH = 4000;

// Regex patterns for validation
export const USERNAME_REGEX = /^[A-Za-z0-9_-]+$/;
export const NAME_REGEX = /^(?!.*\s{2})[a-zA-Z0-9 ]+$/;
export const EMAIL_REGEX =
  /^[^\W_]+\w*(?:[.-]\w*)*[^\W_]+@[^\W_]+(?:[.-]?\w*[^\W_]+)*(?:\.[^\W_]{2,})$/;

// Avatar settings
export const MAXIMUM_AVATAR_FILE_SIZE = "5"; // MB
export const ACCEPTED_AVATAR_FILE_TYPES = "image/jpeg,image/png,image/webp";
