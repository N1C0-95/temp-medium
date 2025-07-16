import type { Metadata } from "next";
import "./globals.css";

// 👇 import the providers
import { Providers } from "./providers";
import Navbar from "./shared/components/core/Navbar";
import AppMenu from "./shared/components/core/AppMenu";
import ConfigLoader from "./shared/components/ConfigLoader";



export const metadata: Metadata = {
  title: "AI Translator",
  description: "Translate text and document using AI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {


  
  return (
    <html lang="en">
      <body >        
        {/* 👇 Apply them to children */}
        <Providers>
         <ConfigLoader />
          <Navbar />
          <main className="flex min-h-[calc(100vh-66px)] " >
          <AppMenu />
          {children}
          </main>          
        </Providers>        
      </body>
    </html>
  );
}
