import { jwtDecode, JwtPayload } from "jwt-decode";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router";
import { AppDispatch, RootState } from "../redux/store";
import {
  fetchAllTabPermssion,
  fetchApiTabPermssion
} from "../redux/tabPermission/tabPermssionSlice";
import {
  fetchAllGroupPermssion,
  fetchApiGroupPermssion
} from "../redux/groupPermission/groupPermssionSlice";
import { setJwtToken, setState } from "../redux/auth/authSlice";
import { fetchApiSettings } from "../redux/settings/settingSlice";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Spinner
} from "cim-ui-components";
// import { setJwtToken, setState } from "../redux/auth/authSlice";

interface Props {
  enabled: boolean;
}

const JWT_TOKEN_COOKIE_NAME = "jwtToken";
const AUTH_SERVER_URL = import.meta.env.VITE_PUBLIC_AUTH_SERVER_URL;

function getCookie(name: string): string {
  const nameEQ = name + "=";
  const cookies = document.cookie.split(";");

  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return cookie.substring(nameEQ.length);
    }
  }
  return "";
}

function setHalfHourCookie(name: string, value: string) {
  const date = new Date();
  date.setTime(date.getTime() + 30 * 60 * 1000); // 30 minutes from now
  const expires = "; expires=" + date.toUTCString();
  document.cookie = `${name}=${value}${expires}; path=/`;
}

export function AuthProvider({ enabled }: Props) {
  const [searchParams] = useSearchParams()!;
  const dispatch: AppDispatch = useDispatch();
  const [openDialog, setOpenDialog] = useState(false);
  function preparePermissions(token: string, decodedToken: JwtPayload) {
    dispatch(
      fetchApiTabPermssion({
        jwtToken: token,
        ntLogin: decodedToken.sub as string
      })
    );
    dispatch(
      fetchAllTabPermssion({
        jwtToken: token,
        ntLogin: decodedToken.sub as string
      })
    );
    dispatch(
      fetchApiGroupPermssion({
        jwtToken: token,
        ntLogin: decodedToken.sub as string
      })
    );
    dispatch(
      fetchAllGroupPermssion({
        jwtToken: token,
        ntLogin: decodedToken.sub as string
      })
    );
    dispatch(fetchApiSettings());
  }

  useEffect(() => {
    if (!enabled) {
      dispatch(setState("authenticated"));
      setOpenDialog(false);
      return;
    }

    try {
      // Get token from cookies only
      const tokenFromCookie = getCookie(JWT_TOKEN_COOKIE_NAME);

      if (!tokenFromCookie) {
        console.error("No JWT token found in cookies");
        setOpenDialog(true);
        dispatch(setState("unauthenticated"));
        return;
      }

      const decodedToken = jwtDecode(tokenFromCookie);
      if (decodedToken == null || decodedToken.exp == null) {
        setOpenDialog(true);
        dispatch(setState("unauthenticated"));
        return;
      }

      // TODO: Request for a token introspect API to validate token
      // Not a good practice to depend on browser time to validate token expiry.
      // We should have a token introspect API where client can validate the token.
      const now = Date.now() / 1000;
      if (decodedToken.exp < now) {
        console.error("JWT token has expired");
        dispatch(setState("unauthenticated"));
        setOpenDialog(true);
        return;
      }

      // Handle callback ID for redirect
      if (searchParams.get("cbid")) {
        const cbid = searchParams.get("cbid")!;
        const originalSearch = getCookie(cbid);
        if (originalSearch) {
          window.location.search = originalSearch;
          return;
        }
      }

      // Store token in Redux only
      preparePermissions(tokenFromCookie, decodedToken);
      dispatch(setJwtToken(tokenFromCookie));
      dispatch(setState("authenticated"));
      setOpenDialog(false);
    } catch (error) {
      console.error("Authentication error:", error);
      dispatch(setState("unauthenticated"));
      setOpenDialog(true);
    }
  }, []);

  return <AuthDialog open={openDialog} />;
}

export function AuthDialog({ open }: { open: boolean }) {
  const state = useSelector((state: RootState) => state.auth.state);
  const [searchParams] = useSearchParams()!;

  function redirectToAuthServer() {
    if (searchParams.get("cbid") != null && searchParams.get("cbid")) {
      const callBackUrl = `${AUTH_SERVER_URL}${window.location.href}`;
      window.location.href = callBackUrl;
      return;
    }
    const cbid = Date.now().toString();
    setHalfHourCookie(cbid, window.location.search);
    const callBackUrl = `${AUTH_SERVER_URL}${
      window.location.origin + window.location.pathname
    }?cbid=${cbid}`;
    window.location.href = callBackUrl;
  }

  return (
    <Dialog open={open} modal>
      <DialogContent
        className="max-w-150 sm:max-w-150 gap-6"
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle className="text-xl">
            Welcome to Our Service!
          </DialogTitle>
        </DialogHeader>

        {state === "authenticating" && (
          <div className="flex justify-center p-2">
            <Spinner className="h-8 w-8 text-primary" />
          </div>
        )}

        {state === "unauthenticated" && (
          <div className="space-y-4">
            <DialogDescription className="text-foreground text-sm font-bold">
              To get started, please click the "Login" button below.
            </DialogDescription>
            <p className=" text-muted-foreground text-xs">
              You will be redirected to a secure authentication page where you
              can enter your credentials for our OAuth service. Once
              authenticated, you will be brought back to our application.
            </p>
            <p className="text-sm font-bold">
              Your security and privacy are our top priorities!
            </p>
            <Button
              size="lg"
              className="mx-auto max-w-37.5 w-full mt-2 flex"
              onClick={redirectToAuthServer}
            >
              Login
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
