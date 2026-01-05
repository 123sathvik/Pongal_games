import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export default function GameList() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [allGames, setAllGames] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'main', label: 'Main' },
    { id: 'kids', label: 'Kids' },
    { id: 'women', label: 'Women' },
    { id: 'men', label: 'Men' },
    { id: 'fun', label: 'Fun' }
  ];

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/games`);
      setAllGames(response.data);
    } catch (error) {
      console.error('Error fetching games:', error);
      alert('Failed to load games. Make sure the backend is running at http://localhost:8000');
    } finally {
      setLoading(false);
    }
  };

  const filteredGames = activeCategory === 'all' 
    ? allGames 
    : allGames.filter(game => game.category === activeCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🎮</div>
          <h2 className="text-2xl font-bold text-gray-800">Loading Games...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center space-x-2 text-orange-600 hover:text-orange-700 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="font-semibold">Back to Home</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            🎮 Game List ({allGames.length})
          </h1>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`px-6 py-2.5 rounded-full font-bold border-2 transition-all duration-300 ${
                activeCategory === category.id
                  ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white border-orange-500 shadow-lg'
                  : 'bg-white text-orange-600 border-orange-500 hover:bg-orange-50'
              }`}
            >
              {category.label} ({activeCategory === category.id ? filteredGames.length : allGames.filter(g => category.id === 'all' ? true : g.category === category.id).length})
            </button>
          ))}
        </div>

        {/* Games Grid */}
        {filteredGames.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {filteredGames.map(game => (
              <div
                key={game.id}
                className="bg-white rounded-2xl shadow-md p-6 text-center cursor-pointer transform transition-all duration-300 hover:-translate-y-2 hover:shadow-xl border-2 border-transparent hover:border-orange-500 group"
              >
                <div className="text-5xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
                  {game.icon}
                </div>
                <div className="font-bold text-gray-800 text-base mb-1">
                  {game.tamil}
                </div>
                <div className="text-sm text-gray-500">
                  {game.english}
                </div>
                <div className="mt-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    game.category === 'main' ? 'bg-blue-100 text-blue-700' :
                    game.category === 'kids' ? 'bg-green-100 text-green-700' :
                    game.category === 'women' ? 'bg-pink-100 text-pink-700' :
                    game.category === 'men' ? 'bg-purple-100 text-purple-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {game.category.charAt(0).toUpperCase() + game.category.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Games Found</h3>
            <p className="text-gray-600">No games found in this category</p>
          </div>
        )}
      </div>

      {/* Category Summary */}
      {allGames.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 pb-12">
          <div className="bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl p-8 text-white shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-center">Games by Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {categories.filter(c => c.id !== 'all').map(category => {
                const count = allGames.filter(g => g.category === category.id).length;
                return (
                  <div key={category.id} className="text-center bg-white/10 backdrop-blur-md rounded-xl p-4">
                    <div className="text-4xl font-bold">{count}</div>
                    <div className="text-white/90 mt-1 capitalize">{category.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}