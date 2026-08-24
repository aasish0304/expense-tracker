import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowDownUp,
  WalletCards,
  Target,
  BarChart3,
  Settings,
} from "lucide-react";

import styles from "./Sidebar.module.css";

const Sidebar = () => {
  return (
    <aside className={styles.sidebar}>

      {/* Logo */}
      <div className={styles.logo}>
        waku<span>.</span>
      </div>


      {/* Navigation */}
      <nav className={styles.nav}>

        <NavLink
          to="/dashboard"
          end
          className={({ isActive }) =>
            `${styles.navItem} ${
              isActive ? styles.active : ""
            }`
          }
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>


        <NavLink
          to="/dashboard/expenses"
          className={({ isActive }) =>
            `${styles.navItem} ${
              isActive ? styles.active : ""
            }`
          }
        >
          <ArrowDownUp size={18} />
          <span>Transactions</span>
        </NavLink>


        <NavLink
          to="/dashboard/budgets"
          className={({ isActive }) =>
            `${styles.navItem} ${
              isActive ? styles.active : ""
            }`
          }
        >
          <WalletCards size={18} />
          <span>Budgets</span>
        </NavLink>


        <NavLink
          to="/dashboard/goals"
          className={({ isActive }) =>
            `${styles.navItem} ${
              isActive ? styles.active : ""
            }`
          }
        >
          <Target size={18} />
          <span>Goals</span>
        </NavLink>


        <NavLink
          to="/dashboard/reports"
          className={({ isActive }) =>
            `${styles.navItem} ${
              isActive ? styles.active : ""
            }`
          }
        >
          <BarChart3 size={18} />
          <span>Reports</span>
        </NavLink>


        <NavLink
          to="/dashboard/settings"
          className={({ isActive }) =>
            `${styles.navItem} ${
              isActive ? styles.active : ""
            }`
          }
        >
          <Settings size={18} />
          <span>Settings</span>
        </NavLink>

      </nav>

    </aside>
  );
};

export default Sidebar;