import React from 'react';
import { Play, Plus, Info } from 'lucide-react';
import type { Series } from '../types';

interface SeriesCardProps {
  series: Series;
}

export function SeriesCard({ series }: SeriesCardProps) {
  return (
    <div className="group relative">
      <div className="aspect-video overflow-hidden rounded-md">
        <img
          src={series.thumbnail}
          alt={series.title}
          className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
      
      <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="p-4 w-full">
          <h3 className="text-white font-semibold mb-2">{series.title}</h3>
          
          <div className="flex items-center space-x-2">
            <button className="flex items-center justify-center bg-white rounded-full p-2 hover:bg-gray-200 transition">
              <Play className="w-4 h-4 text-black" fill="black" />
            </button>
            <button className="flex items-center justify-center border-2 border-gray-400 rounded-full p-2 hover:border-white transition">
              <Plus className="w-4 h-4 text-white" />
            </button>
            <button className="flex items-center justify-center border-2 border-gray-400 rounded-full p-2 hover:border-white transition">
              <Info className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}