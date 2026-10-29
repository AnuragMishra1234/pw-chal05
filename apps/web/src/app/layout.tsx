import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Celebration & Event Planner',
  description: 'Universal Generative AI-powered event planning and lifecycle management platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-brand-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
