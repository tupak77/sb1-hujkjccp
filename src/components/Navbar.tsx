import React from 'react';
import { Menu, Search, Bell, User } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="fixed top-0 z-50 w-full bg-black/95 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <div className="flex items-center">
            <span className="text-red-600 text-2xl font-bold">FriendFlix</span>
            <button className="lg:hidden ml-4">
              <Menu className="w-6 h-6 text-gray-200" />
            </button>
          </div>
          <div className="hidden lg:flex space-x-6">
            <button className="text-gray-300 hover:text-white transition">Home</button>
            <button className="text-gray-300 hover:text-white transition">Series</button>
            <button className="text-gray-300 hover:text-white transition">My List</button>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <button className="text-gray-300 hover:text-white transition">
            <Search className="w-5 h-5" />
          </button>
          <button className="text-gray-300 hover:text-white transition">
            <Bell className="w-5 h-5" />
          </button>
          <button className="flex items-center space-x-2 text-gray-300 hover:text-white transition">
            <User className="w-5 h-5" />
            <span className="hidden sm:inline">Profile</span>
          </button>
        </div>
      </div>
    </nav>
  );
}