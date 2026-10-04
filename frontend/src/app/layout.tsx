import type { Metadata } from 'next';
import '../styles/globals.css';
import { ToastProvider } from '../context/ToastContext';
import { AuthProvider } from '../context/AuthContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { LoginModal } from '../components/LoginModal';
import { OfflineBanner } from '../components/OfflineBanner';

export const metadata: Metadata = {
  title: 'AI Hiking Explorer - Discover Trails, Weather & AI Trip Planning',
  description:
    'Plan safe, breathtaking hiking trips with AI-powered natural language trail search, elevation analysis, weather hazard alerts, and dynamic packing checklists.',
  keywords: [
    'hiking',
    'trails',
    'AI trail planner',
    'trekking',
    'Delhi hikes',
    'Himalayas trails',
    'elevation profile',
    'hiking packing list',
  ],
  authors: [{ name: 'Rishank Kesarwani' }],
  openGraph: {
    title: 'AI Hiking Explorer',
    description: 'AI-Powered Trail Discovery & Expedition Planning',
    url: 'https://hiking-explorer.rishankkesharwani.com',
    siteName: 'AI Hiking Explorer',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <AuthProvider>
            <OfflineBanner />
            <Navbar />
            <main style={{ minHeight: 'calc(100vh - 72px - 250px)' }}>
              {children}
            </main>
            <Footer />
            <LoginModal />
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
