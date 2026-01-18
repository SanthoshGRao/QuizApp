import CryptoJS from "crypto-js";

export const hashAnswer = (value: string): string => {
  return CryptoJS.SHA256(
    value.trim().toLowerCase()
  ).toString();
};
