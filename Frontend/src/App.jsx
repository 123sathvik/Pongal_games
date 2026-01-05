import PongalLanding from "./landing_page"
import React from "react";
import { Routes, Route, Link } from 'react-router-dom'
import PongalGameStatus from './Dashboard';
import GameList from "./GameList";
import AdminPanel from "./AdminPanel";
import ActiveGames from "./ActiveGames";
import Results from "./Results";
import UserRegistrationPage from "./UserRegistrationPage";
import LiveGames from "./LiveGames";
import AdminLogin from "./AdminLogin";
import ProtectedAdminPanel from "./ProtectedAdminPanel";
import { useNavigate } from "react-router-dom";


function App() {
const Navigate = useNavigate();
  return (
  <>
  <Routes>
    <Route   path="/" element={<PongalLanding />}></Route>
            <Route path="/games" element={<GameList />} />
  <Route path="/dashboard" element={<PongalGameStatus />}></Route>
  <Route path="/active-games" element={<ActiveGames />} />
      <Route path="/results" element={<Results />} />
      <Route path="/register" element ={<UserRegistrationPage />}></Route>
            <Route path="/live-games" element ={<LiveGames />}></Route>

                    <Route path="/admin-login" element={<AdminLogin />} />
<Route 
          path="/admin" 
          element={
            <ProtectedAdminPanel>
              <AdminPanel />
            </ProtectedAdminPanel>
          } 
        />
                <Route path="*" element={<Navigate to="/" replace />} />





  </Routes>
  </>
  );
}

export default App