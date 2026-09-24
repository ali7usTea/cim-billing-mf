import { createAsyncThunk } from "@reduxjs/toolkit";

export const callAuthLoginApiRouteHandler = createAsyncThunk(
  "Auth/login",
  async () => {
    window.location.href = import.meta.env.VITE_PUBLIC_SSO_AUTH_URL as string;
    return;
  }
);

export const callAuthLogoutApiRouteHandler = createAsyncThunk(
  "Auth/logout",
  async () => {
    const url = `/billing/logout/api/`;
    const result = await fetch(url, {
      cache: "no-store"
    });
    console.log(result);
    const data = await result.json();

    if (result.ok && data.url) {
      // Redirect the client to the OAuth URL
      window.location.href = data.url;
    } else {
      console.error("Login failed:", data.message);
      // Handle error result if needed
    }

    if (!result.ok) {
      throw new Error("Failed to fetch Tab permission  ");
    }
    return data;
  }
);

export const callAuthLoginAPIonBFF = createAsyncThunk(
  "Auth/login-page",
  async ({ email, password }: { email: string; password: string }) => {
    console.log(process);
    const result = await fetch(
      import.meta.env.VITE_PUBLIC_AUTH_LOGIN_URL as string,
      {
        method: "POST", // Change the method to POST
        headers: {
          "Content-Type": "application/json" // Ensure the body is sent as JSON
        },
        body: JSON.stringify({
          email, // Include email in the request body
          password // Include password in the request body
        }),
        cache: "no-store"
      }
    );

    console.log(result);
    const data = await result.json();

    if (result.ok && data.url) {
    } else {
      console.error("Login failed:", data.message);
      // Handle error result if needed
    }

    if (!result.ok) {
      throw new Error("Failed to fetch Tab permission  ");
    }
    return data;
  }
);
