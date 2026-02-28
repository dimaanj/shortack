"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

type QueryClientProviderProps = {
  children: ReactNode;
};

export function QueryClientProviderWrapper({ children }: QueryClientProviderProps) {
  const [client] = useState(() => new QueryClient());

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

