import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardLayout from "./layouts/DashboardLayout";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Expenses from "./pages/Expenses";

function App() {
  return (
    <Routes>
      {/* Authentication */}
      <Route path="/" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/reset-password"
        element={<ResetPassword />}
      />

      {/* Dashboard */}
      <Route
        path="/dashboard"
        element={
          <DashboardLayout>
            <h2>Dashboard</h2>
            <p>Welcome to BrokeCheck.</p>
          </DashboardLayout>
        }
      />

      {/* Expenses */}
      <Route
        path="/dashboard/expenses"
        element={
          <DashboardLayout>
            <Expenses />
          </DashboardLayout>
        }
      />
    </Routes>
  );
}

export default App;