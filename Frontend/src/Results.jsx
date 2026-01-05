import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Medal, Crown, Star, Calendar, MapPin, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export default function Results() {
  const [completedGames, setCompletedGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const gamesPerPage = 5;

  const categories = [
    { id: 'all', label: 'All Games' },
    { id: 'main', label: 'Main Events' },
    { id: 'kids', label: 'Kids Events' },
    { id: 'fun', label: 'Fun Events' },
    { id: 'women', label: 'Women Events' },
    { id: 'men', label: 'Men Events' }
  ];

  useEffect(() => {
    fetchResults();
    fetchStatistics();
  }, []);

  useEffect(() => {
    if (filterCategory) {
      fetchResultsByCategory(filterCategory);
    }
  }, [filterCategory]);

  useEffect(() => {
    // Apply search filter
    if (searchQuery.trim() === '') {
      setFilteredGames(completedGames);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = completedGames.filter(game => 
        game.game.tamil.toLowerCase().includes(query) ||
        game.game.english.toLowerCase().includes(query)
      );
      setFilteredGames(filtered);
    }
    // Reset to first page when search changes
    setCurrentPage(1);
  }, [searchQuery, completedGames]);

  const fetchResults = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/results`);
      setCompletedGames(response.data);
      setFilteredGames(response.data);
    } catch (error) {
      console.error('Error fetching results:', error);
      alert('Failed to load results. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const fetchResultsByCategory = async (category) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/results/category/${category}`);
      setCompletedGames(response.data);
      setFilteredGames(response.data);
      setCurrentPage(1); // Reset to first page
    } catch (error) {
      console.error('Error fetching results by category:', error);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/results/stats`);
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  // Pagination calculations
  const indexOfLastGame = currentPage * gamesPerPage;
  const indexOfFirstGame = indexOfLastGame - gamesPerPage;
  const currentGames = filteredGames.slice(indexOfFirstGame, indexOfLastGame);
  const totalPages = Math.ceil(filteredGames.length / gamesPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getMedalColor = (medal) => {
    switch(medal) {
      case 'gold': return 'from-yellow-400 to-yellow-600';
      case 'silver': return 'from-gray-300 to-gray-500';
      case 'bronze': return 'from-orange-400 to-orange-600';
      default: return 'from-gray-400 to-gray-600';
    }
  };

  const getMedalIcon = (medal) => {
    switch(medal) {
      case 'gold': return '🥇';
      case 'silver': return '🥈';
      case 'bronze': return '🥉';
      default: return '🏅';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🏆</div>
          <h2 className="text-2xl font-bold text-gray-800">Loading Results...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => window.history.back()}
                className="bg-white/20 backdrop-blur-md p-3 rounded-xl hover:bg-white/30 transition-all"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl">
                <Trophy className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Game Results</h1>
                <p className="text-white/90">Winners & Champions</p>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-xl">
              <div className="text-sm text-white/90">Completed</div>
              <div className="text-3xl font-bold">{completedGames.length}</div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by game name (Tamil or English)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-purple-200 rounded-2xl focus:border-purple-500 focus:outline-none text-lg bg-white shadow-lg"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-center mt-3 text-gray-600">
              Found <span className="font-bold text-purple-600">{filteredGames.length}</span> result(s) for "{searchQuery}"
            </p>
          )}
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setFilterCategory(category.id)}
              className={`px-6 py-2.5 rounded-full font-bold border-2 transition-all duration-300 ${
                filterCategory === category.id
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-500 shadow-lg'
                  : 'bg-white text-purple-600 border-purple-500 hover:bg-purple-50'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Results Grid */}
        {currentGames.length > 0 ? (
          <>
            <div className="grid gap-6 mb-8">
              {currentGames.map(game => (
                <div 
                  key={game.id}
                  className="bg-white rounded-2xl shadow-xl border-2 border-purple-200 overflow-hidden hover:shadow-2xl transition-all"
                >
                  {/* Game Header */}
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-5xl">{game.game.icon}</span>
                        <div>
                          <h3 className="text-2xl font-bold text-white">{game.game.tamil}</h3>
                          <p className="text-white/90">{game.game.english}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2 text-white/90 text-sm mb-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(game.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </div>
                        {game.venue && (
                          <div className="flex items-center gap-2 text-white/90 text-sm">
                            <MapPin className="h-4 w-4" />
                            {game.venue}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Results Content */}
                  <div className="p-6">
                    {game.game_type === 'team' ? (
                      // Team Event Results
                      <div className="space-y-4">
                        {/* Winner */}
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border-4 border-yellow-400 relative overflow-hidden">
                          <div className="absolute top-0 right-0 text-8xl opacity-10">👑</div>
                          <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-4">
                              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-4 rounded-full">
                                <Crown className="h-8 w-8 text-white" />
                              </div>
                              <div>
                                <div className="text-sm text-orange-600 font-bold mb-1 flex items-center gap-2">
                                  <Trophy className="h-4 w-4" />
                                  WINNER
                                </div>
                                <h4 className="text-2xl font-bold text-gray-800">{game.winner.name}</h4>
                                <p className="text-gray-600">Score: {game.winner.score}</p>
                              </div>
                            </div>
                            <div className="text-6xl">🏆</div>
                          </div>
                        </div>

                        {/* Runner Up */}
                        {game.runner_up && (
                          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-5 border-2 border-gray-300">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="bg-gradient-to-br from-gray-400 to-gray-600 p-3 rounded-full">
                                  <Medal className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                  <div className="text-sm text-gray-600 font-bold mb-1">RUNNER UP</div>
                                  <h4 className="text-xl font-bold text-gray-800">{game.runner_up.name}</h4>
                                  <p className="text-gray-600">Score: {game.runner_up.score}</p>
                                </div>
                              </div>
                              <div className="text-4xl">🥈</div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      // Individual Event Results - Top 3
                      <div className="space-y-4">
                        {game.results && game.results.map((result, idx) => (
                          <div 
                            key={idx}
                            className={`rounded-2xl p-6 border-4 relative overflow-hidden ${
                              result.position === 1 
                                ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-400' 
                                : result.position === 2
                                ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-400'
                                : 'bg-gradient-to-r from-orange-50 to-red-50 border-orange-400'
                            }`}
                          >
                            {result.position === 1 && (
                              <div className="absolute top-0 right-0 text-8xl opacity-10">👑</div>
                            )}
                            <div className="flex items-center justify-between relative z-10">
                              <div className="flex items-center gap-4">
                                {/* Medal Icon */}
                                <div className={`bg-gradient-to-br ${getMedalColor(result.medal)} p-4 rounded-full shadow-lg`}>
                                  <div className="text-3xl">{getMedalIcon(result.medal)}</div>
                                </div>
                                
                                {/* Player Info */}
                                <div>
                                  <div className={`text-xs font-bold mb-1 flex items-center gap-2 ${
                                    result.position === 1 ? 'text-orange-600' : 
                                    result.position === 2 ? 'text-gray-600' : 
                                    'text-orange-700'
                                  }`}>
                                    {result.position === 1 && <Crown className="h-3 w-3" />}
                                    {result.position === 1 ? '1ST PLACE' : result.position === 2 ? '2ND PLACE' : '3RD PLACE'}
                                  </div>
                                  <h4 className={`font-bold text-gray-800 ${
                                    result.position === 1 ? 'text-2xl' : 'text-xl'
                                  }`}>
                                    {result.name}
                                  </h4>
                                  {result.time && (
                                    <p className="text-gray-600 text-sm mt-1">
                                      Time: <span className="font-bold">{result.time}</span>
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Position Number */}
                              <div className={`font-black ${
                                result.position === 1 ? 'text-6xl text-yellow-500' : 
                                result.position === 2 ? 'text-5xl text-gray-400' : 
                                'text-5xl text-orange-500'
                              }`}>
                                {result.position}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Congratulations Message */}
                    <div className="mt-6 bg-purple-50 rounded-xl p-4 border border-purple-200 text-center">
                      <p className="text-purple-800 font-semibold flex items-center justify-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        Congratulations to all participants!
                        <Star className="h-5 w-5 text-yellow-500" />
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mb-8">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-3 rounded-xl font-bold transition-all ${
                    currentPage === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-purple-600 border-2 border-purple-500 hover:bg-purple-50'
                  }`}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <div className="flex gap-2">
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    // Show only 5 page numbers at a time
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`px-4 py-2 rounded-xl font-bold transition-all ${
                            currentPage === pageNumber
                              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                              : 'bg-white text-purple-600 border-2 border-purple-500 hover:bg-purple-50'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    } else if (
                      pageNumber === currentPage - 2 ||
                      pageNumber === currentPage + 2
                    ) {
                      return <span key={pageNumber} className="px-2 py-2 text-gray-400">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-3 rounded-xl font-bold transition-all ${
                    currentPage === totalPages
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-purple-600 border-2 border-purple-500 hover:bg-purple-50'
                  }`}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* Page Info */}
            <div className="text-center text-gray-600 mb-8">
              Showing {indexOfFirstGame + 1} to {Math.min(indexOfLastGame, filteredGames.length)} of {filteredGames.length} results
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <div className="text-6xl mb-4">🏆</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Results Found</h3>
            <p className="text-gray-600">
              {searchQuery ? `No results match "${searchQuery}"` : 'No completed games in this category yet'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 px-6 py-2 bg-purple-500 text-white rounded-xl font-bold hover:bg-purple-600 transition-all"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>

      {/* Stats Summary */}
      {statistics && (
        <div className="max-w-7xl mx-auto px-4 pb-12">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-6 text-center">Tournament Statistics</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold">{statistics.total_games}</div>
                <div className="text-white/80 mt-1">Games Completed</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold">{statistics.team_events}</div>
                <div className="text-white/80 mt-1">Team Events</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold">{statistics.individual_events}</div>
                <div className="text-white/80 mt-1">Individual Events</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold">{statistics.total_participants}</div>
                <div className="text-white/80 mt-1">Total Participants</div>
              </div>
            </div>

            {/* Category Breakdown */}
            {statistics.by_category && Object.keys(statistics.by_category).length > 0 && (
              <div className="mt-8 pt-6 border-t border-white/20">
                <h3 className="text-xl font-bold mb-4 text-center">By Category</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(statistics.by_category).map(([category, count]) => (
                    <div key={category} className="text-center bg-white/10 rounded-xl p-4">
                      <div className="text-3xl font-bold">{count}</div>
                      <div className="text-white/80 mt-1 capitalize">{category}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}