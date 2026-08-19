import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardLayout from "./layouts/DashboardLayout";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Expenses from "./pages/Expenses";
import ProtectedRoute from "./components/ProtectedRoute";

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

      {/* Protected Dashboard Routes */}
      <Route element={<ProtectedRoute />}>
        <Route
          path="/dashboard"
          element={
            <DashboardLayout>
              <h2>Dashboard</h2>
              <p>Welcome to BrokeCheck.</p>
            </DashboardLayout>
          }
        />

        <Route
          path="/dashboard/expenses"
          element={
            <DashboardLayout>
              <Expenses />
            </DashboardLayout>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;