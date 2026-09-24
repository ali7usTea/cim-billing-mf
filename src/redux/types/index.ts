import { JwtPayload } from "jwt-decode";

export interface User {
  id: string;
  name: string;
  email: string;
}

export type AuthenticationStages =
  | "authenticated"
  | "unauthenticated"
  | "authenticating"
  | "error";

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  jwtToken: string | null;
  refreshToken: string | null;
  state: string;
  decodedJwtToken: JwtPayload;
}
