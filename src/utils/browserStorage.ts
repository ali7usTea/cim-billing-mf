// import { clientLogger } from "../clientLogger";

/* To store into localStorage of browser */
export const saveToLocalStorage = (key: string, value: any) => {
  if (typeof window != "undefined") {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

/* to get from localStorage of browser */
export const loadFromLocalStorage = (key: string) => {
  if (typeof window != "undefined") {
    const storeValue = localStorage.getItem(key);
    if (storeValue) {
      return JSON.stringify(storeValue);
    }
  }
  return null;
};

/* To store into sessionStorage of browser */
export const saveToSessionStorage = (key: string, value: any) => {
  if (typeof window != "undefined") {
    sessionStorage.setItem(key, JSON.stringify(value));
  }
};

/* To get from sessionStorage of browser */
export const loadFromSessionStorage = (key: string) => {
  if (typeof window != "undefined") {
    const storeValue = sessionStorage.getItem(key);
    if (storeValue) {
      return JSON.stringify(storeValue);
    }
  }
  return null;
};
