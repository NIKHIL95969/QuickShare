import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "ShareXYLab - Quick Share & Manage Content",
  description: "A modern platform for sharing and managing content.",
  keywords: ["content sharing", "collaboration", "productivity"],
  authors: [{ name: "ShareXYLab Team" }],
};

let cachedColorVariables: string | null = null;
function generateColorVariables() {
  return "";
}

let cachedSelectionStyles: string | null = null;
function generateSelectionStyles() {
  return `
    ::selection {
      background-color: hsl(var(--primary));
      color: hsl(var(--primary-foreground));
    }
    
    ::-moz-selection {
      background-color: hsl(var(--primary));
      color: hsl(var(--primary-foreground));
    }
  `;
}

const colorVariables = generateColorVariables();
const selectionStyles = generateSelectionStyles();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        <style dangerouslySetInnerHTML={{
          __html: `
            :root {
              ${colorVariables}
            }
            
            ${selectionStyles}
          `
        }} />
      </head>
      <body className="min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
