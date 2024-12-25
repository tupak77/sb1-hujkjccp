import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { SeriesCard } from './SeriesCard';
import type { Series } from '../types';

interface SeriesRowProps {
  title: string;
  series: Series[];
}

export function SeriesRow({ title, series }: SeriesRowProps) {
  const rowRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' 
        ? scrollLeft - clientWidth
        : scrollLeft + clientWidth;
      
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-2 py-4">
      <h2 className="text-xl text-white font-semibold px-4">{title}</h2>
      
      <div className="group relative">
        <button
          className="absolute top-0 bottom-0 left-2 z-40 hidden group-hover:flex items-center justify-center w-12 bg-black/30 hover:bg-black/60 transition"
          onClick={() => scroll('left')}
        >
          <ChevronLeft className="w-8 h-8 text-white" />
        </button>

        <div
          ref={rowRef}
          className="flex space-x-4 overflow-x-scroll scrollbar-hide px-4"
        >
          {series.map((item) => (
            <div key={item.id} className="flex-none w-[300px]">
              <SeriesCard series={item} />
            </div>
          ))}
        </div>

        <button
          className="absolute top-0 bottom-0 right-2 z-40 hidden group-hover:flex items-center justify-center w-12 bg-black/30 hover:bg-black/60 transition"
          onClick={() => scroll('right')}
        >
          <ChevronRight className="w-8 h-8 text-white" />
        </button>
      </div>
    </div>
  );
}