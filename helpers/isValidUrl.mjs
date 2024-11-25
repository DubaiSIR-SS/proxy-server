import { allowedDomains } from "./constants.mjs";

const isValidUrl = (string) => {
  try {
    const url = new URL(string);
    console.log(url);
    if (!["http:", "https:"].includes(url.protocol)) return false;
    return allowedDomains.includes(url.origin);
  } catch {
    return false;
  }
};

export default isValidUrl;
