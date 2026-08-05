import styles from "./Sidebar.module.css";

const Sidebar = () => {
  return (
    <aside className={styles.sidebar}>
      <ul>
        <li>Dashboard</li>
        <li>Expenses</li>
        <li>Budget</li>
        <li>Analytics</li>
      </ul>
    </aside>
  );
};

export default Sidebar;