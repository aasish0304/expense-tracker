import { useEffect, useRef, useState } from "react";
import {
  Bell,
  ChevronDown,
  Globe2,
  LogOut,
  User,
  WalletCards,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";
import { logoutUser } from "../services/authService";

import styles from "./DashboardLayout.module.css";

const DEFAULT_PROFILE = {
  name: "My Profile",
  email: "",
  avatar: "male",
};

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();

  const [profileOpen, setProfileOpen] = useState(false);

  const [profile, setProfile] = useState(
    DEFAULT_PROFILE
  );

  const profileRef = useRef(null);


  /* =====================================================
     LOAD PROFILE
  ===================================================== */

  const loadProfile = () => {
    try {
      const savedProfile =
        localStorage.getItem("waku_profile");

      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);

        setProfile({
          ...DEFAULT_PROFILE,
          ...parsed,
        });
      }
    } catch (error) {
      console.error(
        "Unable to load profile:",
        error
      );
    }
  };


  /* =====================================================
     INITIAL LOAD + LISTEN FOR PROFILE CHANGES
  ===================================================== */

  useEffect(() => {
    loadProfile();

    const handleProfileUpdate = () => {
      loadProfile();
    };

    window.addEventListener(
      "waku-profile-updated",
      handleProfileUpdate
    );

    return () => {
      window.removeEventListener(
        "waku-profile-updated",
        handleProfileUpdate
      );
    };
  }, []);


  /* =====================================================
     CLOSE DROPDOWN WHEN CLICKING OUTSIDE
  ===================================================== */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);


  /* =====================================================
     CHANGE AVATAR
  ===================================================== */

  const changeAvatar = (avatar) => {
    const updatedProfile = {
      ...profile,
      avatar,
    };

    setProfile(updatedProfile);

    localStorage.setItem(
      "waku_profile",
      JSON.stringify(updatedProfile)
    );

    window.dispatchEvent(
      new Event("waku-profile-updated")
    );
  };


  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = async () => {
    setProfileOpen(false);

    await logoutUser();

    navigate("/", {
      replace: true,
    });
  };


  /* =====================================================
     CURRENT AVATAR
  ===================================================== */

  const avatarSrc =
    profile.avatar === "female"
      ? "/avatars/female.png"
      : "/avatars/male.png";


  return (
    <div className={styles.container}>

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <Sidebar />


      {/* =================================================
          MAIN
      ================================================= */}

      <main className={styles.main}>

        {/* =================================================
            TOP BAR
        ================================================= */}

        <header className={styles.topbar}>

          <div className={styles.topbarSpacer} />

          <div className={styles.topbarActions}>

            {/* ==============================
                NOTIFICATIONS
            ============================== */}

            <button
              type="button"
              className={styles.iconButton}
              aria-label="Notifications"
            >
              <Bell size={18} />

              <span
                className={
                  styles.notificationDot
                }
              />
            </button>


            {/* ==============================
                PROFILE
            ============================== */}

            <div
              className={styles.profileWrapper}
              ref={profileRef}
            >

              <button
                type="button"
                className={`
                  ${styles.profileButton}
                  ${
                    profileOpen
                      ? styles.profileButtonActive
                      : ""
                  }
                `}
                onClick={() =>
                  setProfileOpen(
                    (previous) => !previous
                  )
                }
              >

                <div className={styles.avatar}>
                  <img
                    src={avatarSrc}
                    alt="Profile"
                  />
                </div>

                <ChevronDown
                  size={14}
                  className={
                    profileOpen
                      ? styles.chevronOpen
                      : ""
                  }
                />

              </button>


              {/* =================================================
                  PROFILE DROPDOWN
              ================================================= */}

              {profileOpen && (

                <div
                  className={
                    styles.profileMenu
                  }
                >

                  {/* ==========================
                      PROFILE HEADER
                  ========================== */}

                  <div
                    className={
                      styles.profileMenuHeader
                    }
                  >

                    <div
                      className={
                        styles.profileMenuAvatar
                      }
                    >
                      <img
                        src={avatarSrc}
                        alt="Profile"
                      />
                    </div>

                    <div>

                      <strong>
                        {profile.name ||
                          "My Profile"}
                      </strong>

                      <span>
                        Personalize your Waku
                      </span>

                    </div>

                  </div>


                  <div
                    className={
                      styles.profileDivider
                    }
                  />


                  {/* ==========================
                      MY PROFILE
                  ========================== */}

                  <button
                    type="button"
                    className={
                      styles.profileMenuItem
                    }
                    onClick={() => {
                      setProfileOpen(false);

                      navigate(
                        "/dashboard/settings"
                      );
                    }}
                  >

                    <User size={16} />

                    <span>
                      My Profile
                    </span>

                  </button>


                  {/* =================================================
                      CHANGE AVATAR
                  ================================================= */}

                  <div
                    className={
                      styles.avatarPickerSection
                    }
                  >

                    <div
                      className={
                        styles.avatarPickerTitle
                      }
                    >
                      Choose your avatar
                    </div>


                    <div
                      className={
                        styles.avatarPicker
                      }
                    >

                      {/* MALE */}

                      <button
                        type="button"
                        className={`
                          ${styles.avatarChoice}
                          ${
                            profile.avatar ===
                            "male"
                              ? styles.avatarChoiceSelected
                              : ""
                          }
                        `}
                        onClick={() =>
                          changeAvatar("male")
                        }
                      >

                        <img
                          src="/avatars/male.png"
                          alt="Male avatar"
                        />

                        <span>
                          Avatar 1
                        </span>

                        {profile.avatar ===
                          "male" && (
                          <span
                            className={
                              styles.avatarCheck
                            }
                          >
                            <Check size={10} />
                          </span>
                        )}

                      </button>


                      {/* FEMALE */}

                      <button
                        type="button"
                        className={`
                          ${styles.avatarChoice}
                          ${
                            profile.avatar ===
                            "female"
                              ? styles.avatarChoiceSelected
                              : ""
                          }
                        `}
                        onClick={() =>
                          changeAvatar("female")
                        }
                      >

                        <img
                          src="/avatars/female.png"
                          alt="Female avatar"
                        />

                        <span>
                          Avatar 2
                        </span>

                        {profile.avatar ===
                          "female" && (
                          <span
                            className={
                              styles.avatarCheck
                            }
                          >
                            <Check size={10} />
                          </span>
                        )}

                      </button>

                    </div>

                  </div>


                  <div
                    className={
                      styles.profileDivider
                    }
                  />


                  {/* ==========================
                      LANGUAGE
                  ========================== */}

                  <button
                    type="button"
                    className={
                      styles.profileMenuItem
                    }
                    onClick={() =>
                      setProfileOpen(false)
                    }
                  >

                    <Globe2 size={16} />

                    <span>
                      Change Language
                    </span>

                    <small>
                      Soon
                    </small>

                  </button>


                  {/* ==========================
                      CURRENCY
                  ========================== */}

                  <button
                    type="button"
                    className={
                      styles.profileMenuItem
                    }
                    onClick={() =>
                      setProfileOpen(false)
                    }
                  >

                    <WalletCards size={16} />

                    <span>
                      Change Currency
                    </span>

                    <small>
                      Soon
                    </small>

                  </button>


                  <div
                    className={
                      styles.profileDivider
                    }
                  />


                  {/* ==========================
                      LOGOUT
                  ========================== */}

                  <button
                    type="button"
                    className={`
                      ${styles.profileMenuItem}
                      ${styles.logoutItem}
                    `}
                    onClick={handleLogout}
                  >

                    <LogOut size={16} />

                    <span>
                      Log out
                    </span>

                  </button>

                </div>

              )}

            </div>

          </div>

        </header>


        {/* =================================================
            PAGE CONTENT
        ================================================= */}

        <div className={styles.pageContent}>
          {children}
        </div>

      </main>

    </div>
  );
};

export default DashboardLayout;