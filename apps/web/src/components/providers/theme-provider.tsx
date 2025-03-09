"use client";

import { ThemeProvider as ThemeProviderPrimitive } from "next-themes";
import { PropsWithChildren } from "react";

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  return <ThemeProviderPrimitive     attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange
  enableColorScheme>{children}</ThemeProviderPrimitive>;
};