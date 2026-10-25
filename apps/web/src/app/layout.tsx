import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { API } from "@/lib/api";
import "./globals.css";

export const dynamic = "force-dynamic";
export async function generateMetadata(): Promise<Metadata> {
  try {
    const response = await fetch(`${API}/seo`, { cache: "no-store" });
    if (response.ok) {
      const seo = await response.json();
      return {
        title: seo.title || "Portfolio — Full Stack Engineer",
        description:
          seo.description || "Selected work, capabilities, and experience.",
        icons: seo.faviconUrl
          ? {
              icon: seo.faviconUrl,
              shortcut: seo.faviconUrl,
              apple: seo.faviconUrl,
            }
          : undefined,
        openGraph: {
          title: seo.title,
          description: seo.description,
          images: seo.imageUrl ? [seo.imageUrl] : [],
        },
      };
    }
  } catch {
    /* The website remains usable if the API is temporarily offline. */
  }
  return {
    title: "Portfolio — Full Stack Engineer",
    description: "Selected work, capabilities, and experience.",
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const themeScript = `try{var t=localStorage.getItem('portfolio-theme');document.documentElement.dataset.theme=(t==='light'||t==='dark')?t:(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light')}catch(e){document.documentElement.dataset.theme='light'}`;
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
