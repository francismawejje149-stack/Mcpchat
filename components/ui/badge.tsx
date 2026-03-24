import { ReactNode } from "react";
export function Badge({ children }: { children: ReactNode }) {
  return <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">{children}</span>;
}
