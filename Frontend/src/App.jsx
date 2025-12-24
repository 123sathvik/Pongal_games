import PongalLanding from "./landing_page"
import React from "react";
import { Routes, Route, Link } from 'react-router-dom'
import PongalGameStatus from './Dashboard';


function App() {

  return (
  <>
  <Routes>
    <Route   path="/" element={<PongalLanding />}></Route>
  <Route path="/dashboard" element={<PongalGameStatus />}></Route>
  </Routes>
  </>
  );
}

export default App