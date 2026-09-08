import { useEffect, useRef, useState } from "react";
import {
  UserRound,
  Languages,
  Coins,
  LogOut,
  ChevronDown,
} from "lucide-react";

import ProfileAvatar from "./ProfileAvatar";
import styles from "./ProfileMenu.module.css";

import { logoutUser } from "../../services/authService";

const ProfileMenu = () => {
  const [open, setOpen] = useState(false);

  const [avatar, setAvatar] = useState(
    localStorage.getItem("waku_avatar") || "male"
  );

  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  const selectAvatar = (value) => {
    localStorage.setItem("waku_avatar", value);

    setAvatar(value);
  };

  const handleLogout = async () => {
    await logoutUser();

    window.location.href = "/";
  };

  return (
    <div
      className={styles.wrapper}
      ref={menuRef}
    >
      {/* PROFILE BUTTON */}

      <button
        type="button"
        className={styles.profileButton}
        onClick={() => setOpen((previous) => !previous)}
        aria-label="Open profile menu"
      >
        <ProfileAvatar
          size="small"
        />

        <ChevronDown
          size={14}
          className={`${styles.chevron} ${
            open ? styles.chevronOpen : ""
          }`}
        />
      </button>


      {/* PROFILE MENU */}

      {open && (
        <div className={styles.menu}>

          {/* HEADER */}

          <div className={styles.menuHeader}>

            <ProfileAvatar
              size="medium"
            />

            <div className={styles.profileText}>
              <strong>
                My Profile
              </strong>

              <span>
                Personalize your Waku
              </span>
            </div>

          </div>


          <div className={styles.divider} />


          {/* MY PROFILE */}

          <button
            type="button"
            className={styles.menuItem}
            onClick={() => {
              setOpen(false);
              // Add profile page later
            }}
          >
            <UserRound size={17} />

            <span>
              My Profile
            </span>
          </button>


          {/* AVATAR SECTION */}

          <div className={styles.avatarSection}>

            <div className={styles.sectionTitle}>
              Choose your avatar
            </div>

            <div className={styles.avatarChoices}>

              {/* FEMALE */}

              <button
                type="button"
                className={`${styles.avatarChoice} ${
                  avatar === "female"
                    ? styles.selected
                    : ""
                }`}
                onClick={() =>
                  selectAvatar("female")
                }
              >
                <img
                  src="/avatars/female.png"
                  alt="Female avatar"
                />

                <span>
                  Avatar 1
                </span>

              </button>


              {/* MALE */}

              <button
                type="button"
                className={`${styles.avatarChoice} ${
                  avatar === "male"
                    ? styles.selected
                    : ""
                }`}
                onClick={() =>
                  selectAvatar("male")
                }
              >
                <img
                  src="/avatars/male.png"
                  alt="Male avatar"
                />

                <span>
                  Avatar 2
                </span>

              </button>

            </div>

          </div>


          <div className={styles.divider} />


          {/* LANGUAGE */}

          <button
            type="button"
            className={styles.menuItem}
            onClick={() => {
              setOpen(false);
            }}
          >
            <Languages size={17} />

            <span>
              Change Language
            </span>

            <small>
              English
            </small>
          </button>


          {/* CURRENCY */}

          <button
            type="button"
            className={styles.menuItem}
            onClick={() => {
              setOpen(false);
            }}
          >
            <Coins size={17} />

            <span>
              Change Currency
            </span>

            <small>
              INR ₹
            </small>
          </button>


          <div className={styles.divider} />


          {/* LOGOUT */}

          <button
            type="button"
            className={`${styles.menuItem} ${styles.logout}`}
            onClick={handleLogout}
          >
            <LogOut size={17} />

            <span>
              Log out
            </span>
          </button>

        </div>
      )}
    </div>
  );
};

export default ProfileMenu;