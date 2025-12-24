import React, { useState } from 'react';
import { Trophy, Clock, Users, Plus, Play, Calendar, MapPin, Timer, Award, Edit, Trash2 } from 'lucide-react';

// Sample game list data
const GAME_LIST = [
  { id: 1, icon: "🏏", tamil: "கிரிக்கெட்", english: "Cricket", category: "main" },
  { id: 2, icon: "🤼", tamil: "கபடி", english: "Kabaddi", category: "main" },
  { id: 3, icon: "⚽", tamil: "கால்பந்து", english: "Football", category: "main" },
  { id: 4, icon: "🏐", tamil: "கைப்பந்து", english: "Volleyball", category: "main" },
  { id: 5, icon: "🏃‍♂️", tamil: "கோ-கோ", english: "Kho-Kho", category: "main" },
  { id: 6, icon: "🪢", tamil: "வடம் இழுத்தல்", english: "Tug of War", category: "main" },
  { id: 7, icon: "🏃", tamil: "100 மீ ஓட்டம்", english: "100m Race", category: "main" },
  { id: 8, icon: "🍋", tamil: "எலுமிச்சை கரண்டி", english: "Lemon Spoon", category: "kids" },
  { id: 9, icon: "🎵", tamil: "இசை நாற்காலி", english: "Musical Chair", category: "fun" },
  { id: 10, icon: "🎨", tamil: "ரங்கோலி", english: "Rangoli", category: "women" },
];

export default function PongalGameStatus() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Sample data
  const [activeGames, setActiveGames] = useState([
    {
      id: 1,
      game: GAME_LIST[0],
      startTime: '10:00 AM',
      status: 'playing',
      participants: ['Team A', 'Team B'],
      currentScore: 'Team A: 45 - Team B: 38',
      venue: 'Main Ground'
    }
  ]);

  const [pendingGames, setPendingGames] = useState([
    {
      id: 2,
      game: GAME_LIST[1],
      scheduledTime: '2:00 PM',
      date: '2026-01-15',
      venue: 'Ground 2',
      participants: ['Team C', 'Team D']
    },
    {
      id: 3,
      game: GAME_LIST[2],
      scheduledTime: '4:00 PM',
      date: '2026-01-15',
      venue: 'Main Ground',
      participants: ['Team E', 'Team F']
    }
  ]);

  const [newGame, setNewGame] = useState({
    gameId: '',
    time: '',
    date: '',
    venue: '',
    players: '',
    gameType: 'team'
  });

  const categories = [
    { id: 'all', label: '🎯 அனைத்தும்', value: 'all' },
    { id: 'main', label: '🏆 முக்கிய போட்டிகள்', value: 'main' },
    { id: 'kids', label: '👦 குழந்தைகள்', value: 'kids' },
    { id: 'women', label: '👩 பெண்கள்', value: 'women' },
    { id: 'men', label: '👨 ஆண்கள்', value: 'men' },
    { id: 'fun', label: '🎉 வேடிக்கை', value: 'fun' }
  ];

  const filteredGames = selectedCategory === 'all' 
    ? GAME_LIST 
    : GAME_LIST.filter(g => g.category === selectedCategory);

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
              <button className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all">
                🏠 முகப்பு
              </button>
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
              { id: 'admin', icon: '⚙️', label: 'Admin Panel' }
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
            <h2 className="text-3xl font-bold text-gray-800">📊 Festival Overview</h2>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl">
                <div className="text-4xl mb-2">🎮</div>
                <div className="text-3xl font-bold">{GAME_LIST.length}</div>
                <div className="text-blue-100">Total Games</div>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white shadow-xl">
                <div className="text-4xl mb-2">▶️</div>
                <div className="text-3xl font-bold">{activeGames.length}</div>
                <div className="text-green-100">Active Now</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl p-6 text-white shadow-xl">
                <div className="text-4xl mb-2">⏳</div>
                <div className="text-3xl font-bold">{pendingGames.length}</div>
                <div className="text-yellow-100">Pending</div>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
                <div className="text-4xl mb-2">👥</div>
                <div className="text-3xl font-bold">200+</div>
                <div className="text-purple-100">Participants</div>
              </div>
            </div>

            {/* Quick Status */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-green-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Play className="text-green-500" /> Currently Playing
                </h3>
                {activeGames.length > 0 ? (
                  activeGames.map(game => (
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
                  ))
                ) : (
                  <div className="text-gray-500 text-center py-4">No games currently playing</div>
                )}
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-yellow-200">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar className="text-yellow-500" /> Upcoming Next
                </h3>
                {pendingGames.length > 0 ? (
                  pendingGames.slice(0, 2).map(game => (
                    <div key={game.id} className="bg-yellow-50 rounded-xl p-4 border-2 border-yellow-300 mb-3">
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
                      </div>
                    </div>
                  ))
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
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredGames.map(game => (
                <div
                  key={game.id}
                  className="bg-white rounded-2xl p-6 text-center hover:shadow-2xl transition-all cursor-pointer border-2 border-gray-100 hover:border-orange-300"
                >
                  <div className="text-5xl mb-3">{game.icon}</div>
                  <div className="font-bold text-gray-800 text-sm">{game.tamil}</div>
                  <div className="text-xs text-gray-600 mt-1">{game.english}</div>
                </div>
              ))}
            </div>
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
                      <div className="font-bold text-gray-800">{game.participants.join(' vs ')}</div>
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
            <h2 className="text-3xl font-bold text-gray-800">⏳ Pending Games</h2>
            
            <div className="grid gap-6">
              {pendingGames.map(game => (
                <div key={game.id} className="bg-white rounded-2xl p-6 shadow-lg border-2 border-yellow-200 hover:border-yellow-400 transition-all">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-5xl">{game.game.icon}</span>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">{game.game.tamil}</h3>
                        <p className="text-gray-600">{game.game.english}</p>
                      </div>
                    </div>
                    <span className="bg-yellow-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                      UPCOMING
                    </span>
                  </div>

                  <div className="grid md:grid-cols-4 gap-4 mt-6">
                    <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                      <div className="text-xs text-gray-600">📅 Date</div>
                      <div className="font-bold text-gray-800">{new Date(game.date).toLocaleDateString()}</div>
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
                      <div className="text-xs text-gray-600">👥 Teams</div>
                      <div className="font-bold text-gray-800 text-sm">{game.participants.join(' vs ')}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ADMIN PANEL TAB */}
        {activeTab === 'admin' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">⚙️ Admin Panel - Add New Game</h2>
            
            <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-orange-200">
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">🎮 Select Game</label>
                  <select 
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                    value={newGame.gameId}
                    onChange={(e) => setNewGame({...newGame, gameId: e.target.value})}
                  >
                    <option value="">-- Choose a Game --</option>
                    {GAME_LIST.map(game => (
                      <option key={game.id} value={game.id}>
                        {game.icon} {game.tamil} ({game.english})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">📅 Date</label>
                    <input 
                      type="date"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                      value={newGame.date}
                      onChange={(e) => setNewGame({...newGame, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">🕐 Time</label>
                    <input 
                      type="time"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                      value={newGame.time}
                      onChange={(e) => setNewGame({...newGame, time: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">📍 Venue</label>
                  <input 
                    type="text"
                    placeholder="Enter venue name"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                    value={newGame.venue}
                    onChange={(e) => setNewGame({...newGame, venue: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">🎯 Game Type</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="gameType" 
                        value="team"
                        checked={newGame.gameType === 'team'}
                        onChange={(e) => setNewGame({...newGame, gameType: e.target.value})}
                        className="w-4 h-4"
                      />
                      <span>Team Event</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="radio" 
                        name="gameType" 
                        value="individual"
                        checked={newGame.gameType === 'individual'}
                        onChange={(e) => setNewGame({...newGame, gameType: e.target.value})}
                        className="w-4 h-4"
                      />
                      <span>Individual Event</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    👥 {newGame.gameType === 'team' ? 'Teams' : 'Players'} (comma separated)
                  </label>
                  <input 
                    type="text"
                    placeholder={newGame.gameType === 'team' ? "Team A, Team B" : "Player 1, Player 2, Player 3"}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                    value={newGame.players}
                    onChange={(e) => setNewGame({...newGame, players: e.target.value})}
                  />
                </div>

                <button className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all flex items-center justify-center gap-2">
                  <Plus className="h-6 w-6" />
                  Add Game to Schedule
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}