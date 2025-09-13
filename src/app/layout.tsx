import type { Metadata } from "next";
import { DM_Sans } from "next/font/google"; // ✅ Import DM Sans
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import { LayoutProvider } from "@/hooks/use-layout"
import { getColors } from "@/lib/colors"
import AuthSessionProvider from "@/components/providers/session-provider"

// Load DM Sans instead of Inter
const dmSans = DM_Sans({ subsets: ["latin"]});

export const metadata: Metadata = {
  title: "QuickShare - Share & Manage Content",
  description: "A modern platform for sharing and managing content with real-time collaboration and temporary sharing options.",
  keywords: ["content sharing", "task management", "collaboration", "productivity"],
  authors: [{ name: "QuickShare Team" }],
};

// Generate CSS variables for colors
function generateColorVariables() {
  const colors = getColors();
  const cssVariables = colors.flatMap(palette => 
    palette.colors.map(color => 
      `--color-${color.name}-${color.scale}: ${color.hex};`
    )
  ).join('\n');

  return cssVariables;
}

// Generate text selection styles for each color
function generateSelectionStyles() {
  const colors = getColors();
  const selectionStyles = colors.flatMap(palette => 
    palette.colors.map(color => `
      .text-${color.name}-${color.scale}::selection {
        background-color: ${color.hex};
        color: ${color.foreground};
      }
      
      .bg-${color.name}-${color.scale}::selection {
        background-color: ${color.hex};
        color: ${color.foreground};
      }
      
      .text-${color.name}-${color.scale} ::selection {
        background-color: ${color.hex};
        color: ${color.foreground};
      }
      
      .bg-${color.name}-${color.scale} ::selection {
        background-color: ${color.hex};
        color: ${color.foreground};
      }
    `)
  ).join('\n');

  return `
    /* Base selection styles */
    ::selection {
      background-color: hsl(var(--primary));
      color: hsl(var(--primary-foreground));
    }
    
    ::-moz-selection {
      background-color: hsl(var(--primary));
      color: hsl(var(--primary-foreground));
    }
    
    ${selectionStyles}
  `;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const colorVariables = generateColorVariables();
  const selectionStyles = generateSelectionStyles();

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
      <body className={`${dmSans.className} min-h-screen`}> {/* ✅ Use DM Sans */}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthSessionProvider>
            <LayoutProvider>
              {children}
            </LayoutProvider>
          </AuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
