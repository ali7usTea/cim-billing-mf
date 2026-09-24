"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LayoutProvider } from "../layout/context/layoutcontext";
import { Providers } from "../redux/provider";
import { AuthProvider } from "./AuthProvider";
import { Suspense } from "react";
import Loading from "../app/main/components/Loading";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      retryOnMount: false,
      refetchOnWindowFocus: false
    }
  }
});

export default function ClientProviders({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <LayoutProvider>
        <AuthProvider enabled={true} />
        <QueryClientProvider client={queryClient}>
          <Suspense fallback={<Loading className="my-50" />}>
            {children}
          </Suspense>
        </QueryClientProvider>
      </LayoutProvider>
    </Providers>
  );
}
