import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Minus, Trophy, Clock, MapPin, X } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export default function ActiveGames() {
  const [activeGames, setActiveGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showScoreModal, setShowScoreModal] = useState(false);

  useEffect(() => {
    fetchActiveGames();
  }, []);

  const fetchActiveGames = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/active-games/list`);
      setActiveGames(response.data);
    } catch (error) {
      console.error('Error fetching active games:', error);
      alert('Failed to load active games. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleGameClick = (game) => {
    setSelectedGame(game);
    setShowScoreModal(true);
  };

  const updateScore = async (gameId, participantIndex, change) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/active-games/${gameId}/update-score`,
        {
          participant_index: participantIndex,
          score_change: change
        }
      );

      // Update local state
      const updatedScores = response.data.current_scores;
      setActiveGames(activeGames.map(game => {
        if (game.id === gameId) {
          return { ...game, current_scores: updatedScores };
        }
        return game;
      }));

      if (selectedGame && selectedGame.id === gameId) {
        setSelectedGame({ ...selectedGame, current_scores: updatedScores });
      }
    } catch (error) {
      console.error('Error updating score:', error);
      alert('Failed to update score: ' + (error.response?.data?.detail || error.message));
    }
  };

  const updateTimeResult = async (gameId, participantIndex, newTime) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/active-games/${gameId}/update-time`,
        {
          participant_index: participantIndex,
          time: newTime
        }
      );

      // Update local state
      const updatedScores = response.data.current_scores;
      setActiveGames(activeGames.map(game => {
        if (game.id === gameId) {
          return { ...game, current_scores: updatedScores };
        }
        return game;
      }));

      if (selectedGame && selectedGame.id === gameId) {
        setSelectedGame({ ...selectedGame, current_scores: updatedScores });
      }
    } catch (error) {
      console.error('Error updating time:', error);
      alert('Failed to update time: ' + (error.response?.data?.detail || error.message));
    }
  };

  const declareWinner = async (game) => {
    let winner;
    let winnerScore = null;
    let winnerTime = null;

    if (game.game_type === 'team') {
      winner = game.current_scores.participants.reduce((max, p) => 
        p.score > max.score ? p : max
      );
      winnerScore = winner.score;
    } else {
      // For individual events, lowest time wins
      const validParticipants = game.current_scores.participants.filter(p => p.time);
      if (validParticipants.length === 0) {
        alert('Please enter times for at least one participant');
        return;
      }
      
      const timesInSeconds = validParticipants.map(p => {
        if (!p.time) return Infinity;
        return parseFloat(p.time.replace('s', ''));
      });
      const minIndex = timesInSeconds.indexOf(Math.min(...timesInSeconds));
      winner = validParticipants[minIndex];
      winnerTime = winner.time;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/active-games/${game.id}/declare-winner`,
        {
          winner_name: winner.name,
          winner_score: winnerScore,
          winner_time: winnerTime
        }
      );

      alert(`🏆 Winner: ${winner.name}${winnerScore !== null ? ` with ${winnerScore} points` : ` with time ${winnerTime}`}!`);
      
      // Remove from active games
      setActiveGames(activeGames.filter(g => g.id !== game.id));
      setShowScoreModal(false);
      setSelectedGame(null);
    } catch (error) {
      console.error('Error declaring winner:', error);
      alert('Failed to declare winner: ' + (error.response?.data?.detail || error.message));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🏆</div>
          <h2 className="text-2xl font-bold text-gray-800">Loading Active Games...</h2>
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
                <h1 className="text-3xl font-bold">Active Games</h1>
                <p className="text-white/90">Live Score Updates</p>
              </div>
            </div>
            <div className="bg-white/20 backdrop-blur-md px-6 py-3 rounded-xl">
              <div className="text-sm text-white/90">Live Games</div>
              <div className="text-3xl font-bold">{activeGames.length}</div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeGames.length > 0 ? (
          <div className="grid gap-6">
            {activeGames.map(game => (
              <div 
                key={game.id}
                onClick={() => handleGameClick(game)}
                className="bg-white rounded-2xl p-6 shadow-xl border-4 border-green-300 hover:border-green-500 transition-all cursor-pointer transform hover:scale-[1.02]"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <span className="text-6xl">{game.game.icon}</span>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">{game.game.tamil}</h3>
                      <p className="text-gray-600">{game.game.english}</p>
                      <div className="flex gap-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" /> {game.scheduled_time}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" /> {game.venue}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold animate-pulse flex items-center gap-2">
                      🔴 LIVE
                    </span>
                    <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-bold">
                      {game.game_type === 'team' ? 'Team Event' : 'Individual Event'}
                    </span>
                  </div>
                </div>

                {/* Score Display */}
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 border-2 border-orange-200">
                  {game.game_type === 'team' ? (
                    <div className="flex justify-around items-center">
                      {game.current_scores.participants.map((participant, idx) => (
                        <div key={idx} className="text-center">
                          <div className="text-sm text-gray-600 mb-1">{participant.name}</div>
                          <div className="text-4xl font-bold text-gray-800">{participant.score}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {game.current_scores.participants.map((participant, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white rounded-lg p-3">
                          <span className="font-semibold text-gray-800">{participant.name}</span>
                          <span className="text-lg font-bold text-orange-600">{participant.time || 'Pending'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-4 text-center text-sm text-gray-500">
                  Click to update scores →
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <div className="text-6xl mb-4">🎮</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">No Active Games</h3>
            <p className="text-gray-600">All games have been completed</p>
          </div>
        )}
      </div>

      {/* Score Update Modal */}
      {showScoreModal && selectedGame && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 rounded-t-3xl sticky top-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-5xl">{selectedGame.game.icon}</span>
                  <div>
                    <h3 className="text-2xl font-bold">{selectedGame.game.tamil}</h3>
                    <p className="text-white/90">{selectedGame.game.english}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowScoreModal(false)}
                  className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {selectedGame.game_type === 'team' ? (
                // Team Event Score Update
                <div className="space-y-4">
                  <h4 className="text-xl font-bold text-gray-800 mb-4">Update Team Scores</h4>
                  {selectedGame.current_scores.participants.map((participant, idx) => (
                    <div key={idx} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border-2 border-blue-200">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="text-lg font-bold text-gray-800">{participant.name}</h5>
                        <div className="text-3xl font-bold text-blue-600">{participant.score}</div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => updateScore(selectedGame.id, idx, -1)}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                        >
                          <Minus className="h-5 w-5" /> -1
                        </button>
                        <button
                          onClick={() => updateScore(selectedGame.id, idx, 1)}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                        >
                          <Plus className="h-5 w-5" /> +1
                        </button>
                        <button
                          onClick={() => updateScore(selectedGame.id, idx, 5)}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                        >
                          <Plus className="h-5 w-5" /> +5
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Individual Event Time Update
                <div className="space-y-4">
                  <h4 className="text-xl font-bold text-gray-800 mb-4">Update Finish Times</h4>
                  {selectedGame.current_scores.participants.map((participant, idx) => (
                    <div key={idx} className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-2xl p-6 border-2 border-orange-200">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        {participant.name}
                      </label>
                      <input
                        type="text"
                        placeholder="Enter time (e.g., 12.5s)"
                        value={participant.time || ''}
                        onChange={(e) => updateTimeResult(selectedGame.id, idx, e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none text-lg font-semibold"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => declareWinner(selectedGame)}
                  className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all flex items-center justify-center gap-2"
                >
                  <Trophy className="h-6 w-6" />
                  Declare Winner
                </button>
                <button
                  onClick={() => setShowScoreModal(false)}
                  className="px-8 bg-gray-200 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-300 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}