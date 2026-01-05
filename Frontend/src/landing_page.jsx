import React, { useState, useEffect } from 'react';
import { Menu, X, Calendar, Trophy, Users, Sparkles, Clock, MapPin, ChevronRight } from 'lucide-react';
import { Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export default function PongalLanding() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedLiveGame, setSelectedLiveGame] = useState(null);
  const [liveGames, setLiveGames] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiveGames();
    
    // Auto-refresh every 15 seconds
    const interval = setInterval(() => {
      fetchLiveGames();
    }, 15000);
    
    return () => clearInterval(interval);
  }, []);

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

  return (
    <div className="min-h-screen relative">
      {/* Background Image with Overlay */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: 'url(./images/pongal-wishes-1.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-linear-to-br from-indigo-900/95 "></div>
        <div className="absolute inset-0 bg-black/30"></div>
      </div>
    
      {/* Content */}
      <div className="relative z-10">
        {/* Navbar */}
        <nav className="bg-white/10 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              {/* Logo */}
              <div className="flex items-center space-x-3">
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2.5 rounded-xl shadow-lg">
                  <Trophy className="h-7 w-7 text-white" />
                </div>
                <span className="text-2xl font-bold text-white drop-shadow-lg">
                  Pongal Sports Live 2026
                </span>
              </div>

              {/* Desktop Menu */}
              <div className="hidden md:flex items-center space-x-8">
                <a href="#home" className="text-white/90 text-sm hover:text-yellow-300 transition-colors font-medium ">
                  Home
                </a>
                <Link to="/games" className="text-white/90 text-sm hover:text-yellow-300 transition-colors font-medium">
                  Games List
                </Link>
                <Link to="/register" className="text-white/90 text-sm hover:text-yellow-300 transition-colors font-medium ">
                  Register
                </Link>
                <Link to="/results" className="text-white/90 text-sm hover:text-yellow-300 transition-colors font-medium">
                  Results
                </Link>
                <Link to="/dashboard" className="text-white/90 text-sm hover:text-yellow-300 transition-colors font-medium ">
                  Overview
                </Link>
                <Link to="/admin" className="text-white/90 text-sm hover:text-yellow-300 transition-colors font-medium">
                  Admin
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-white/10 backdrop-blur-md hover:bg-white/20"
              >
                {isMenuOpen ? <X className="h-6 w-6 text-white" /> : <Menu className="h-6 w-6 text-white" />}
              </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
              <div className="md:hidden pb-4 space-y-2">
                <a href="#home" className="block px-4 py-3 text-white/90 hover:bg-white/10 rounded-lg backdrop-blur-md">
                  Home
                </a>
                <Link to="/games" className="block px-4 py-3 text-white/90 hover:bg-white/10 rounded-lg backdrop-blur-md">
                  Games
                </Link>
                <Link to="/register" className="block px-4 py-3 text-white/90 hover:bg-white/10 rounded-lg backdrop-blur-md">
                  Register
                </Link>
                <Link to="/results" className="block px-4 py-3 text-white/90 hover:bg-white/10 rounded-lg backdrop-blur-md">
                  Results
                </Link>
                <Link to="/dashboard" className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full font-bold">
                  Overview
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center space-y-8 max-w-5xl mx-auto">
            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-400 bg-clip-text text-transparent drop-shadow-2xl">
                Pongal Festival Games
              </span>
            </h1>

            {/* Description */}
            <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-4xl mx-auto drop-shadow-lg font-light">
      ஜக்கம்பட்டி பொது மக்களே, இந்த பொங்கல் திருவிழா நம்ம
      ஊரின் சந்தோஷம், ஒற்றுமை மற்றும் பாரம்பரியத்தின் அடையாளமாகும்.
      இந்த விழா இன்று இளைஞர்கள் முதல் பெரியவர்கள் வரை அனைவரையும்
      ஒன்றாகச் சேர்க்கிறது. விளையாட்டு, சிரிப்பு, சந்தோஷம் மற்றும்
      உறவுகள் அனைத்தும் இந்த திருவிழாவில் கலந்திருக்கின்றன

      நம்ம ஊரின் விளையாட்டுகள், கலாசாரம் மற்றும் வீரத்தை
      இந்த நாளில் மிகவும் சிறப்பாகக் காட்சியளிக்கின்றன.
      அனைவரும் கலந்து களிப்போம், சந்தோஷத்தைப் பகிர்ந்து கொள்வோம்,
      மற்றும் நம்ம ஜக்கம்பட்டியின் பெருமையை உலகிற்கு காட்டுவோம்.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-6 pt-4">
              <Link to="/games" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-10 py-5 rounded-full font-bold text-xl hover:shadow-2xl hover:shadow-yellow-500/50 transform hover:scale-110 transition-all inline-block">
                View Games
              </Link>
              <Link to="/live-games" className="bg-white/10 backdrop-blur-md text-white px-10 py-5 rounded-full font-bold text-xl border-2 border-white/30 hover:bg-white/20 hover:border-yellow-400 transition-all inline-block">
                Active Games
              </Link>
            </div>  
          </div>
        </div>

        {/* Live Games Section */}
        {!loading && liveGames.length > 0 && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-4xl font-bold text-white flex items-center gap-3">
                <span className="bg-red-500 w-3 h-3 rounded-full animate-pulse"></span>
                Live Games
              </h2>
              <Link to="/live-games" className="text-yellow-300 hover:text-yellow-200 font-semibold flex items-center gap-2">
                View All <ChevronRight className="h-5 w-5" />
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveGames.map(game => (
                <div
                  key={game.id}
                  onClick={() => setSelectedLiveGame(game)}
                  className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:bg-white/20 hover:border-green-400/50 transition-all cursor-pointer transform hover:scale-105"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{game.game.icon}</span>
                      <div>
                        <h3 className="text-lg font-bold text-white">{game.game.tamil}</h3>
                        <p className="text-white/70 text-sm">{game.game.english}</p>
                      </div>
                    </div>
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse flex items-center gap-1">
                      <span className="w-2 h-2 bg-white rounded-full"></span>
                      LIVE
                    </span>
                  </div>

                  <div className="bg-white/10 rounded-xl p-4 mb-3">
                    {game.gameType === 'team' ? (
                      <div className="space-y-2">
                        {game.participants.slice(0, 2).map((participant, idx) => (
                          <div key={idx} className="flex justify-between items-center">
                            <span className="text-white font-semibold">{participant.name}</span>
                            <span className="text-yellow-300 text-xl font-bold">{participant.score || 0}</span>
                          </div>
                        ))}
                        {game.participants.length > 2 && (
                          <div className="text-white/60 text-xs text-center pt-1">
                            +{game.participants.length - 2} more teams
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {game.participants
                          .filter(p => p.time)
                          .sort((a, b) => parseFloat(a.time.replace('s', '')) - parseFloat(b.time.replace('s', '')))
                          .slice(0, 3)
                          .map((participant, idx) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                              <span className="text-white/90">{participant.name}</span>
                              <span className="text-yellow-300 font-bold">{participant.time}</span>
                            </div>
                          ))}
                        {game.participants.filter(p => p.time).length > 3 && (
                          <div className="text-white/60 text-xs text-center pt-1">
                            +{game.participants.filter(p => p.time).length - 3} more
                          </div>
                        )}
                        {game.participants.filter(p => !p.time).length > 0 && (
                          <div className="text-white/60 text-xs text-center pt-1 italic">
                            {game.participants.filter(p => !p.time).length} pending
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-white/70 text-xs">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {game.startTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> {game.venue}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Live Game Detail Modal */}
      {selectedLiveGame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/10">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 rounded-t-3xl sticky top-0 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-5xl">{selectedLiveGame.game.icon}</span>
                  <div>
                    <h3 className="text-2xl font-bold text-white">{selectedLiveGame.game.tamil}</h3>
                    <p className="text-white/90">{selectedLiveGame.game.english}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedLiveGame(null)}
                  className="bg-white/20 hover:bg-white/30 rounded-full p-2 transition-all"
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
              <div className="flex items-center gap-4 mt-4 text-white/90">
                <span className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-sm">
                  <Clock className="h-4 w-4" /> {selectedLiveGame.startTime}
                </span>
                <span className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-sm">
                  <MapPin className="h-4 w-4" /> {selectedLiveGame.venue}
                </span>
                <span className="bg-green-500 px-3 py-1 rounded-full text-sm font-bold animate-pulse flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full"></span>
                  LIVE
                </span>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {selectedLiveGame.gameType === 'team' ? (
                // Team Event Display
                <div className="space-y-6">
                  <h4 className="text-xl font-bold text-white mb-4">Live Scores</h4>
                  <div className="space-y-4">
                    {selectedLiveGame.participants
                      .sort((a, b) => (b.score || 0) - (a.score || 0))
                      .map((participant, idx) => (
                        <div key={idx} className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl p-6 border-2 border-blue-400/30">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="text-2xl font-bold text-white mb-1">{participant.name}</h5>
                              <span className="text-white/60 text-sm">
                                {idx === 0 ? 'Leading' : `Position ${idx + 1}`}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className="text-5xl font-bold text-yellow-300">{participant.score || 0}</div>
                              <div className="text-white/60 text-sm mt-1">Points</div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* Match Stats */}
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mt-6">
                    <h5 className="text-lg font-bold text-white mb-4">Match Stats</h5>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-white/70">Lead:</span>
                        <span className="text-yellow-300 font-bold">
                          {(() => {
                            const sorted = [...selectedLiveGame.participants].sort((a, b) => (b.score || 0) - (a.score || 0));
                            if (sorted.length < 2) return 'N/A';
                            const diff = (sorted[0].score || 0) - (sorted[1].score || 0);
                            if (diff === 0) return 'Scores Tied';
                            return `${sorted[0].name} by ${diff} points`;
                          })()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/70">Status:</span>
                        <span className="text-green-400 font-bold">In Progress</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Individual Event Display
                <div className="space-y-6">
                  <h4 className="text-xl font-bold text-white mb-4">Race Results</h4>
                  <div className="space-y-3">
                    {selectedLiveGame.participants
                      .filter(p => p.time)
                      .sort((a, b) => parseFloat(a.time.replace('s', '')) - parseFloat(b.time.replace('s', '')))
                      .map((participant, idx) => (
                        <div 
                          key={idx} 
                          className={`rounded-2xl p-5 border-2 ${
                            idx === 0 
                              ? 'bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border-yellow-400/50' 
                              : idx === 1
                              ? 'bg-gradient-to-r from-gray-400/30 to-gray-500/30 border-gray-400/50'
                              : idx === 2
                              ? 'bg-gradient-to-r from-orange-600/30 to-orange-700/30 border-orange-500/50'
                              : 'bg-white/5 border-white/10'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`text-3xl font-bold ${
                                idx === 0 ? 'text-yellow-300' : idx === 1 ? 'text-gray-300' : idx === 2 ? 'text-orange-400' : 'text-white/60'
                              }`}>
                                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}`}
                              </div>
                              <div>
                                <h5 className="text-xl font-bold text-white">{participant.name}</h5>
                                <span className="text-white/60 text-sm">
                                  {idx === 0 ? '1st Place' : idx === 1 ? '2nd Place' : idx === 2 ? '3rd Place' : `${idx + 1}th Place`}
                                </span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-3xl font-bold text-yellow-300">{participant.time}</div>
                              <div className="text-white/60 text-sm">Time</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    
                    {/* Pending participants */}
                    {selectedLiveGame.participants.filter(p => !p.time).length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-lg font-bold text-white/80 mb-3">Pending Results:</h5>
                        <div className="space-y-2">
                          {selectedLiveGame.participants.filter(p => !p.time).map((participant, idx) => (
                            <div key={idx} className="bg-white/5 rounded-lg p-3 border border-white/10">
                              <div className="flex items-center justify-between">
                                <span className="text-white">{participant.name}</span>
                                <span className="text-white/50 text-sm italic">Pending</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Race Info */}
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mt-6">
                    <h5 className="text-lg font-bold text-white mb-4">Race Information</h5>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-white/70">Total Participants:</span>
                        <span className="text-yellow-300 font-bold">{selectedLiveGame.participants.length}</span>
                      </div>
                      {selectedLiveGame.participants.filter(p => p.time).length > 0 && (
                        <div className="flex justify-between items-center">
                          <span className="text-white/70">Best Time:</span>
                          <span className="text-green-400 font-bold">
                            {Math.min(...selectedLiveGame.participants
                              .filter(p => p.time)
                              .map(p => parseFloat(p.time.replace('s', '')))
                            ).toFixed(1)}s
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-white/70">Status:</span>
                        <span className="text-green-400 font-bold">In Progress</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 mt-6">
                <Link
                  to="/live-games"
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 rounded-xl font-bold text-center hover:shadow-2xl transition-all"
                  onClick={() => setSelectedLiveGame(null)}
                >
                  View All Live Games
                </Link>
                <button
                  onClick={() => setSelectedLiveGame(null)}
                  className="px-8 bg-white/10 text-white py-4 rounded-xl font-bold hover:bg-white/20 transition-all border border-white/20"
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