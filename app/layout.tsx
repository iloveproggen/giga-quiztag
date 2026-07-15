import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import '@mantine/core/styles.css';
import { MantineProvider, createTheme } from '@mantine/core';
import './globals.css';

export const metadata: Metadata = {
  title: 'IOA GigaQuiz 2026',
  description: 'Interaktives Quizboard fuer das IOA GigaQuiz.',
};

const theme = createTheme({
  primaryColor: 'red',
  defaultRadius: 'lg',
  fontFamily:
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="de" className="h-full">
      <body className="min-h-full">
        <MantineProvider theme={theme}>{children}</MantineProvider>
      </body>
    </html>
  );
}
