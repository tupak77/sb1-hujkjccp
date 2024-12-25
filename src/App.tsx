import React from 'react';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { Navbar } from './components/Navbar';
import { FeaturedSeries } from './components/FeaturedSeries';
import { SeriesRow } from './components/SeriesRow';
import { SeriesManagement } from './components/series/SeriesManagement';
import { AuthPage } from './pages/auth/AuthPage';
import { ProfilePage } from './components/profile/ProfilePage';
import type { Series } from './types';

// Mock data for development
const mockFeaturedSeries: Series = {
  id: '1',
  title: 'Summer Adventures 2024',
  description: 'Join us on an unforgettable journey through Europe, featuring breathtaking landscapes and unforgettable moments with friends.',
  thumbnail_url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1',
  privacy_level: 'friends',
  created_by: 'John Doe',
  created_at: new Date().toISOString(),
};

const mockSeries: Series[] = [
  {
    id: '2',
    title: 'Graduation Memories',
    description: 'A collection of our best moments from graduation day.',
    thumbnail_url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1',
    privacy_level: 'private',
    created_by: 'Jane Smith',
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Beach Weekend',
    description: 'Fun times at the beach with friends.',
    thumbnail_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
    privacy_level: 'friends',
    created_by: 'Mike Johnson',
    created_at: new Date().toISOString(),
  },
  {
    id: '4',
    title: 'Mountain Hiking',
    description: 'Our adventures in the mountains.',
    thumbnail_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b',
    privacy_level: 'private',
    created_by: 'Sarah Wilson',
    created_at: new Date().toISOString(),
  },
];

function App() {
  const [session, setSession] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(!!session);
      setLoading(false);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(!!session);
    });
  }, []);

  if (loading) {
    return null;
  }

  if (!session) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <main>
        <SeriesManagement />
      </main>
    </div>
  );

}
export default App;