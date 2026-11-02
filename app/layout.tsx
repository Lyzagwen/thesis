import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { Sidebar } from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Thesis Topic Recommender — BSCS",
  description:
    "Cleans, clusters, and summarizes past BSCS theses using LDA + BERTopic to help students pick research topics and advisers validate groupings.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10">{children}</main>
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
