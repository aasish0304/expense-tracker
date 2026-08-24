import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  ArrowDownUp,
  WalletCards,
  Target,
  BarChart3,
  ShieldCheck,
  Settings,
} from "lucide-react";

import styles from "./Sidebar.module.css";


const Sidebar = () => {

  // Get the logged-in user's profile
  const getProfile = () => {

    try {

      const profile =
        localStorage.getItem("waku_profile");

      if (!profile) {
        return null;
      }

      return JSON.parse(profile);

    } catch (error) {

      console.error(
        "Unable to read Waku profile:",
        error
      );

      return null;

    }

  };


  const profile = getProfile();

  const isAdmin =
    profile?.role === "Admin";


  return (

    <aside className={styles.sidebar}>

      {/* =====================================================
          LOGO
      ===================================================== */}

      <div className={styles.logo}>
        waku<span>.</span>
      </div>


      {/* =====================================================
          NAVIGATION
      ===================================================== */}

      <nav className={styles.nav}>

        {/* Dashboard */}

        <NavLink
          to="/dashboard"
          end
          className={({ isActive }) =>
            `${styles.navItem} ${
              isActive
                ? styles.active
                : ""
            }`
          }
        >

          <LayoutDashboard size={18} />

          <span>
            Dashboard
          </span>

        </NavLink>


        {/* Transactions */}

        <NavLink
          to="/dashboard/expenses"
          className={({ isActive }) =>
            `${styles.navItem} ${
              isActive
                ? styles.active
                : ""
            }`
          }
        >

          <ArrowDownUp size={18} />

          <span>
            Transactions
          </span>

        </NavLink>


        {/* Budgets */}

        <NavLink
          to="/dashboard/budgets"
          className={({ isActive }) =>
            `${styles.navItem} ${
              isActive
                ? styles.active
                : ""
            }`
          }
        >

          <WalletCards size={18} />

          <span>
            Budgets
          </span>

        </NavLink>


        {/* Goals */}

        <NavLink
          to="/dashboard/goals"
          className={({ isActive }) =>
            `${styles.navItem} ${
              isActive
                ? styles.active
                : ""
            }`
          }
        >

          <Target size={18} />

          <span>
            Goals
          </span>

        </NavLink>


        {/* Reports */}

        <NavLink
          to="/dashboard/reports"
          className={({ isActive }) =>
            `${styles.navItem} ${
              isActive
                ? styles.active
                : ""
            }`
          }
        >

          <BarChart3 size={18} />

          <span>
            Reports
          </span>

        </NavLink>


        {/* =================================================
            ADMIN
            Only visible to Admin users
        ================================================= */}

        {isAdmin && (

          <NavLink
            to="/dashboard/admin"
            className={({ isActive }) =>
              `${styles.navItem} ${
                isActive
                  ? styles.active
                  : ""
              }`
            }
          >

            <ShieldCheck size={18} />

            <span>
              Admin
            </span>

          </NavLink>

        )}


        {/* Settings */}

        <NavLink
          to="/dashboard/settings"
          className={({ isActive }) =>
            `${styles.navItem} ${
              isActive
                ? styles.active
                : ""
            }`
          }
        >

          <Settings size={18} />

          <span>
            Settings
          </span>

        </NavLink>

      </nav>

    </aside>

  );

};


export default Sidebar;