import Header from "../components/layout/Header";
import Sidebar from "../components/layout/Sidebar";
import Footer from "../components/layout/Footer";
import styles from "./DashboardLayout.module.css";

const DashboardLayout = ({ children }) => {
  return (
    <div className={styles.container}>
      <Header />

      <div className={styles.content}>
        <Sidebar />

        <main className={styles.main}>
          {children}
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default DashboardLayout;