import { jwtDecode, JwtPayload } from "jwt-decode";

export const tokenValidate = (token: string): boolean => {
  if (!token) {
    return false;
  }

  const isValidFormat = token.split(".").length === 3;

  let isNotExpired = false;

  if (isValidFormat) {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const currentTime = Date.now() / 1000; // Convert to seconds
      isNotExpired = decoded?.exp ? decoded.exp > currentTime : false;
    } catch (error) {
      return false;
    }
  }

  return isValidFormat && isNotExpired;
};
