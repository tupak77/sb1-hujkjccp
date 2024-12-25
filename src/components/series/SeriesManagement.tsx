import React from 'react';
import { Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { CreateSeriesForm } from './CreateSeriesForm';
import { EpisodeForm } from './EpisodeForm';
import type { Series } from '../../types';

export function SeriesManagement() {
  const [showCreateForm, setShowCreateForm] = React.useState(false);
  const [showEpisodeForm, setShowEpisodeForm] = React.useState(false);
  const [selectedSeries, setSelectedSeries] = React.useState<string | null>(null);
  const [series, setSeries] = React.useState<Series[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadSeries();
  }, []);

  const loadSeries = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('series')
      .select(`
        id,
        title,
        description,
        thumbnail_url,
        privacy_level,
        created_at,
        episodes (
          id,
          title,
          description,
          thumbnail_url,
          video_url,
          "order",
          created_at
        )
      `)
      .eq('created_by', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setSeries(data);
    }
    setLoading(false);
  };

  const handleCreateSuccess = () => {
    setShowCreateForm(false);
    loadSeries();
  };

  const handleEpisodeSuccess = () => {
    setShowEpisodeForm(false);
    setSelectedSeries(null);
    loadSeries();
  };

  if (loading) {
    return <div className="text-white">Loading...</div>;
  }

  if (showCreateForm) {
    return (
      <CreateSeriesForm
        onSuccess={handleCreateSuccess}
        onCancel={() => setShowCreateForm(false)}
      />
    );
  }

  if (showEpisodeForm && selectedSeries) {
    return (
      <EpisodeForm
        seriesId={selectedSeries}
        onSuccess={handleEpisodeSuccess}
        onCancel={() => {
          setShowEpisodeForm(false);
          setSelectedSeries(null);
        }}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">My Series</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
        >
          <Plus className="w-5 h-5" />
          <span>Create Series</span>
        </button>
      </div>

      {series.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">You haven't created any series yet.</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="text-red-500 hover:text-red-400 transition"
          >
            Create your first series
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {series.map((item) => (
            <div
              key={item.id}
              className="bg-gray-900 rounded-lg overflow-hidden hover:ring-2 hover:ring-red-500 transition-all"
            >
              <div className="aspect-video relative">
                <img
                  src={item.thumbnail_url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4">
                  <h3 className="text-xl font-semibold text-white mb-1">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-300">
                    {(item.episodes as any[]).length} episodes
                  </p>
                </div>
              </div>
              <div className="p-4">
                {item.description && (
                  <p className="text-gray-400 text-sm mb-4">{item.description}</p>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {item.privacy_level === 'private' ? 'Private' : 'Friends Only'}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedSeries(item.id);
                      setShowEpisodeForm(true);
                    }}
                    className="text-red-500 hover:text-red-400 transition text-sm"
                  >
                    Add Episode
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}