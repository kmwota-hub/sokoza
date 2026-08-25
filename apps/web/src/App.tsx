            import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import BusinessDashboard from './pages/BusinessDashboard';
import RiderDashboard from './pages/RiderDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Landing />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="dashboard" element={<CustomerDashboard />} />
          <Route path="business/dashboard" element={<BusinessDashboard />} />
          <Route path="rider/dashboard" element={<RiderDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}