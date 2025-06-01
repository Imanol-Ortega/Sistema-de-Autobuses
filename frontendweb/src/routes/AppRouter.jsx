import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from '../components/Login';
import Home from '../components/Home';
import Register from '../components/Register';
import Map from '../components/BusMap';
import PrivateRoute from '../context/PrivateRoute';
import { AuthProvider } from '../context/AuthContext';

export default function AppRouter() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/map" element={<Map />} />
          <Route path="/saldo" element={<Saldo />} />
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider >
  );
}
