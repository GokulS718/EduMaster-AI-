import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { LearningProvider } from "@/context/LearningContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "EduMaster AI — 3-Step Adaptive Mastery Engine",
  description: "AI-powered Computer Science learning platform featuring knowledge-based teaching, mock answer evaluation, targeted re-teaching, and 52-week activity analytics.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#060913] text-slate-100 min-h-screen flex flex-col antialiased selection:bg-electric-500 selection:text-white">
        <AuthProvider>
          <LearningProvider>
            {/* Background Grid Pattern & Glows */}
            <div className="fixed inset-0 bg-grid-dots opacity-40 pointer-events-none z-0" />
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-glow-gradient pointer-events-none z-0" />

            <div className="relative z-10 flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
          </LearningProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
