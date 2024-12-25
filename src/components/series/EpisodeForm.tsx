import React from 'react';
import { Upload, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface EpisodeFormProps {
  seriesId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function EpisodeForm({ seriesId, onSuccess, onCancel }: EpisodeFormProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [form, setForm] = React.useState({
    title: '',
    description: '',
    video: null as File | null,
    thumbnail: null as File | null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!form.video) throw new Error('Please select a video file');
      if (!form.thumbnail) throw new Error('Please select a thumbnail');

      // Get max order number for the series
      const { data: episodes } = await supabase
        .from('episodes')
        .select('order')
        .eq('series_id', seriesId)
        .order('order', { ascending: false })
        .limit(1);

      const nextOrder = (episodes?.[0]?.order ?? 0) + 1;

      // Upload video
      const videoExt = form.video.name.split('.').pop();
      const videoPath = `${seriesId}/${Date.now()}_video.${videoExt}`;

      const { error: videoError } = await supabase.storage
        .from('episode-videos')
        .upload(videoPath, form.video);

      if (videoError) throw videoError;

      // Upload thumbnail
      const thumbExt = form.thumbnail.name.split('.').pop();
      const thumbPath = `${seriesId}/${Date.now()}_thumb.${thumbExt}`;

      const { error: thumbError } = await supabase.storage
        .from('episode-thumbnails')
        .upload(thumbPath, form.thumbnail);

      if (thumbError) throw thumbError;

      // Get public URLs
      const { data: { publicUrl: videoUrl } } = supabase.storage
        .from('episode-videos')
        .getPublicUrl(videoPath);

      const { data: { publicUrl: thumbnailUrl } } = supabase.storage
        .from('episode-thumbnails')
        .getPublicUrl(thumbPath);

      // Create episode
      const { error: insertError } = await supabase
        .from('episodes')
        .insert({
          series_id: seriesId,
          title: form.title,
          description: form.description || null,
          video_url: videoUrl,
          thumbnail_url: thumbnailUrl,
          order: nextOrder,
        });

      if (insertError) throw insertError;

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const validateVideo = (file: File): boolean => {
    const validTypes = ['video/mp4', 'video/quicktime'];
    const maxSize = 1024 * 1024 * 1024; // 1GB
    return validTypes.includes(file.type) && file.size <= maxSize;
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!validateVideo(file)) {
      setError('Video must be MP4 or MOV format and max 1GB');
      return;
    }

    setForm(prev => ({ ...prev, video: file }));
    setError('');
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Add New Episode</h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-white transition"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500 rounded-md text-red-500">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Title *
          </label>
          <input
            type="text"
            value={form.title}
            onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
            required
            className="w-full bg-gray-800 text-white rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Description
          </label>
          <textarea
            value={form.description}
            onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="w-full bg-gray-800 text-white rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Video *
          </label>
          <div className="relative">
            {form.video ? (
              <div className="bg-gray-800 rounded-md p-4 flex items-center justify-between">
                <span className="text-white truncate">{form.video.name}</span>
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, video: null }))}
                  className="p-1 bg-gray-700 rounded-full hover:bg-gray-600 transition"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <div className="bg-gray-800 rounded-md p-8 border-2 border-dashed border-gray-600 hover:border-gray-500 transition cursor-pointer">
                <input
                  type="file"
                  accept="video/mp4,video/quicktime"
                  onChange={handleVideoChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">
                    Click to upload video (MP4/MOV, max 1GB)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Thumbnail *
          </label>
          <div className="relative">
            {form.thumbnail ? (
              <div className="relative aspect-video rounded-md overflow-hidden">
                <img
                  src={URL.createObjectURL(form.thumbnail)}
                  alt="Thumbnail preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, thumbnail: null }))}
                  className="absolute top-2 right-2 p-1 bg-black/60 rounded-full hover:bg-black/80 transition"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <div className="aspect-video bg-gray-800 rounded-md flex items-center justify-center border-2 border-dashed border-gray-600 hover:border-gray-500 transition cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) setForm(prev => ({ ...prev, thumbnail: file }));
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">
                    Click to upload thumbnail
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-300 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:opacity-50"
          >
            {loading ? 'Uploading...' : 'Add Episode'}
          </button>
        </div>
      </form>
    </div>
  );
}