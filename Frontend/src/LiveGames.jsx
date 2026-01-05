 import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Clock, MapPin, Users, User, RefreshCw, X } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export default function LiveGames() {
  const [liveGames, setLiveGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameDetails, setGameDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    fetchLiveGames();
    
    // Auto-refresh every 10 seconds if enabled
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchLiveGames();
        if (selectedGame) {
          fetchGameDetails(selectedGame.id);
        }
      }, 10000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, selectedGame]);

  const fetchLiveGames = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/live-games`);
      setLiveGames(response.data);
    } catch (error) {
      console.error('Error fetching live games:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGameDetails = async (gameId) => {
    setLoadingDetails(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/live-games/${gameId}`);
      setGameDetails(response.data);
    } catch (error) {
      console.error('Error fetching game details:', error);
      alert('Failed to load game details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleGameClick = (game) => {
    setSelectedGame(game);
    fetchGameDetails(game.id);
  };

  const handleCloseModal = () => {
    setSelectedGame(null);
    setGameDetails(null);
  };

  const handleRefresh = () => {
    fetchLiveGames();
    if (selectedGame) {
      fetchGameDetails(selectedGame.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🏆</div>
          <h2 className="text-2xl font-bold text-gray-800">Loading Live Games...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 text-white shadow-2xl sticky top-0 z-40">
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
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <span className="bg-red-500 w-3 h-3 rounded-full animate-pulse"></span>
                  Live Games
                </h1>
                <p className="text-white/90">Real-time scores and updates</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 ${
                  autoRefresh
                    ? 'bg-green-500 text-white'
                    : 'bg-white/20 text-white border-2 border-white/30'
                }`}
              >
                <RefreshCw className={`h-5 w-5 ${autoRefresh ? 'animate-spin' : ''}`} />
                Auto Refresh
              </button>
              <button
                onClick={handleRefresh}
                className="bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl hover:bg-white/30 transition-all"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
              <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-xl">
                <div className="text-sm text-white/90">Live Now</div>
                <div className="text-3xl font-bold">{liveGames.length}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {liveGames.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveGames.map(game => (
              <div
                key={game.id}
                onClick={() => handleGameClick(game)}
                className="bg-white rounded-2xl p-6 shadow-xl border-4 border-green-300 hover:border-green-500 transition-all cursor-pointer transform hover:scale-105"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{game.game.icon}</span>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{game.game.tamil}</h3>
                      <p className="text-gray-600 text-sm">{game.game.english}</p>
                    </div>
                  </div>
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse flex items-center gap-1">
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                    LIVE
                  </span>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 mb-3 border-2 border-green-200">
                  {game.gameType === 'team' ? (
                    <div className="space-y-2">
                      {game.participants.slice(0, 2).map((participant, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                          <span className="text-gray-800 font-semibold text-sm">{participant.name}</span>
                          <span className="text-green-600 text-xl font-bold">{participant.score}</span>
                        </div>
                      ))}
                      {game.participants.length > 2 && (
                        <div className="text-gray-500 text-xs text-center pt-1">
                          +{game.participants.length - 2} more teams
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {game.participants.slice(0, 3).map((participant, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm">
                          <span className="text-gray-800">{participant.name}</span>
                          <span className="text-green-600 font-bold">{participant.time || 'Pending'}</span>
                        </div>
                      ))}
                      {game.participants.length > 3 && (
                        <div className="text-gray-500 text-xs text-center pt-1">
                          +{game.participants.length - 3} more players
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 text-gray-600 text-xs">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {game.startTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {game.venue}
                  </span>
                </div>

                <div className="mt-3 text-center text-xs text-gray-500">
                  Click for details →
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Live Games</h3>
            <p className="text-gray-600">Check back later for live game updates!</p>
          </div>
        )}
      </div>

      {/* Game Details Modal */}
      {selectedGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {loadingDetails ? (
              <div className="p-12 text-center">
                <div className="animate-spin h-12 w-12 border-4 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Loading game details...</p>
              </div>
            ) : gameDetails ? (
              <>
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-green-500 to-blue-500 p-6 rounded-t-3xl sticky top-0 z-10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-5xl">{gameDetails.game.icon}</span>
                      <div>
                        <h3 className="text-2xl font-bold text-white">{gameDetails.game.tamil}</h3>
                        <p className="text-white/90">{gameDetails.game.english}</p>
                      </div>
                    </div>
                    <button 
                      onClick={handleCloseModal}
                      className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all"
                    >
                      <X className="h-6 w-6 text-white" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4 mt-4 text-white/90">
                    <span className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-sm">
                      <Clock className="h-4 w-4" /> {gameDetails.startTime}
                    </span>
                    <span className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-sm">
                      <MapPin className="h-4 w-4" /> {gameDetails.venue}
                    </span>
                    <span className="bg-green-500 px-3 py-1 rounded-full text-sm font-bold animate-pulse flex items-center gap-2">
                      <span className="w-2 h-2 bg-white rounded-full"></span>
                      LIVE
                    </span>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                  {gameDetails.gameType === 'team' ? (
                    // Team Event Display
                    <div className="space-y-6">
                      <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Trophy className="h-6 w-6 text-green-600" />
                        Live Scores
                      </h4>
                      <div className="space-y-4">
                        {gameDetails.participants
                          .sort((a, b) => (b.score || 0) - (a.score || 0))
                          .map((participant, idx) => (
                            <div 
                              key={idx} 
                              className={`rounded-2xl p-6 border-2 ${
                                idx === 0 
                                  ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-400' 
                                  : 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  {idx === 0 && (
                                    <div className="text-4xl">👑</div>
                                  )}
                                  <div>
                                    <h5 className="text-2xl font-bold text-gray-800">{participant.name}</h5>
                                    <span className="text-gray-600 text-sm">
                                      {idx === 0 ? 'Leading' : `Position ${idx + 1}`}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-5xl font-bold text-green-600">{participant.score || 0}</div>
                                  <div className="text-gray-600 text-sm mt-1">Points</div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>

                      {/* Team Registrations */}
                      <div className="mt-8">
                        <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <Users className="h-6 w-6 text-blue-600" />
                          Team Details
                        </h4>
                        <div className="space-y-4">
                          {gameDetails.registrations.map((team, idx) => (
                            <div key={idx} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border-2 border-blue-200">
                              <h5 className="text-lg font-bold text-gray-800 mb-2">🏆 {team.teamName}</h5>
                              <div className="space-y-1 text-sm text-gray-700">
                                <p><span className="font-semibold">Captain:</span> {team.captainName}</p>
                                {team.captainPhone && <p><span className="font-semibold">Phone:</span> {team.captainPhone}</p>}
                                {team.captainEmail && <p><span className="font-semibold">Email:</span> {team.captainEmail}</p>}
                                <div className="mt-3">
                                  <p className="font-semibold mb-2">Players:</p>
                                  <div className="flex flex-wrap gap-2">
                                    {team.players.map((player, pidx) => (
                                      <span key={pidx} className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs">
                                        {player}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Individual Event Display
                    <div className="space-y-6">
                      <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Trophy className="h-6 w-6 text-green-600" />
                        Live Rankings
                      </h4>
                      <div className="space-y-3">
                        {gameDetails.participants
                          .filter(p => p.time)
                          .sort((a, b) => {
                            const timeA = parseFloat(a.time.replace('s', ''));
                            const timeB = parseFloat(b.time.replace('s', ''));
                            return timeA - timeB;
                          })
                          .map((participant, idx) => (
                            <div 
                              key={idx} 
                              className={`rounded-2xl p-5 border-2 ${
                                idx === 0 
                                  ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-400' 
                                  : idx === 1
                                  ? 'bg-gradient-to-r from-gray-100 to-gray-200 border-gray-400'
                                  : idx === 2
                                  ? 'bg-gradient-to-r from-orange-100 to-red-100 border-orange-400'
                                  : 'bg-white border-gray-300'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                  <div className="text-3xl font-bold">
                                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                                  </div>
                                  <div>
                                    <h5 className="text-xl font-bold text-gray-800">{participant.name}</h5>
                                    <span className="text-gray-600 text-sm">
                                      {idx === 0 ? '1st Place' : idx === 1 ? '2nd Place' : idx === 2 ? '3rd Place' : `${idx + 1}th Place`}
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-3xl font-bold text-green-600">{participant.time}</div>
                                  <div className="text-gray-600 text-sm">Time</div>
                                </div>
                              </div>
                            </div>
                          ))}
                        
                        {/* Pending participants */}
                        {gameDetails.participants.filter(p => !p.time).length > 0 && (
                          <div className="mt-6">
                            <h5 className="text-lg font-bold text-gray-700 mb-3">Pending Results:</h5>
                            <div className="space-y-2">
                              {gameDetails.participants.filter(p => !p.time).map((participant, idx) => (
                                <div key={idx} className="bg-gray-100 rounded-lg p-3 border border-gray-300">
                                  <div className="flex items-center justify-between">
                                    <span className="font-semibold text-gray-800">{participant.name}</span>
                                    <span className="text-gray-500 text-sm italic">Pending</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Player Details */}
                      <div className="mt-8">
                        <h4 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <User className="h-6 w-6 text-purple-600" />
                          Participant Details
                        </h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          {gameDetails.registrations.map((player, idx) => (
                            <div key={idx} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
                              <h5 className="font-bold text-gray-800 mb-2">👤 {player.playerName}</h5>
                              <div className="space-y-1 text-sm text-gray-700">
                                {player.age && <p><span className="font-semibold">Age:</span> {player.age}</p>}
                                {player.phone && <p><span className="font-semibold">Phone:</span> {player.phone}</p>}
                                {player.email && <p><span className="font-semibold">Email:</span> {player.email}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Close Button */}
                  <div className="mt-8">
                    <button
                      onClick={handleCloseModal}
                      className="w-full bg-gradient-to-r from-green-500 to-blue-500 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}