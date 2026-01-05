import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { Trophy, Clock, Users, Plus, Play, Calendar, MapPin, Timer, Award, Edit, Trash2, RefreshCw } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export default function PongalGameStatus() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  
  // State for data
  const [overview, setOverview] = useState({
    total_games: 0,
    active_games_count: 0,
    pending_games_count: 0,
    total_participants: 0
  });
  
  const [gameList, setGameList] = useState([]);
  const [activeGames, setActiveGames] = useState([]);
  const [pendingGames, setPendingGames] = useState([]);

  const categories = [
    { id: 'all', label: '🎯 அனைத்தும்', value: 'all' },
    { id: 'main', label: '🏆 முக்கிய போட்டிகள்', value: 'main' },
    { id: 'kids', label: '👦 குழந்தைகள்', value: 'kids' },
    { id: 'women', label: '👩 பெண்கள்', value: 'women' },
    { id: 'men', label: '👨 ஆண்கள்', value: 'men' },
    { id: 'fun', label: '🎉 வேடிக்கை', value: 'fun' }
  ];

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (activeTab === 'gamelist') {
      fetchGamesByCategory(selectedCategory);
    }
  }, [selectedCategory, activeTab]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchOverview(),
        fetchActiveGames(),
        fetchPendingGames(),
        fetchGamesByCategory('all')
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load dashboard data. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const fetchOverview = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/overview`);
      setOverview(response.data);
    } catch (error) {
      console.error('Error fetching overview:', error);
    }
  };

  const fetchActiveGames = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/active-games`);
      setActiveGames(response.data);
    } catch (error) {
      console.error('Error fetching active games:', error);
    }
  };

  const fetchPendingGames = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/pending-games`);
      setPendingGames(response.data);
    } catch (error) {
      console.error('Error fetching pending games:', error);
    }
  };

  const fetchGamesByCategory = async (category) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/dashboard/games-by-category/${category}`);
      setGameList(response.data);
    } catch (error) {
      console.error('Error fetching games by category:', error);
    }
  };

  const handleRefresh = () => {
    fetchAllData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🏆</div>
          <h2 className="text-2xl font-bold text-gray-800">Loading Dashboard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 via-yellow-500 to-red-500 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-md p-3 rounded-2xl">
                <Trophy className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Pongal Festival 2026</h1>
                <p className="text-white/90">Game Status Dashboard</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl font-semibold hover:bg-white/30 transition-all flex items-center gap-2"
              >
                <RefreshCw className="h-5 w-5" />
                Refresh
              </button>
              <Link
                onClick={() => window.history.back()}
                to="/dashboard" 
                className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all"
              >
                🏠 முகப்பு<br />(Home)
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-4">
            {[
              { id: 'overview', icon: '📊', label: 'Overview' },
              { id: 'gamelist', icon: '🎮', label: 'Game List' },
              { id: 'active', icon: '▶️', label: 'Active Games' },
              { id: 'pending', icon: '⏳', label: 'Pending Games' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Quick Status */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-green-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Play className="text-green-500" /> Currently Playing
                </h3>
                {activeGames.length > 0 ? (
                  <div className="space-y-3">
                    {activeGames.map(game => (
                      <div key={game.id} className="bg-green-50 rounded-xl p-4 border-2 border-green-300">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-3xl">{game.game.icon}</span>
                          <div>
                            <div className="font-bold text-gray-800">{game.game.tamil}</div>
                            <div className="text-sm text-gray-600">{game.game.english}</div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-700 space-y-1">
                          <div>📍 {game.venue}</div>
                          <div>🏅 {game.currentScore}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-4">No games currently playing</div>
                )}
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-yellow-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar className="text-yellow-500" /> Upcoming Next
                </h3>
                {pendingGames.length > 0 ? (
                  <div className="space-y-3">
                    {pendingGames.slice(0, 2).map(game => (
                      <div key={game.id} className="bg-yellow-50 rounded-xl p-4 border-2 border-yellow-300">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-3xl">{game.game.icon}</span>
                          <div>
                            <div className="font-bold text-gray-800">{game.game.tamil}</div>
                            <div className="text-sm text-gray-600">{game.game.english}</div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-700 space-y-1">
                          <div>🕐 {game.scheduledTime}</div>
                          <div>📍 {game.venue}</div>
                          <div className="text-xs text-gray-600">
                            👥 {game.registeredCount} registered
                            {game.maxTeams && ` (Max: ${game.maxTeams})`}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-4">No pending games</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* GAME LIST TAB */}
        {activeTab === 'gamelist' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">🎮 Complete Game List</h2>
            
            {/* Category Filter */}
            <div className="flex gap-3 flex-wrap">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    selectedCategory === cat.value
                      ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
        
            {/* Games Grid */}
            {gameList.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {gameList.map(game => (
                  <div
                    key={game.id}
                    className="bg-white rounded-2xl p-6 text-center hover:shadow-2xl transition-all cursor-pointer border-2 border-gray-100 hover:border-orange-300"
                  >
                    <div className="text-5xl mb-3">{game.icon}</div>
                    <div className="font-bold text-gray-800 text-sm">{game.tamil}</div>
                    <div className="text-xs text-gray-600 mt-1">{game.english}</div>
                    <div className="text-xs text-gray-500 mt-2 capitalize bg-gray-100 rounded-full px-2 py-1">
                      {game.category}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
                <div className="text-6xl mb-4">🎮</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No Games Found</h3>
                <p className="text-gray-600">No games in this category</p>
              </div>
            )}
          </div>
        )}

        {/* ACTIVE GAMES TAB */}
        {activeTab === 'active' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">▶️ Active Games</h2>
            
            {activeGames.length > 0 ? (
              activeGames.map(game => (
                <div key={game.id} className="bg-white rounded-2xl p-8 shadow-xl border-4 border-green-300">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <span className="text-6xl">{game.game.icon}</span>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800">{game.game.tamil}</h3>
                        <p className="text-gray-600">{game.game.english}</p>
                      </div>
                    </div>
                    <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold animate-pulse">
                      🔴 LIVE
                    </span>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                      <div className="text-sm text-gray-600 mb-1">📍 Venue</div>
                      <div className="font-bold text-gray-800">{game.venue}</div>
                    </div>
                    <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
                      <div className="text-sm text-gray-600 mb-1">🕐 Started</div>
                      <div className="font-bold text-gray-800">{game.startTime}</div>
                    </div>
                    <div className="bg-yellow-50 rounded-xl p-4 border-2 border-yellow-200">
                      <div className="text-sm text-gray-600 mb-1">👥 Participants</div>
                      <div className="font-bold text-gray-800">
                        {game.participants.length > 0 
                          ? game.participants.join(' vs ') 
                          : 'No participants yet'}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-100 to-yellow-100 rounded-xl p-6 border-2 border-orange-300">
                    <div className="text-center">
                      <div className="text-sm text-gray-600 mb-2">Current Score</div>
                      <div className="text-2xl font-bold text-gray-800">{game.currentScore}</div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
                <div className="text-6xl mb-4">🎮</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No Active Games</h3>
                <p className="text-gray-600">All games have been completed or are pending</p>
              </div>
            )}
          </div>
        )}

        {/* PENDING GAMES TAB */}
        {activeTab === 'pending' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold text-gray-800">⏳ Pending Games</h2>
              <p className="text-gray-600">
                Games scheduled but not yet activated by admin
              </p>
            </div>
            
            {pendingGames.length > 0 ? (
              <div className="grid gap-6">
                {pendingGames.map(game => (
                  <div key={game.id} className="bg-white rounded-2xl p-6 shadow-lg border-2 border-yellow-200 hover:border-yellow-400 transition-all">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <span className="text-5xl">{game.game.icon}</span>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{game.game.tamil}</h3>
                          <p className="text-gray-600">{game.game.english}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="bg-yellow-500 text-white px-4 py-2 rounded-full text-sm font-bold block mb-2">
                          UPCOMING
                        </span>
                        {game.registrationOpen ? (
                          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                            Registration Open
                          </span>
                        ) : (
                          <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                            Registration Closed
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 mt-6">
                      <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                        <div className="text-xs text-gray-600">📅 Date</div>
                        <div className="font-bold text-gray-800">
                          {new Date(game.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                      <div className="bg-purple-50 rounded-xl p-3 border border-purple-200">
                        <div className="text-xs text-gray-600">🕐 Time</div>
                        <div className="font-bold text-gray-800">{game.scheduledTime}</div>
                      </div>
                      <div className="bg-green-50 rounded-xl p-3 border border-green-200">
                        <div className="text-xs text-gray-600">📍 Venue</div>
                        <div className="font-bold text-gray-800">{game.venue}</div>
                      </div>
                      <div className="bg-orange-50 rounded-xl p-3 border border-orange-200">
                        <div className="text-xs text-gray-600">
                          👥 {game.gameType === 'team' ? 'Teams' : 'Players'}
                        </div>
                        <div className="font-bold text-gray-800 text-sm">
                          {game.registeredCount} registered
                          {game.maxTeams && ` / ${game.maxTeams}`}
                        </div>
                      </div>
                    </div>

                    {game.participants.length > 0 && (
                      <div className="mt-4 bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <div className="text-xs text-gray-600 mb-2">Registered {game.gameType === 'team' ? 'Teams' : 'Players'}:</div>
                        <div className="flex flex-wrap gap-2">
                          {game.participants.map((participant, idx) => (
                            <span key={idx} className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                              {participant}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No Pending Games</h3>
                <p className="text-gray-600">All scheduled games are either active or completed</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}