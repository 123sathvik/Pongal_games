import React, { useState, useEffect } from 'react';
import { Users, User, Trophy, Calendar, MapPin, Clock, ArrowLeft, Plus, X, AlertCircle } from 'lucide-react';
import { scheduledGamesApi, teamRegistrationsApi, individualRegistrationsApi } from './services/api';

export default function UserRegistrationPage() {
  const [scheduledGames, setScheduledGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGame, setSelectedGame] = useState(null);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [registrations, setRegistrations] = useState({});

  // Team Registration Form
  const [teamForm, setTeamForm] = useState({
    teamName: '',
    captainName: '',
    captainPhone: '',
    captainEmail: '',
    players: ['']
  });

  // Individual Registration Form
  const [individualForm, setIndividualForm] = useState({
    playerName: '',
    phone: '',
    email: '',
    age: ''
  });

  useEffect(() => {
    fetchOpenGames();
  }, []);

  // Auto-update first player when captain name changes
  useEffect(() => {
    if (teamForm.captainName && selectedGame?.game_type === 'team') {
      setTeamForm(prev => {
        const newPlayers = [...prev.players];
        newPlayers[0] = prev.captainName;
        return { ...prev, players: newPlayers };
      });
    }
  }, [teamForm.captainName, selectedGame?.game_type]);

  const fetchOpenGames = async () => {
    try {
      const response = await scheduledGamesApi.getOpenRegistration();
      setScheduledGames(response.data);
      
      // Fetch registrations for each game
      for (const game of response.data) {
        if (game.game_type === 'team') {
          fetchTeamRegistrations(game.id);
        } else {
          fetchIndividualRegistrations(game.id);
        }
      }
    } catch (error) {
      console.error('Error fetching games:', error);
      alert('Failed to load games. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamRegistrations = async (gameId) => {
    try {
      const response = await teamRegistrationsApi.getByGameId(gameId);
      setRegistrations(prev => ({...prev, [gameId]: response.data}));
    } catch (error) {
      console.error('Error fetching team registrations:', error);
    }
  };

  const fetchIndividualRegistrations = async (gameId) => {
    try {
      const response = await individualRegistrationsApi.getByGameId(gameId);
      setRegistrations(prev => ({...prev, [gameId]: response.data}));
    } catch (error) {
      console.error('Error fetching individual registrations:', error);
    }
  };

  const handleGameSelect = (game) => {
    setSelectedGame(game);
    setShowRegistrationForm(true);
    resetForms();
  };

  const resetForms = () => {
    setTeamForm({
      teamName: '',
      captainName: '',
      captainPhone: '',
      captainEmail: '',
      players: ['']
    });
    setIndividualForm({
      playerName: '',
      phone: '',
      email: '',
      age: ''
    });
  };

  const handleAddPlayer = () => {
    // Check max players per team limit
    if (selectedGame?.max_players_per_team && teamForm.players.length >= selectedGame.max_players_per_team) {
      alert(`Maximum ${selectedGame.max_players_per_team} players allowed per team!`);
      return;
    }
    setTeamForm({...teamForm, players: [...teamForm.players, '']});
  };

  const handleRemovePlayer = (index) => {
    // Prevent removing the first player (captain)
    if (index === 0) {
      alert('Cannot remove captain from player list!');
      return;
    }
    const newPlayers = teamForm.players.filter((_, i) => i !== index);
    setTeamForm({...teamForm, players: newPlayers});
  };

  const handlePlayerChange = (index, value) => {
    // Prevent editing the first player (captain) directly
    if (index === 0) {
      alert('Please update the captain name in the Captain Details section!');
      return;
    }
    const newPlayers = [...teamForm.players];
    newPlayers[index] = value;
    setTeamForm({...teamForm, players: newPlayers});
  };

  const handleTeamRegistration = async () => {
    if (!teamForm.teamName || !teamForm.captainName) {
      alert('Please fill in team name and captain name!');
      return;
    }

    const validPlayers = teamForm.players.filter(p => p.trim() !== '');
    if (validPlayers.length === 0) {
      alert('Please add at least one player!');
      return;
    }

    // Check max players per team limit
    if (selectedGame?.max_players_per_team && validPlayers.length > selectedGame.max_players_per_team) {
      alert(`Maximum ${selectedGame.max_players_per_team} players allowed per team!`);
      return;
    }

    try {
      await teamRegistrationsApi.create({
        scheduled_game_id: selectedGame.id,
        team_name: teamForm.teamName,
        captain_name: teamForm.captainName,
        captain_phone: teamForm.captainPhone || null,
        captain_email: teamForm.captainEmail || null,
        players: validPlayers
      });

      alert('Team registered successfully! 🎉');
      setShowRegistrationForm(false);
      fetchTeamRegistrations(selectedGame.id);
      resetForms();
    } catch (error) {
      alert('Registration failed: ' + error.message);
    }
  };

  const handleIndividualRegistration = async () => {
    if (!individualForm.playerName) {
      alert('Please enter your name!');
      return;
    }

    try {
      await individualRegistrationsApi.create({
        scheduled_game_id: selectedGame.id,
        player_name: individualForm.playerName,
        phone: individualForm.phone || null,
        email: individualForm.email || null,
        age: individualForm.age ? parseInt(individualForm.age) : null
      });

      alert('Registered successfully! 🎉');
      setShowRegistrationForm(false);
      fetchIndividualRegistrations(selectedGame.id);
      resetForms();
    } catch (error) {
      alert('Registration failed: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🏆</div>
          <h2 className="text-2xl font-bold text-gray-800">Loading Games...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 via-yellow-500 to-red-500 text-white shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
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
              <h1 className="text-3xl font-bold">Game Registration</h1>
              <p className="text-white/90">Register your team or join individually</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {!showRegistrationForm ? (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-orange-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <Calendar className="h-7 w-7 text-orange-500" />
                Available Games
              </h2>
              <p className="text-gray-600 mb-6">Select a game to register</p>

              <div className="grid gap-4">
                {scheduledGames.length > 0 ? (
                  scheduledGames.map(game => {
                    const regCount = registrations[game.id]?.length || 0;
                    const maxReached = game.max_teams && regCount >= game.max_teams;

                    return (
                      <div 
                        key={game.id}
                        className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl p-6 border-2 border-orange-200 hover:border-orange-400 transition-all"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <span className="text-5xl">{game.games.icon}</span>
                            <div>
                              <h3 className="text-2xl font-bold text-gray-800">{game.games.tamil}</h3>
                              <p className="text-gray-600 text-lg">{game.games.english}</p>
                              <div className="flex items-center gap-2 mt-2">
                                {game.game_type === 'team' ? (
                                  <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                                    <Users className="h-4 w-4" />
                                    Team Event
                                  </span>
                                ) : (
                                  <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
                                    <User className="h-4 w-4" />
                                    Individual Event
                                  </span>
                                )}
                                {game.max_players_per_team && game.game_type === 'team' && (
                                  <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                    Max {game.max_players_per_team} players/team
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-3 mb-4">
                          <div className="bg-white rounded-lg p-3 border border-orange-300">
                            <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Date
                            </div>
                            <div className="font-bold text-gray-800">
                              {new Date(game.date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-orange-300">
                            <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Time
                            </div>
                            <div className="font-bold text-gray-800">{game.scheduled_time}</div>
                          </div>
                          <div className="bg-white rounded-lg p-3 border border-orange-300">
                            <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              Venue
                            </div>
                            <div className="font-bold text-gray-800">{game.venue}</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            <span className="font-semibold">{regCount}</span> {game.game_type === 'team' ? 'teams' : 'players'} registered
                            {game.max_teams && ` (Max: ${game.max_teams})`}
                          </div>
                          <button
                            onClick={() => handleGameSelect(game)}
                            disabled={maxReached}
                            className={`px-6 py-3 rounded-xl font-bold transition-all ${
                              maxReached
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg'
                            }`}
                          >
                            {maxReached ? 'Full' : 'Register Now'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🎮</div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">No Games Available</h3>
                    <p className="text-gray-600">Check back later for new games!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl p-8 shadow-xl border-2 border-orange-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <span className="text-5xl">{selectedGame.games.icon}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">{selectedGame.games.tamil}</h2>
                    <p className="text-gray-600">{selectedGame.games.english}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRegistrationForm(false)}
                  className="bg-gray-200 p-2 rounded-lg hover:bg-gray-300 transition-all"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {selectedGame.game_type === 'team' ? (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Users className="h-6 w-6 text-orange-500" />
                    Team Registration
                  </h3>

                  {/* Max Players Warning */}
                  {selectedGame.max_players_per_team && (
                    <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200 flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-blue-800">
                          Maximum {selectedGame.max_players_per_team} players allowed per team
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          Currently: {teamForm.players.filter(p => p.trim()).length} / {selectedGame.max_players_per_team} players
                        </p>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Team Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your team name"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                      value={teamForm.teamName}
                      onChange={(e) => setTeamForm({...teamForm, teamName: e.target.value})}
                    />
                  </div>

                  <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200">
                    <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      👨‍✈️ Captain Details
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Captain Name *
                        </label>
                        <input
                          type="text"
                          placeholder="Captain's name"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                          value={teamForm.captainName}
                          onChange={(e) => setTeamForm({...teamForm, captainName: e.target.value})}
                        />
                        <p className="text-xs text-blue-600 mt-1">
                          Captain will be automatically added as Player 1
                        </p>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Phone (Optional)
                          </label>
                          <input
                            type="tel"
                            placeholder="Phone number"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                            value={teamForm.captainPhone}
                            onChange={(e) => setTeamForm({...teamForm, captainPhone: e.target.value})}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Email (Optional)
                          </label>
                          <input
                            type="email"
                            placeholder="Email address"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                            value={teamForm.captainEmail}
                            onChange={(e) => setTeamForm({...teamForm, captainEmail: e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-bold text-gray-700">
                        Team Players *
                      </label>
                      <button
                        onClick={handleAddPlayer}
                        disabled={selectedGame.max_players_per_team && teamForm.players.length >= selectedGame.max_players_per_team}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-1 ${
                          selectedGame.max_players_per_team && teamForm.players.length >= selectedGame.max_players_per_team
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-green-500 text-white hover:bg-green-600'
                        }`}
                      >
                        <Plus className="h-4 w-4" />
                        Add Player
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {teamForm.players.map((player, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            placeholder={index === 0 ? `Player ${index + 1} (Captain)` : `Player ${index + 1} name`}
                            className={`flex-1 px-4 py-3 border-2 rounded-xl focus:outline-none ${
                              index === 0 
                                ? 'border-blue-300 bg-blue-50 cursor-not-allowed' 
                                : 'border-gray-200 focus:border-orange-500'
                            }`}
                            value={player}
                            onChange={(e) => handlePlayerChange(index, e.target.value)}
                            disabled={index === 0}
                          />
                          {teamForm.players.length > 1 && index !== 0 && (
                            <button
                              onClick={() => handleRemovePlayer(index)}
                              className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-all"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleTeamRegistration}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all"
                  >
                    Register Team
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <User className="h-6 w-6 text-purple-500" />
                    Individual Registration
                  </h3>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter your name"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                      value={individualForm.playerName}
                      onChange={(e) => setIndividualForm({...individualForm, playerName: e.target.value})}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Phone (Optional)
                      </label>
                      <input
                        type="tel"
                        placeholder="Phone number"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                        value={individualForm.phone}
                        onChange={(e) => setIndividualForm({...individualForm, phone: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Age (Optional)
                      </label>
                      <input
                        type="number"
                        placeholder="Your age"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                        value={individualForm.age}
                        onChange={(e) => setIndividualForm({...individualForm, age: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Email (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="Email address"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                      value={individualForm.email}
                      onChange={(e) => setIndividualForm({...individualForm, email: e.target.value})}
                    />
                  </div>

                  <button
                    onClick={handleIndividualRegistration}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}