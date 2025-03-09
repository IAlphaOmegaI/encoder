import "./globals.css";

import { Geist } from "next/font/google";
import { Toaster } from "@zenncore/ui/components/toaster";
import type { LayoutProps } from "@zenncore/types/navigation";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { NuqsProvider } from "@/components/providers/nuqs-provider";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Suspense } from "react";
import { ModelProvider } from "@/components/providers/model-provider";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default ({ children, action }: LayoutProps<"action">) => {
  return (
    <QueryProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geist.variable} font-sans antialiased min-h-screen min-w-screen bg-background`}
        >
          <ThemeProvider>
            <NuqsProvider>
              <ModelProvider>
                <Suspense>{action}</Suspense>
                <Suspense>{children}</Suspense>
                <Toaster />
              </ModelProvider>
            </NuqsProvider>
          </ThemeProvider>
        </body>
      </html>
      <ReactQueryDevtools />
    </QueryProvider>
  );
};
