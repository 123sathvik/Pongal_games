import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Calendar, Trophy, Users, Eye, UserPlus, Trash2, Target } from 'lucide-react';
import { gamesApi, scheduledGamesApi, teamRegistrationsApi, individualRegistrationsApi } from './services/api';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

export default function AdminPanel() {
  const [gameList, setGameList] = useState([]);
  const [scheduledGames, setScheduledGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingCustomGame, setIsAddingCustomGame] = useState(false);
  const [viewingRegistrations, setViewingRegistrations] = useState(null);
  const [teamRegistrations, setTeamRegistrations] = useState([]);
  const [individualRegistrations, setIndividualRegistrations] = useState([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [showAddPlayerForm, setShowAddPlayerForm] = useState(false);
  const [showLeagueScheduler, setShowLeagueScheduler] = useState(false);
  const [availableTeams, setAvailableTeams] = useState([]);

  const [newGame, setNewGame] = useState({
    gameId: '',
    time: '',
    date: '',
    venue: '',
    gameType: 'team',
    maxTeams: '',
    maxPlayersPerTeam: '',
    isLeague: false
  });

  const [customGame, setCustomGame] = useState({
    icon: '',
    tamil: '',
    english: '',
    category: 'main'
  });

  const [leagueMatch, setLeagueMatch] = useState({
    gameId: '',
    time: '',
    date: '',
    venue: '',
    stage: 'group',
    team1Id: '',
    team2Id: '',
    maxPlayersPerTeam: ''
  });

  const [newTeamRegistration, setNewTeamRegistration] = useState({
    teamName: '',
    captainName: '',
    captainPhone: '',
    captainEmail: '',
    players: ['']
  });

  const [newIndividualRegistration, setNewIndividualRegistration] = useState({
    playerName: '',
    phone: '',
    email: '',
    age: ''
  });

  useEffect(() => {
    fetchGames();
    fetchScheduledGames();
  }, []);

  const fetchGames = async () => {
    try {
      const response = await gamesApi.getAll();
      setGameList(response.data);
    } catch (error) {
      console.error('Error fetching games:', error);
      alert('Failed to load games');
    }
  };

  const fetchScheduledGames = async () => {
    try {
      const response = await scheduledGamesApi.getAll();
      const transformed = response.data.map(sg => ({
        id: sg.id,
        game: sg.games,
        scheduledTime: sg.scheduled_time,
        date: sg.date,
        venue: sg.venue,
        participants: sg.participants,
        isActive: sg.is_active,
        registrationOpen: sg.registration_open,
        gameType: sg.game_type,
        maxTeams: sg.max_teams,
        maxPlayersPerTeam: sg.max_players_per_team,
        isLeague: sg.is_league,
        leagueStage: sg.league_stage,
        team1Id: sg.team1_id,
        team2Id: sg.team2_id
      }));
      setScheduledGames(transformed);
    } catch (error) {
      console.error('Error fetching scheduled games:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLeagueGameSelect = async (gameId) => {
    setLeagueMatch({...leagueMatch, gameId});
    try {
      const response = await axios.get(`${API_URL}/team-registrations/all/${gameId}`);
      setAvailableTeams(response.data);
    } catch (error) {
      console.error('Error fetching teams:', error);
      alert('Failed to load teams for this game');
    }
  };

  const handleScheduleLeagueMatch = async () => {
    if (!leagueMatch.gameId || !leagueMatch.date || !leagueMatch.time || 
        !leagueMatch.venue || !leagueMatch.team1Id || !leagueMatch.team2Id) {
      alert('Please fill in all required fields and select both teams!');
      return;
    }

    if (leagueMatch.team1Id === leagueMatch.team2Id) {
      alert('Please select different teams!');
      return;
    }

    try {
      const team1 = availableTeams.find(t => t.id === parseInt(leagueMatch.team1Id));
      const team2 = availableTeams.find(t => t.id === parseInt(leagueMatch.team2Id));

      await axios.post(`${API_URL}/scheduled-games/league`, {
        game_id: parseInt(leagueMatch.gameId),
        scheduled_time: leagueMatch.time,
        date: leagueMatch.date,
        venue: leagueMatch.venue,
        participants: [team1?.team_name || '', team2?.team_name || ''],
        game_type: 'team',
        is_league: true,
        league_stage: leagueMatch.stage,
        team1_id: parseInt(leagueMatch.team1Id),
        team2_id: parseInt(leagueMatch.team2Id),
        max_players_per_team: leagueMatch.maxPlayersPerTeam ? parseInt(leagueMatch.maxPlayersPerTeam) : null
      });

      alert('League match scheduled successfully! 🏆');
      setShowLeagueScheduler(false);
      setLeagueMatch({
        gameId: '',
        time: '',
        date: '',
        venue: '',
        stage: 'group',
        team1Id: '',
        team2Id: '',
        maxPlayersPerTeam: ''
      });
      fetchScheduledGames();
    } catch (error) {
      console.error('Error scheduling league match:', error);
      alert('Failed to schedule league match: ' + (error.response?.data?.detail || error.message));
    }
  };

  const handleGameSelect = (value) => {
    if (value === 'custom') {
      setIsAddingCustomGame(true);
      setNewGame({...newGame, gameId: ''});
    } else {
      setIsAddingCustomGame(false);
      setNewGame({...newGame, gameId: value});
    }
  };

  const handleAddCustomGame = async () => {
    if (!customGame.english) {
      alert('Please fill in game name!');
      return;
    }

    try {
      const response = await gamesApi.create({
        icon: customGame.icon || '🎮',
        tamil: customGame.tamil || customGame.english,
        english: customGame.english,
        category: customGame.category
      });

      setGameList([...gameList, response.data]);
      setNewGame({...newGame, gameId: response.data.id.toString()});
      setIsAddingCustomGame(false);
      
      setCustomGame({
        icon: '',
        tamil: '',
        english: '',
        category: 'main'
      });

      alert('Custom game added successfully!');
    } catch (error) {
      console.error('Error adding custom game:', error);
      alert('Failed to add custom game: ' + error.message);
    }
  };

  const handleAddGame = async () => {
    if (!newGame.gameId || !newGame.date || !newGame.time || !newGame.venue) {
      alert('Please fill in all required fields!');
      return;
    }

    try {
      const response = await scheduledGamesApi.create({
        game_id: parseInt(newGame.gameId),
        scheduled_time: newGame.time,
        date: newGame.date,
        venue: newGame.venue,
        participants: [],
        game_type: newGame.gameType,
        max_teams: newGame.maxTeams ? parseInt(newGame.maxTeams) : null,
        max_players_per_team: newGame.maxPlayersPerTeam ? parseInt(newGame.maxPlayersPerTeam) : null,
        is_league: false
      });

      const transformed = {
        id: response.data.id,
        game: response.data.games,
        scheduledTime: response.data.scheduled_time,
        date: response.data.date,
        venue: response.data.venue,
        participants: response.data.participants,
        isActive: response.data.is_active,
        registrationOpen: response.data.registration_open,
        gameType: response.data.game_type,
        maxTeams: response.data.max_teams,
        maxPlayersPerTeam: response.data.max_players_per_team,
        isLeague: response.data.is_league
      };

      setScheduledGames([...scheduledGames, transformed]);
      
      setNewGame({
        gameId: '',
        time: '',
        date: '',
        venue: '',
        gameType: 'team',
        maxTeams: '',
        maxPlayersPerTeam: '',
        isLeague: false
      });

      alert('Game scheduled successfully! Users can now register.');
    } catch (error) {
      console.error('Error scheduling game:', error);
      alert('Failed to schedule game: ' + error.message);
    }
  };

  const handleDeleteGame = async (id) => {
    if (!window.confirm('Are you sure you want to delete this game?')) return;

    try {
      await scheduledGamesApi.delete(id);
      setScheduledGames(scheduledGames.filter(game => game.id !== id));
      alert('Game deleted successfully!');
    } catch (error) {
      console.error('Error deleting game:', error);
      alert('Failed to delete game: ' + error.message);
    }
  };

  const handleActivateGame = async (id) => {
    try {
      await scheduledGamesApi.toggleActivation(id);
      setScheduledGames(scheduledGames.map(game => 
        game.id === id ? { ...game, isActive: !game.isActive } : game
      ));
    } catch (error) {
      console.error('Error toggling game activation:', error);
      alert('Failed to update game status: ' + error.message);
    }
  };

  const handleToggleRegistration = async (id) => {
    try {
      await scheduledGamesApi.toggleRegistration(id);
      setScheduledGames(scheduledGames.map(game => 
        game.id === id ? { ...game, registrationOpen: !game.registrationOpen } : game
      ));
    } catch (error) {
      console.error('Error toggling registration:', error);
      alert('Failed to update registration status: ' + error.message);
    }
  };

  const handleViewRegistrations = async (game) => {
    setViewingRegistrations(game);
    setLoadingRegistrations(true);
    setShowAddPlayerForm(false);
    
    try {
      if (game.gameType === 'team') {
        const response = await teamRegistrationsApi.getByGameId(game.id);
        setTeamRegistrations(response.data);
        setIndividualRegistrations([]);
      } else {
        const response = await individualRegistrationsApi.getByGameId(game.id);
        setIndividualRegistrations(response.data);
        setTeamRegistrations([]);
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
      alert('Failed to load registrations: ' + error.message);
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const handleDeleteTeamRegistration = async (registrationId) => {
    if (!window.confirm('Are you sure you want to remove this team?')) return;

    try {
      await teamRegistrationsApi.delete(registrationId);
      setTeamRegistrations(teamRegistrations.filter(reg => reg.id !== registrationId));
      alert('Team removed successfully!');
    } catch (error) {
      console.error('Error deleting team registration:', error);
      alert('Failed to remove team: ' + error.message);
    }
  };

  const handleDeleteIndividualRegistration = async (registrationId) => {
    if (!window.confirm('Are you sure you want to remove this player?')) return;

    try {
      await individualRegistrationsApi.delete(registrationId);
      setIndividualRegistrations(individualRegistrations.filter(reg => reg.id !== registrationId));
      alert('Player removed successfully!');
    } catch (error) {
      console.error('Error deleting individual registration:', error);
      alert('Failed to remove player: ' + error.message);
    }
  };

  const handleAddTeamRegistration = async () => {
    if (!newTeamRegistration.teamName || !newTeamRegistration.captainName) {
      alert('Please fill in team name and captain name!');
      return;
    }

    const validPlayers = newTeamRegistration.players.filter(p => p.trim() !== '');
    if (validPlayers.length === 0) {
      alert('Please add at least one player!');
      return;
    }

    try {
      const response = await teamRegistrationsApi.create({
        scheduled_game_id: viewingRegistrations.id,
        team_name: newTeamRegistration.teamName,
        captain_name: newTeamRegistration.captainName,
        captain_phone: newTeamRegistration.captainPhone || null,
        captain_email: newTeamRegistration.captainEmail || null,
        players: validPlayers
      });

      setTeamRegistrations([...teamRegistrations, response.data]);
      setNewTeamRegistration({
        teamName: '',
        captainName: '',
        captainPhone: '',
        captainEmail: '',
        players: ['']
      });
      setShowAddPlayerForm(false);
      alert('Team registered successfully!');
    } catch (error) {
      console.error('Error adding team registration:', error);
      alert('Failed to register team: ' + error.message);
    }
  };

  const handleAddIndividualRegistration = async () => {
    if (!newIndividualRegistration.playerName) {
      alert('Please fill in player name!');
      return;
    }

    try {
      const response = await individualRegistrationsApi.create({
        scheduled_game_id: viewingRegistrations.id,
        player_name: newIndividualRegistration.playerName,
        phone: newIndividualRegistration.phone || null,
        email: newIndividualRegistration.email || null,
        age: newIndividualRegistration.age ? parseInt(newIndividualRegistration.age) : null
      });

      setIndividualRegistrations([...individualRegistrations, response.data]);
      setNewIndividualRegistration({
        playerName: '',
        phone: '',
        email: '',
        age: ''
      });
      setShowAddPlayerForm(false);
      alert('Player registered successfully!');
    } catch (error) {
      console.error('Error adding individual registration:', error);
      alert('Failed to register player: ' + (error.response?.data?.detail || error.message));
    }
  };

  const addPlayerField = () => {
    setNewTeamRegistration({
      ...newTeamRegistration,
      players: [...newTeamRegistration.players, '']
    });
  };

  const removePlayerField = (index) => {
    const newPlayers = newTeamRegistration.players.filter((_, i) => i !== index);
    setNewTeamRegistration({
      ...newTeamRegistration,
      players: newPlayers.length > 0 ? newPlayers : ['']
    });
  };

  const updatePlayerField = (index, value) => {
    const newPlayers = [...newTeamRegistration.players];
    newPlayers[index] = value;
    setNewTeamRegistration({
      ...newTeamRegistration,
      players: newPlayers
    });
  };

  const getStageLabel = (stage) => {
    const labels = {
      'group': '🏁 Group Stage',
      'quarter_final': '🥉 Quarter Final',
      'semi_final': '🥈 Semi Final',
      'final': '🏆 Final',
      'third_place': '🥉 3rd Place'
    };
    return labels[stage] || stage;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🏆</div>
          <h2 className="text-2xl font-bold text-gray-800">Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
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
                <h1 className="text-3xl font-bold">Admin Panel</h1>
                <p className="text-white/90">Manage Games & League Schedule</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLeagueScheduler(!showLeagueScheduler)}
                className="bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition-all flex items-center gap-2 shadow-lg"
              >
                <Target className="h-5 w-5" />
                {showLeagueScheduler ? 'Regular Schedule' : 'League Schedule'}
              </button>
              <button
                onClick={() => window.location.href = '/active-games'}
                className="bg-white text-orange-600 px-6 py-3 rounded-xl font-bold hover:bg-orange-50 transition-all flex items-center gap-2 shadow-lg"
              >
                <Trophy className="h-5 w-5" />
                Update Scores
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Schedule Form - Regular or League */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              {showLeagueScheduler ? (
                <>
                  <Target className="h-8 w-8 text-purple-500" />
                  Schedule League Match
                </>
              ) : (
                <>
                  <Plus className="h-8 w-8 text-orange-500" />
                  Schedule New Game
                </>
              )}
            </h2>
            
            <div className={`bg-white rounded-2xl p-8 shadow-xl border-2 ${showLeagueScheduler ? 'border-purple-200' : 'border-orange-200'}`}>
              {!showLeagueScheduler ? (
                /* Regular Game Scheduling Form */
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      🎮 Select Game
                    </label>
                    <select 
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                      value={isAddingCustomGame ? 'custom' : newGame.gameId}
                      onChange={(e) => handleGameSelect(e.target.value)}
                    >
                      <option value="">-- Choose a Game --</option>
                      {gameList.map(game => (
                        <option key={game.id} value={game.id}>
                          {game.icon} {game.tamil} ({game.english})
                        </option>
                      ))}
                      <option value="custom" className="font-bold text-orange-600">
                        ➕ Add Custom Game
                      </option>
                    </select>
                  </div>

                  {isAddingCustomGame && (
                    <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-6 border-2 border-orange-300 space-y-4">
                      <h3 className="font-bold text-gray-800 text-lg mb-3">Create Custom Game</h3>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Icon (emoji)</label>
                        <input 
                          type="text"
                          placeholder="🎮"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                          value={customGame.icon}
                          onChange={(e) => setCustomGame({...customGame, icon: e.target.value})}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Tamil Name (optional)</label>
                        <input 
                          type="text"
                          placeholder="தமிழ் பெயர்"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                          value={customGame.tamil}
                          onChange={(e) => setCustomGame({...customGame, tamil: e.target.value})}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                        <input 
                          type="text"
                          placeholder="Game Name"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                          value={customGame.english}
                          onChange={(e) => setCustomGame({...customGame, english: e.target.value})}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                        <select 
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                          value={customGame.category}
                          onChange={(e) => setCustomGame({...customGame, category: e.target.value})}
                        >
                          <option value="main">Main</option>
                          <option value="kids">Kids</option>
                          <option value="women">Women</option>
                          <option value="men">Men</option>
                          <option value="fun">Fun</option>
                        </select>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={handleAddCustomGame}
                          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all"
                        >
                          ✓ Add to Game List
                        </button>
                        <button
                          onClick={() => {
                            setIsAddingCustomGame(false);
                            setCustomGame({ icon: '', tamil: '', english: '', category: 'main' });
                          }}
                          className="px-6 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300 transition-all"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">📅 Date *</label>
                      <input 
                        type="date"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                        value={newGame.date}
                        onChange={(e) => setNewGame({...newGame, date: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">🕐 Time *</label>
                      <input 
                        type="time"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                        value={newGame.time}
                        onChange={(e) => setNewGame({...newGame, time: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">📍 Venue *</label>
                    <input 
                      type="text"
                      placeholder="e.g., Main Ground, Stadium"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none"
                      value={newGame.venue}
                      onChange={(e) => setNewGame({...newGame, venue: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">🎯 Game Type *</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="gameType" 
                          value="team"
                          checked={newGame.gameType === 'team'}
                          onChange={(e) => setNewGame({...newGame, gameType: e.target.value})}
                          className="w-4 h-4 text-orange-500"
                        />
                        <span className="font-semibold">Team Event</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="gameType" 
                          value="individual"
                          checked={newGame.gameType === 'individual'}
                          onChange={(e) => setNewGame({...newGame, gameType: e.target.value})}
                          className="w-4 h-4 text-orange-500"
                        />
                        <span className="font-semibold">Individual Event</span>
                      </label>
                    </div>
                  </div>

                  <div className="bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                    <h4 className="font-bold text-gray-800 mb-3">Optional Limits</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {newGame.gameType === 'team' ? 'Max Teams' : 'Max Players'}
                        </label>
                        <input 
                          type="number"
                          placeholder="Leave empty for unlimited"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                          value={newGame.maxTeams}
                          onChange={(e) => setNewGame({...newGame, maxTeams: e.target.value})}
                        />
                      </div>
                      {newGame.gameType === 'team' && (
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Max Players Per Team</label>
                          <input 
                            type="number"
                            placeholder="Leave empty for unlimited"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none"
                            value={newGame.maxPlayersPerTeam}
                            onChange={(e) => setNewGame({...newGame, maxPlayersPerTeam: e.target.value})}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={handleAddGame}
                    disabled={isAddingCustomGame}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                      isAddingCustomGame 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-2xl'
                    }`}
                  >
                    <Plus className="h-6 w-6" />
                    Schedule Game (Users Will Register)
                  </button>
                </div>
              ) : (
                /* League Match Scheduling Form */
                <div className="space-y-6">
                  <div className="bg-purple-50 rounded-xl p-4 border-2 border-purple-200">
                    <h3 className="font-bold text-purple-800 mb-2">🏆 League Match Scheduling</h3>
                    <p className="text-sm text-purple-600">
                      Schedule matches between specific teams for tournaments, group stages, finals, etc.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">🎮 Select Game</label>
                    <select 
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                      value={leagueMatch.gameId}
                      onChange={(e) => handleLeagueGameSelect(e.target.value)}
                    >
                      <option value="">-- Choose a Game --</option>
                      {gameList.filter(g => g.category !== 'individual').map(game => (
                        <option key={game.id} value={game.id}>
                          {game.icon} {game.tamil} ({game.english})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">🏁 Tournament Stage *</label>
                    <select 
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                      value={leagueMatch.stage}
                      onChange={(e) => setLeagueMatch({...leagueMatch, stage: e.target.value})}
                    >
                      <option value="group">Group Stage</option>
                      <option value="quarter_final">Quarter Final</option>
                      <option value="semi_final">Semi Final</option>
                      <option value="third_place">3rd Place Match</option>
                      <option value="final">Final</option>
                    </select>
                  </div>

                  {availableTeams.length > 0 && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">👥 Team 1 *</label>
                        <select 
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                          value={leagueMatch.team1Id}
                          onChange={(e) => setLeagueMatch({...leagueMatch, team1Id: e.target.value})}
                        >
                          <option value="">-- Select Team 1 --</option>
                          {availableTeams.map(team => (
                            <option key={team.id} value={team.id}>
                              {team.team_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">👥 Team 2 *</label>
                        <select 
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                          value={leagueMatch.team2Id}
                          onChange={(e) => setLeagueMatch({...leagueMatch, team2Id: e.target.value})}
                        >
                          <option value="">-- Select Team 2 --</option>
                          {availableTeams.filter(t => t.id.toString() !== leagueMatch.team1Id).map(team => (
                            <option key={team.id} value={team.id}>
                              {team.team_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {leagueMatch.gameId && availableTeams.length === 0 && (
                    <div className="bg-yellow-50 rounded-xl p-4 border-2 border-yellow-200">
                      <p className="text-yellow-800 font-semibold">⚠️ No teams found for this game</p>
                      <p className="text-sm text-yellow-600 mt-1">Please schedule a regular game first and allow teams to register.</p>
                    </div>
                  )}

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">📅 Date *</label>
                      <input 
                        type="date"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                        value={leagueMatch.date}
                        onChange={(e) => setLeagueMatch({...leagueMatch, date: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">🕐 Time *</label>
                      <input 
                        type="time"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                        value={leagueMatch.time}
                        onChange={(e) => setLeagueMatch({...leagueMatch, time: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">📍 Venue *</label>
                    <input 
                      type="text"
                      placeholder="e.g., Main Ground, Stadium"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                      value={leagueMatch.venue}
                      onChange={(e) => setLeagueMatch({...leagueMatch, venue: e.target.value})}
                    />
                  </div>

                  <button 
                    onClick={handleScheduleLeagueMatch}
                    disabled={!leagueMatch.gameId || availableTeams.length === 0}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                      !leagueMatch.gameId || availableTeams.length === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:shadow-2xl'
                    }`}
                  >
                    <Target className="h-6 w-6" />
                    Schedule League Match
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Scheduled Games List */}
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
              <Calendar className="h-8 w-8 text-orange-500" />
              Scheduled Games ({scheduledGames.length})
            </h2>

            <div className="space-y-4">
              {scheduledGames.length > 0 ? (
                scheduledGames.map(game => (
                  <div 
                    key={game.id} 
                    className={`bg-white rounded-2xl p-6 shadow-lg border-2 transition-all ${
                      game.isActive 
                        ? 'border-green-500 ring-4 ring-green-200' 
                        : game.isLeague
                        ? 'border-purple-300 hover:border-purple-500'
                        : 'border-yellow-200 hover:border-orange-400'
                    }`}
                  >
                    {game.isLeague && (
                      <div className="bg-purple-500 text-white px-4 py-2 rounded-lg mb-4 text-center font-bold flex items-center justify-center gap-2">
                        <Target className="h-5 w-5" />
                        LEAGUE MATCH - {getStageLabel(game.leagueStage)}
                      </div>
                    )}

                    {game.isActive && (
                      <div className="bg-green-500 text-white px-4 py-2 rounded-lg mb-4 text-center font-bold flex items-center justify-center gap-2">
                        <span className="animate-pulse">🟢</span>
                        GAME ACTIVE
                      </div>
                    )}
                    
                    {!game.registrationOpen && !game.isLeague && (
                      <div className="bg-red-500 text-white px-4 py-2 rounded-lg mb-4 text-center font-bold">
                        🔒 Registration Closed
                      </div>
                    )}
                    
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <span className="text-5xl">{game.game.icon}</span>
                        <div>
                          <h3 className="text-xl font-bold text-gray-800">{game.game.tamil}</h3>
                          <p className="text-gray-600">{game.game.english}</p>
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {game.gameType === 'team' && !game.isLeague && (
                              <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                Team Event
                              </span>
                            )}
                            {game.gameType === 'individual' && (
                              <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                Individual
                              </span>
                            )}
                            {game.isLeague && (
                              <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                                League
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteGame(game.id)}
                        className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-all"
                        title="Delete game"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>

                    {game.isLeague && game.participants && game.participants.length > 0 && (
                      <div className="bg-purple-50 rounded-lg p-4 border border-purple-200 mb-4">
                        <div className="font-bold text-purple-800 mb-2">🏆 Match-up</div>
                        <div className="flex items-center justify-center gap-4">
                          <span className="bg-purple-500 text-white px-4 py-2 rounded-lg font-bold">
                            {game.participants[0]}
                          </span>
                          <span className="text-2xl font-bold text-purple-600">VS</span>
                          <span className="bg-purple-500 text-white px-4 py-2 rounded-lg font-bold">
                            {game.participants[1]}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                        <div className="text-xs text-gray-600 mb-1">📅 Date</div>
                        <div className="font-bold text-gray-800 text-sm">
                          {new Date(game.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                        <div className="text-xs text-gray-600 mb-1">🕐 Time</div>
                        <div className="font-bold text-gray-800 text-sm">{game.scheduledTime}</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3 border border-green-200 col-span-2">
                        <div className="text-xs text-gray-600 mb-1">📍 Venue</div>
                        <div className="font-bold text-gray-800 text-sm">{game.venue}</div>
                      </div>
                    </div>

                    {!game.isLeague && (
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <button
                          onClick={() => handleViewRegistrations(game)}
                          className="py-3 rounded-xl font-bold transition-all bg-blue-500 text-white hover:bg-blue-600 flex items-center justify-center gap-2"
                        >
                          <Eye className="h-5 w-5" />
                          View Registrations
                        </button>
                        
                        <button
                          onClick={() => handleToggleRegistration(game.id)}
                          className={`py-3 rounded-xl font-bold transition-all ${
                            game.registrationOpen
                              ? 'bg-yellow-500 text-white hover:bg-yellow-600'
                              : 'bg-green-500 text-white hover:bg-green-600'
                          }`}
                        >
                          {game.registrationOpen ? '🔒 Close Registration' : '🔓 Open Registration'}
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-3">
                      <button
                        onClick={() => handleActivateGame(game.id)}
                        className={`py-3 rounded-xl font-bold transition-all ${
                          game.isActive
                            ? 'bg-gray-400 text-white hover:bg-gray-500'
                            : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:shadow-lg'
                        }`}
                      >
                        {game.isActive ? '⏸️ Deactivate' : '▶️ Activate'}
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
                  <div className="text-6xl mb-4">📅</div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">No Scheduled Games</h3>
                  <p className="text-gray-600">Schedule your first game using the form</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Registration Viewer Modal - Keep existing code */}
        {viewingRegistrations && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold flex items-center gap-3">
                      <Users className="h-8 w-8" />
                      Registrations - {viewingRegistrations.game.tamil}
                    </h3>
                    <p className="text-white/90 mt-1">
                      {viewingRegistrations.gameType === 'team' ? 'Team Event' : 'Individual Event'}
                    </p>
                  </div>
                  <button
                    onClick={() => setViewingRegistrations(null)}
                    className="bg-white/20 backdrop-blur-md p-2 rounded-lg hover:bg-white/30 transition-all"
                  >
                    <ArrowLeft className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {loadingRegistrations ? (
                  <div className="text-center py-12">
                    <div className="animate-spin text-4xl mb-4">⚽</div>
                    <p className="text-gray-600">Loading registrations...</p>
                  </div>
                ) : (
                  <>
                    {!showAddPlayerForm && (
                      <button
                        onClick={() => setShowAddPlayerForm(true)}
                        className="w-full mb-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        <UserPlus className="h-5 w-5" />
                        Add {viewingRegistrations.gameType === 'team' ? 'Team' : 'Player'}
                      </button>
                    )}

                    {showAddPlayerForm && (
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 mb-6 border-2 border-green-300">
                        <h4 className="font-bold text-gray-800 mb-4 text-lg">
                          Add New {viewingRegistrations.gameType === 'team' ? 'Team' : 'Player'}
                        </h4>

                        {viewingRegistrations.gameType === 'team' ? (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Team Name *</label>
                              <input
                                type="text"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                                value={newTeamRegistration.teamName}
                                onChange={(e) => setNewTeamRegistration({...newTeamRegistration, teamName: e.target.value})}
                                placeholder="Enter team name"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Captain Name *</label>
                              <input
                                type="text"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                                value={newTeamRegistration.captainName}
                                onChange={(e) => setNewTeamRegistration({...newTeamRegistration, captainName: e.target.value})}
                                placeholder="Enter captain name"
                              />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                                <input
                                  type="tel"
                                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                                  value={newTeamRegistration.captainPhone}
                                  onChange={(e) => setNewTeamRegistration({...newTeamRegistration, captainPhone: e.target.value})}
                                  placeholder="Captain's phone"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                <input
                                  type="email"
                                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                                  value={newTeamRegistration.captainEmail}
                                  onChange={(e) => setNewTeamRegistration({...newTeamRegistration, captainEmail: e.target.value})}
                                  placeholder="Captain's email"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Players *</label>
                              <div className="space-y-2">
                                {newTeamRegistration.players.map((player, index) => (
                                  <div key={index} className="flex gap-2">
                                    <input
                                      type="text"
                                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                                      value={player}
                                      onChange={(e) => updatePlayerField(index, e.target.value)}
                                      placeholder={`Player ${index + 1} name`}
                                    />
                                    {index > 0 && (
                                      <button
                                        onClick={() => removePlayerField(index)}
                                        className="bg-red-500 text-white px-4 rounded-xl hover:bg-red-600"
                                      >
                                        Remove
                                      </button>
                                    )}
                                  </div>
                                ))}
                                <button
                                  onClick={addPlayerField}
                                  className="w-full bg-blue-500 text-white py-2 rounded-xl hover:bg-blue-600 font-semibold"
                                >
                                  + Add Player
                                </button>
                              </div>
                            </div>

                            <div className="flex gap-3">
                              <button
                                onClick={handleAddTeamRegistration}
                                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-bold hover:shadow-lg"
                              >
                                Register Team
                              </button>
                              <button
                                onClick={() => {
                                  setShowAddPlayerForm(false);
                                  setNewTeamRegistration({
                                    teamName: '',
                                    captainName: '',
                                    captainPhone: '',
                                    captainEmail: '',
                                    players: ['']
                                  });
                                }}
                                className="px-6 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Player Name *</label>
                              <input
                                type="text"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                                value={newIndividualRegistration.playerName}
                                onChange={(e) => setNewIndividualRegistration({...newIndividualRegistration, playerName: e.target.value})}
                                placeholder="Enter player name"
                              />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                                <input
                                  type="tel"
                                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                                  value={newIndividualRegistration.phone}
                                  onChange={(e) => setNewIndividualRegistration({...newIndividualRegistration, phone: e.target.value})}
                                  placeholder="Phone number"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
                                <input
                                  type="number"
                                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                                  value={newIndividualRegistration.age}
                                  onChange={(e) => setNewIndividualRegistration({...newIndividualRegistration, age: e.target.value})}
                                  placeholder="Age"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                              <input
                                type="email"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none"
                                value={newIndividualRegistration.email}
                                onChange={(e) => setNewIndividualRegistration({...newIndividualRegistration, email: e.target.value})}
                                placeholder="Email address"
                              />
                            </div>

                            <div className="flex gap-3">
                              <button
                                onClick={handleAddIndividualRegistration}
                                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-bold hover:shadow-lg"
                              >
                                Register Player
                              </button>
                              <button
                                onClick={() => {
                                  setShowAddPlayerForm(false);
                                  setNewIndividualRegistration({
                                    playerName: '',
                                    phone: '',
                                    email: '',
                                    age: ''
                                  });
                                }}
                                className="px-6 bg-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-300"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {viewingRegistrations.gameType === 'team' ? (
                      teamRegistrations.length > 0 ? (
                        <div className="space-y-4">
                          {teamRegistrations.map((reg) => (
                            <div key={reg.id} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 border-2 border-blue-200">
                              <div className="flex items-start justify-between mb-4">
                                <div>
                                  <h4 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                    🏆 {reg.team_name}
                                  </h4>
                                  <p className="text-sm text-gray-600 mt-1">
                                    Captain: {reg.captain_name}
                                  </p>
                                  {reg.captain_phone && (
                                    <p className="text-sm text-gray-600">📱 {reg.captain_phone}</p>
                                  )}
                                  {reg.captain_email && (
                                    <p className="text-sm text-gray-600">📧 {reg.captain_email}</p>
                                  )}
                                </div>
                                <button
                                  onClick={() => handleDeleteTeamRegistration(reg.id)}
                                  className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </div>
                              <div className="bg-white rounded-lg p-4 border border-blue-200">
                                <p className="font-semibold text-gray-700 mb-2">Players ({reg.players.length}):</p>
                                <div className="grid md:grid-cols-2 gap-2">
                                  {reg.players.map((player, idx) => (
                                    <div key={idx} className="bg-blue-50 px-3 py-2 rounded-lg text-sm">
                                      {idx + 1}. {player}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="text-6xl mb-4">👥</div>
                          <h4 className="text-xl font-bold text-gray-800 mb-2">No Teams Registered</h4>
                          <p className="text-gray-600">No teams have registered yet</p>
                        </div>
                      )
                    ) : (
                      individualRegistrations.length > 0 ? (
                        <div className="grid md:grid-cols-2 gap-4">
                          {individualRegistrations.map((reg) => (
                            <div key={reg.id} className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-bold text-gray-800">🏃 {reg.player_name}</h4>
                                  {reg.age && <p className="text-sm text-gray-600">Age: {reg.age}</p>}
                                  {reg.phone && <p className="text-sm text-gray-600">📱 {reg.phone}</p>}
                                  {reg.email && <p className="text-sm text-gray-600">📧 {reg.email}</p>}
                                </div>
                                <button
                                  onClick={() => handleDeleteIndividualRegistration(reg.id)}
                                  className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <div className="text-6xl mb-4">👤</div>
                          <h4 className="text-xl font-bold text-gray-800 mb-2">No Players Registered</h4>
                          <p className="text-gray-600">No players have registered yet</p>
                        </div>
                      )
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}