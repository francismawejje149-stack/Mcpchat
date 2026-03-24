import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Company Assistant",
  description: "Production-ready company assistant"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
