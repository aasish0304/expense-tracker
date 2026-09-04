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
import Overview from "./pages/Overview";
import Reports from "./pages/Reports";
import Notifications from "./pages/Notifications";
import ProtectedRoute from "./components/ProtectedRoute";


function App() {
  return (
    <Routes>

      {/* =================================================
          PUBLIC ROUTES
      ================================================= */}

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


      {/* =================================================
          PROTECTED APPLICATION
      ================================================= */}

      <Route element={<ProtectedRoute />}>

        {/* Dashboard / Overview */}

        <Route
          path="/dashboard"
          element={
            <DashboardLayout>
              <Overview />
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


        {/* Budgets */}

        <Route
          path="/dashboard/budgets"
          element={
            <DashboardLayout>
              <Budgets />
            </DashboardLayout>
          }
        />


        {/* Goals */}

        <Route
          path="/dashboard/goals"
          element={
            <DashboardLayout>
              <Goals />
            </DashboardLayout>
          }
        />


        {/* Reports */}

        <Route
          path="/dashboard/reports"
          element={
            <DashboardLayout>
              <Reports />
            </DashboardLayout>
          }
        />


        {/* Notifications */}

        <Route
          path="/dashboard/notifications"
          element={
            <DashboardLayout>
              <Notifications />
            </DashboardLayout>
          }
        />


        {/* Settings */}

        <Route
          path="/dashboard/settings"
          element={
            <DashboardLayout>
              <Settings />
            </DashboardLayout>
          }
        />


        {/* =================================================
            ADMIN
        ================================================= */}

        <Route
          element={
            <ProtectedRoute adminOnly />
          }
        >
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