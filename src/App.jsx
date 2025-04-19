// This will have all of our component

import TripForm from "./Components/TripForm";
import Profile from "./Components/Profile";
import Payment from "./Components/Payment";
import MapView from "./Components/MapView";
import Login from "./Components/Login";
import Home from "./Components/Home";
import Confirmation from "./Components/Confirmation";
import SignUp from "./Components/SignUp";
import { Routes, Route, Navigate } from 'react-router-dom';

function App() {

  return (
    
  
    <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/home" element={<Home />} />
    <Route path="/profile" element={<Profile />} />
    <Route path="/trip-form" element={<TripForm />} />
    <Route path="/payment" element={<Payment />} />
    <Route path="/map/:tripId" element={<MapView />} />
    <Route path="/confirmation" element={<Confirmation />} />
    <Route path="*" element={<Navigate to="/" />} />
    <Route path="/SignUp" element={<SignUp />} />
    
  </Routes>
  );
}

export default App;
