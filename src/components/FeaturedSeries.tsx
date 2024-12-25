import React from 'react';
import { Play, Info } from 'lucide-react';
import type { Series } from '../types';

interface FeaturedSeriesProps {
  series: Series;
}

export function FeaturedSeries({ series }: FeaturedSeriesProps) {
  return (
    <div className="relative h-[85vh] w-full">
      <div className="absolute inset-0">
        <img
          src={series.thumbnail}
          alt={series.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 px-4 pb-20 space-y-6">
        <div className="max-w-2xl space-y-4">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white">
            {series.title}
          </h1>
          <p className="text-lg text-gray-200">
            {series.description}
          </p>
        </div>

        <div className="flex space-x-4">
          <button className="flex items-center space-x-2 bg-white text-black px-8 py-3 rounded hover:bg-gray-200 transition">
            <Play className="w-6 h-6" fill="black" />
            <span className="font-semibold">Play</span>
          </button>
          <button className="flex items-center space-x-2 bg-gray-600/80 text-white px-8 py-3 rounded hover:bg-gray-600 transition">
            <Info className="w-6 h-6" />
            <span className="font-semibold">More Info</span>
          </button>
        </div>
      </div>
    </div>
  );
}