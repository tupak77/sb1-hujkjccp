import React from 'react';
import { Upload, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface CreateSeriesFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function CreateSeriesForm({ onSuccess, onCancel }: CreateSeriesFormProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [form, setForm] = React.useState({
    title: '',
    description: '',
    privacyLevel: 'private',
    thumbnail: null as File | null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!form.thumbnail) {
        throw new Error('Please select a cover image');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload thumbnail
      const fileExt = form.thumbnail.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('series-thumbnails')
        .upload(filePath, form.thumbnail);

      if (uploadError) throw uploadError;

      const { data: { publicUrl: thumbnailUrl } } = supabase.storage
        .from('series-thumbnails')
        .getPublicUrl(filePath);

      // Create series
      const { error: insertError } = await supabase
        .from('series')
        .insert({
          title: form.title,
          description: form.description || null,
          thumbnail_url: thumbnailUrl,
          privacy_level: form.privacyLevel,
          created_by: user.id,
        });

      if (insertError) throw insertError;

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const validateImage = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const validRatio = Math.abs(img.width / img.height - 16 / 9) < 0.1;
        const validSize = img.width >= 1280 && img.height >= 720;
        resolve(validRatio && validSize);
      };
      img.onerror = () => resolve(false);
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isValid = await validateImage(file);
    if (!isValid) {
      setError('Image must be 16:9 ratio and at least 1280x720px');
      return;
    }

    setForm(prev => ({ ...prev, thumbnail: file }));
    setError('');
  };

  return (
    <div className="bg-gray-900 rounded-lg p-6 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Create New Series</h2>
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
            maxLength={100}
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
            maxLength={500}
            rows={4}
            className="w-full bg-gray-800 text-white rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Cover Image *
          </label>
          <div className="relative">
            {form.thumbnail ? (
              <div className="relative aspect-video rounded-md overflow-hidden">
                <img
                  src={URL.createObjectURL(form.thumbnail)}
                  alt="Cover preview"
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
                  onChange={handleImageChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">
                    Click to upload (16:9, min 1280x720px)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Privacy
          </label>
          <select
            value={form.privacyLevel}
            onChange={e => setForm(prev => ({ ...prev, privacyLevel: e.target.value }))}
            className="w-full bg-gray-800 text-white rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="private">Private</option>
            <option value="friends">Friends Only</option>
          </select>
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
            {loading ? 'Creating...' : 'Create Series'}
          </button>
        </div>
      </form>
    </div>
  );
}