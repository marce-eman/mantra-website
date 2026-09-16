"use client";

import { SessionProvider } from "next-auth/react";
import SatpamGaib from "@/components/SatpamGaib";
import { InlineEditProvider } from "@/components/inline-edit";
import { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
  isFriday: boolean;
  isAdmin: boolean;
  hasOrders: boolean;
}

export function Providers({ children, isFriday, isAdmin, hasOrders }: ProvidersProps) {
  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
      <SatpamGaib isFriday={isFriday} isAdmin={isAdmin} hasOrders={hasOrders}>
        <InlineEditProvider>
          {children}
        </InlineEditProvider>
      </SatpamGaib>
    </SessionProvider>
  );
}