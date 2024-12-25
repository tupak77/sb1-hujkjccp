export interface Series {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  privacy_level: 'private' | 'friends';
  created_by: string;
  created_at: string;
  episodes?: Episode[];
}

export interface Episode {
  id: string;
  series_id: string;
  title: string;
  description: string;
  thumbnail_url: string;
  video_url: string;
  order: number;
  duration?: number;
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}