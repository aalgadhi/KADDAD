// This will have all of our component

import TripForm from "./pages/TripForm";
import Profile from "./pages/Profile";
import Payment from "./pages/Payment";
import MapView from "./pages/MapView";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Confirmation from "./pages/Confirmation";
import SignUp from "./pages/SignUp";
import AdminDashboard from "./pages/AdminDashboard";
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
      <Route path="/admin" element={<AdminDashboard />} />

    </Routes>
  );
}

export default App;
