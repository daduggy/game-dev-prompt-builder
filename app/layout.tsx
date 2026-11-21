import type { Metadata } from "next";
import "@fontsource-variable/geist";
import "./globals.css";

export const metadata: Metadata = {
  title: "Game Dev Prompt Builder",
  description: "Create game projects and build project-aware prompts for art, Blender models, animation, and gameplay scripts.",
  icons: { icon: (process.env.NEXT_PUBLIC_BASE_PATH || "") + "/gamepad.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
