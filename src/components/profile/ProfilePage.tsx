import React from 'react';
import { Pencil, Save, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Series } from '../../types';

interface Profile {
  username: string;
  display_name: string;
  avatar_url: string;
  character_description: string | null;
}

export function ProfilePage() {
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [editing, setEditing] = React.useState(false);
  const [series, setSeries] = React.useState<Series[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editForm, setEditForm] = React.useState({
    display_name: '',
    character_description: '',
    avatar: null as File | null,
  });

  React.useEffect(() => {
    loadProfile();
    loadSeries();
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('profiles')
      .select()
      .eq('id', user.id)
      .single();

    if (data) {
      setProfile(data);
      setEditForm({
        display_name: data.display_name,
        character_description: data.character_description || '',
        avatar: null,
      });
    }
    setLoading(false);
  };

  const loadSeries = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('series')
      .select()
      .eq('created_by', user.id);

    if (data) {
      setSeries(data);
    }
  };

  const handleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !profile) return;

    let avatarUrl = profile.avatar_url;

    if (editForm.avatar) {
      const fileExt = editForm.avatar.name.split('.').pop();
      const filePath = `${user.id}/profile.${fileExt}`;

      await supabase.storage
        .from('profile-pictures')
        .upload(filePath, editForm.avatar, { upsert: true });

      const { data: { publicUrl } } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      avatarUrl = publicUrl;
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: editForm.display_name,
        character_description: editForm.character_description || null,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (!error) {
      loadProfile();
      setEditing(false);
    }
  };

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  if (!profile) {
    return <div className="text-white">Profile not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-gray-900 rounded-lg p-6 mb-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <img
              src={profile.avatar_url}
              alt={profile.display_name}
              className="w-24 h-24 rounded-full object-cover"
            />
            <div>
              <h1 className="text-2xl font-bold text-white">{profile.display_name}</h1>
              <p className="text-gray-400">@{profile.username}</p>
              {profile.character_description && (
                <p className="text-gray-300 mt-2">{profile.character_description}</p>
              )}
            </div>
          </div>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center space-x-2 bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-700"
            >
              <Pencil className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
              <button
                onClick={() => setEditing(false)}
                className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          )}
        </div>

        {editing && (
          <div className="space-y-4 mt-6 border-t border-gray-800 pt-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Display Name
              </label>
              <input
                type="text"
                value={editForm.display_name}
                onChange={(e) => setEditForm(prev => ({ ...prev, display_name: e.target.value }))}
                className="w-full bg-gray-800 text-white rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-red-500"
                maxLength={50}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Character Description (Optional)
              </label>
              <textarea
                value={editForm.character_description}
                onChange={(e) => setEditForm(prev => ({ ...prev, character_description: e.target.value }))}
                className="w-full bg-gray-800 text-white rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-red-500"
                maxLength={150}
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Profile Picture
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setEditForm(prev => ({ ...prev, avatar: e.target.files?.[0] || null }))}
                className="w-full bg-gray-800 text-white rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-4">My Series</h2>
        {series.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {series.map((item) => (
              <div
                key={item.id}
                className="bg-gray-900 rounded-lg overflow-hidden hover:ring-2 hover:ring-red-500 transition-all"
              >
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full aspect-video object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  <p className="text-gray-400 text-sm mt-1">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No series uploaded yet.</p>
        )}
      </div>
    </div>
  );
}