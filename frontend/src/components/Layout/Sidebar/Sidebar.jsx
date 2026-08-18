import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.css";

const Sidebar = () => {
  return (
    <aside className={styles.sidebar}>
      <nav>
        <ul>
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive ? styles.active : ""
              }
            >
              Dashboard
            </NavLink>
          </li>

          <li>
            <NavLink
              to="/dashboard/expenses"
              className={({ isActive }) =>
                isActive ? styles.active : ""
              }
            >
              Expenses
            </NavLink>
          </li>

          <li>Budget</li>
          <li>Analytics</li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;