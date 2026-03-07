import type { ReactNode } from "react";

export default function AuthRouteLayout({ children }: { children: ReactNode }) {
  // Root layout adds top padding for the global fixed header.
  // Auth routes hide that header, so we cancel the padding here.
  return <div className="-mt-[148px] md:-mt-[84px]">{children}</div>;
}

