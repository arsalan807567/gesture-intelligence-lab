import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gesture Intelligence Lab",
  description: "Real-time computer vision and custom ML gesture recognition",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-neutral-950 text-neutral-100 antialiased">
        <nav className="border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
          <span className="font-semibold tracking-tight">
            Gesture Intelligence Lab
          </span>
          <div className="flex gap-6 text-sm text-neutral-400">
            <a href="/studio" className="hover:text-neutral-100 transition">
              Gesture Studio
            </a>
            <a href="/lab" className="hover:text-neutral-100 transition">
              Model Lab
            </a>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
