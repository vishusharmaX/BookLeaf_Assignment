import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BookLeaf Author Support & Communication Portal",
  description:
    "Official author portal and intelligent operations support desk for BookLeaf Publishing.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FBF9F5] text-[#1C2420] antialiased">
        {children}
      </body>
    </html>
  );
}
