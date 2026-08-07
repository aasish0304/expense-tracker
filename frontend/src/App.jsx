import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardLayout from "./layouts/DashboardLayout";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />  

      <Route
        path="/dashboard"
        element={
          <DashboardLayout>
            <h2>Dashboard</h2>
            <p>Welcome to BrokeCheck.</p>
          </DashboardLayout>
        }
      />
    </Routes>
  );
}

export default App;