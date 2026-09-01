import { Routes, Route } from "react-router-dom";

import Budgets from "./pages/Budgets";
import Goals from "./pages/Goals";

import Login from "./pages/Login";
import Register from "./pages/Register";

import DashboardLayout from "./layouts/DashboardLayout";

import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import Expenses from "./pages/Expenses";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";

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

        {/* ============================
            DASHBOARD
        ============================ */}

        <Route
          path="/dashboard"
          element={
            <DashboardLayout>
              <h2>Dashboard</h2>
              <p>Welcome to Waku.</p>
            </DashboardLayout>
          }
        />


        {/* ============================
            EXPENSES
        ============================ */}

        <Route
          path="/dashboard/expenses"
          element={
            <DashboardLayout>
              <Expenses />
            </DashboardLayout>
          }
        />


        {/* ============================
            BUDGETS
        ============================ */}

        <Route
          path="/dashboard/budgets"
          element={
            <DashboardLayout>
              <Budgets />
            </DashboardLayout>
          }
        />


        {/* ============================
            GOALS
        ============================ */}

        <Route
          path="/dashboard/goals"
          element={
            <DashboardLayout>
              <Goals />
            </DashboardLayout>
          }
        />


        {/* ============================
            SETTINGS / PROFILE
        ============================ */}

        <Route
          path="/dashboard/settings"
          element={
            <DashboardLayout>
              <Settings />
            </DashboardLayout>
          }
        />


        {/* ==============================
            ADMIN ONLY ROUTES
        ============================== */}

        <Route element={<ProtectedRoute adminOnly />}>

          <Route
            path="/dashboard/admin"
            element={
              <DashboardLayout>
                <Admin />
              </DashboardLayout>
            }
          />

        </Route>

      </Route>

    </Routes>
  );
}


export default App;