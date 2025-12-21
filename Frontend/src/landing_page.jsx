import React, { useState } from 'react';
import { Menu, X, Calendar, Trophy, Users, Sparkles } from 'lucide-react';
import { Routes, Route, Link } from 'react-router-dom'
export default function PongalLanding() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
                <a href="#home" className="text-white/90 hover:text-yellow-300 transition-colors font-medium text-lg">
                  Home
                </a>
                <a href="#games" className="text-white/90 hover:text-yellow-300 transition-colors font-medium text-lg">
                  Games List
                </a>
                <a href="#schedule" className="text-white/90 hover:text-yellow-300 transition-colors font-medium text-lg">
                  Schedule
                </a>
                <a href="#results" className="text-white/90 hover:text-yellow-300 transition-colors font-medium text-lg">
                  Results
                </a>
                <Link to="/dashboard" className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-full font-bold">
                  Overview
                </Link>
                <a href="#schedule" className="text-white/90 hover:text-yellow-300 transition-colors font-medium text-lg">
                  Admin
                </a>
                <button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-3 rounded-full font-bold text-lg hover:shadow-2xl hover:shadow-yellow-500/50 transform hover:scale-105 transition-all">
                  Dashboard
                </button>
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
                <a href="#games" className="block px-4 py-3 text-white/90 hover:bg-white/10 rounded-lg backdrop-blur-md">
                  Games
                </a>
                <a href="#schedule" className="block px-4 py-3 text-white/90 hover:bg-white/10 rounded-lg backdrop-blur-md">
                  Schedule
                </a>
                <a href="#results" className="block px-4 py-3 text-white/90 hover:bg-white/10 rounded-lg backdrop-blur-md">
                  Results
                </a>
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
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-400/20 to-orange-500/20 backdrop-blur-md px-6 py-3 rounded-full border border-yellow-400/30">
              <Sparkles className="h-5 w-5 text-yellow-300" />
              <span className="text-yellow-100 font-semibold text-lg">Celebrating Tradition & Competition</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-400 bg-clip-text text-transparent drop-shadow-2xl">
                Pongal Festival Games
              </span>
            </h1>

            {/* Description */}
            <p className="text-xl md:text-2xl text-white/90 leading-relaxed max-w-4xl mx-auto drop-shadow-lg font-light">
              Welcome note this one
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
              <button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-10 py-5 rounded-full font-bold text-xl hover:shadow-2xl hover:shadow-yellow-500/50 transform hover:scale-110 transition-all">
                View Games
              </button>
              <button className="bg-white/10 backdrop-blur-md text-white px-10 py-5 rounded-full font-bold text-xl border-2 border-white/30 hover:bg-white/20 hover:border-yellow-400 transition-all">
                Learn More
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-12 max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all">
                <div className="text-5xl font-black bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">12+</div>
                <div className="text-white/80 text-lg font-semibold mt-2">Games</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all">
                <div className="text-5xl font-black bg-gradient-to-r from-pink-300 to-purple-400 bg-clip-text text-transparent">200+</div>
                <div className="text-white/80 text-lg font-semibold mt-2">Participants</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all">
                <div className="text-5xl font-black bg-gradient-to-r from-blue-300 to-cyan-400 bg-clip-text text-transparent">5</div>
                <div className="text-white/80 text-lg font-semibold mt-2">Days</div>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mt-24">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:bg-white/20 hover:border-yellow-400/50 transition-all transform hover:-translate-y-3 hover:shadow-2xl hover:shadow-yellow-500/30">
              <div className="bg-gradient-to-br from-yellow-400 to-orange-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Live Tracking</h3>
              <p className="text-white/80 leading-relaxed">
                Follow all games in real-time with live score updates and match progress tracking.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:bg-white/20 hover:border-pink-400/50 transition-all transform hover:-translate-y-3 hover:shadow-2xl hover:shadow-pink-500/30">
              <div className="bg-gradient-to-br from-pink-400 to-purple-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Team Management</h3>
              <p className="text-white/80 leading-relaxed">
                Register teams, manage players, and organize tournament brackets effortlessly.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:bg-white/20 hover:border-cyan-400/50 transition-all transform hover:-translate-y-3 hover:shadow-2xl hover:shadow-cyan-500/30">
              <div className="bg-gradient-to-br from-cyan-400 to-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-xl">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Event Schedule</h3>
              <p className="text-white/80 leading-relaxed">
                View complete festival schedule with timings, venues, and game information.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}