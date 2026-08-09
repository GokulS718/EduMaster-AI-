import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { LearningProvider } from "@/context/LearningContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  title: "EduMaster AI — Dynamic Computer Science Adaptive Learning Engine",
  description: "AI-powered Computer Science & IT learning platform with sub-topics teaching, 2-mark answer evaluation, and 52-week activity analytics.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${plusJakartaSans.variable}`}>
      <body className="bg-[#0B0F19] text-slate-100 min-h-screen flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-white">
        <AuthProvider>
          <LearningProvider>
            {/* Background Grid Pattern & Glows */}
            <div className="fixed inset-0 bg-grid-dots opacity-50 pointer-events-none z-0" />
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent pointer-events-none z-0 blur-3xl" />

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
