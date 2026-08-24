import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import DashboardLayout from "./layouts/DashboardLayout";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Expenses from "./pages/Expenses";
import Settings from "./pages/Settings";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Routes>

      {/* ==============================
          AUTHENTICATION ROUTES
      ============================== */}

      <Route
        path="/"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />

      <Route
        path="/reset-password"
        element={<ResetPassword />}
      />


      {/* ==============================
          PROTECTED DASHBOARD ROUTES
      ============================== */}

      <Route element={<ProtectedRoute />}>

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={
            <DashboardLayout>
              <h2>Dashboard</h2>
              <p>Welcome to Waku.</p>
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


        {/* Settings / Profile */}
        <Route
          path="/dashboard/settings"
          element={
            <DashboardLayout>
              <Settings />
            </DashboardLayout>
          }
        />

      </Route>

    </Routes>
  );
}

export default App;