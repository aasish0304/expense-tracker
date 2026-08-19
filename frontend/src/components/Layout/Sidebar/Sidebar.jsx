import { NavLink, useNavigate } from "react-router-dom";
import styles from "./Sidebar.module.css";
import { logoutUser } from "../../../services/authservice";

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      navigate("/");
    }
  };

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

          <li>
            <button
              type="button"
              onClick={handleLogout}
              className={styles.logoutButton}
            >
              Logout
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;