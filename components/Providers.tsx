"use client";

import { SessionProvider } from "next-auth/react";
import SatpamGaib from "@/components/SatpamGaib";
import { ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
  isFriday: boolean;
  isAdmin: boolean;
  hasOrders: boolean;
}

export function Providers({ children, isFriday, isAdmin, hasOrders }: ProvidersProps) {
  return (
    <SessionProvider>
      <SatpamGaib isFriday={isFriday} isAdmin={isAdmin} hasOrders={hasOrders}>
        {children}
      </SatpamGaib>
    </SessionProvider>
  );
}