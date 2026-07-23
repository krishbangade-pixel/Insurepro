import './globals.css';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/components/auth/AuthProvider';

export const metadata = {
  title: 'InsurePro - Enterprise Insurance Management Platform',
  description: 'Modern enterprise SaaS insurance management suite for policies, claims, and underwriting.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased selection:bg-brand-500 selection:text-white">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <AuthProvider>
            {children}
          </AuthProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#0F172A',
                color: '#F8FAFC',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
                border: '1px solid #334155',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
