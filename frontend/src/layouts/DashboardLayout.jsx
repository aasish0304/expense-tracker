import { useEffect, useRef, useState } from "react";

import {
  Bell,
  ChevronDown,
  ChevronRight,
  LogOut,
  User,
  Check,
  Sparkles,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";

import { logoutUser } from "../services/authService";

import api from "../services/api";

import {
  buildNotifications,
  formatCurrency,
} from "../utils/notificationUtils";

import styles from "./DashboardLayout.module.css";


const DEFAULT_PROFILE = {
  name: "My Profile",
  email: "",
  avatar: "male",
};


const DEFAULT_SETTINGS = {
  notifications: true,
};


const DashboardLayout = ({ children }) => {

  const navigate = useNavigate();


  /* =====================================================
     PROFILE
  ===================================================== */

  const [profileOpen, setProfileOpen] =
    useState(false);

  const [profile, setProfile] =
    useState(DEFAULT_PROFILE);

  const profileRef = useRef(null);


  /* =====================================================
     NOTIFICATIONS
  ===================================================== */

  const [notificationsEnabled, setNotificationsEnabled] =
    useState(() => {

      try {

        const saved =
          localStorage.getItem(
            "waku_settings"
          );

        if (!saved) {
          return true;
        }

        const settings =
          JSON.parse(saved);

        return (
          settings.notifications !== false
        );

      } catch {
        return true;
      }

    });


  const [
    notificationsOpen,
    setNotificationsOpen,
  ] = useState(false);


  const [
    notifications,
    setNotifications,
  ] = useState([]);


  const [
    notificationsLoading,
    setNotificationsLoading,
  ] = useState(false);


  const notificationRef =
    useRef(null);


  /* =====================================================
     LOAD PROFILE
  ===================================================== */

  const loadProfile = () => {

    try {

      const savedProfile =
        localStorage.getItem(
          "waku_profile"
        );


      if (savedProfile) {

        const parsed =
          JSON.parse(savedProfile);


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
     LOAD NOTIFICATION SETTING
  ===================================================== */

  const loadNotificationSetting = () => {

    try {

      const saved =
        localStorage.getItem(
          "waku_settings"
        );


      if (!saved) {

        setNotificationsEnabled(true);

        return;

      }


      const parsed =
        JSON.parse(saved);


      setNotificationsEnabled(
        parsed.notifications !== false
      );


    } catch (error) {

      console.error(
        "Unable to load notification settings:",
        error
      );

      setNotificationsEnabled(true);

    }

  };


  /* =====================================================
     FETCH DYNAMIC NOTIFICATIONS
  ===================================================== */

  const loadNotifications = async () => {

    if (!notificationsEnabled) {

      setNotifications([]);

      return;

    }


    try {

      setNotificationsLoading(true);


      const [
        expensesResponse,
        budgetsResponse,
        goalsResponse,
      ] = await Promise.all([

        api.get("/"),

        api.get("/budgets/"),

        api.get("/goals/"),

      ]);


      const expenses =
        Array.isArray(
          expensesResponse?.data
        )
          ? expensesResponse.data
          : expensesResponse?.data?.results ||
            [];


      const budgets =
        Array.isArray(
          budgetsResponse?.data
        )
          ? budgetsResponse.data
          : budgetsResponse?.data?.results ||
            [];


      const goals =
        Array.isArray(
          goalsResponse?.data
        )
          ? goalsResponse.data
          : goalsResponse?.data?.results ||
            [];


      const generated =
        buildNotifications(
          expenses,
          budgets,
          goals
        );


      setNotifications(
        generated || []
      );


    } catch (error) {

      console.error(
        "Unable to load notifications:",
        error
      );

      setNotifications([]);

    } finally {

      setNotificationsLoading(false);

    }

  };


  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {

    loadProfile();

    loadNotificationSetting();


    const handleProfileUpdate = (event) => {

      /*
        Settings sends the updated profile directly in
        the custom event. Use it immediately so the
        top-right avatar/name updates without refresh.
      */
      if (event?.detail) {
        setProfile({
          ...DEFAULT_PROFILE,
          ...event.detail,
        });

        return;
      }

      /*
        Fallback for profile updates that do not include
        event details. Reload the locally stored profile.
      */
      loadProfile();

    };


    const handleSettingsUpdate = (
      event
    ) => {

      const enabled =
        event?.detail?.notifications !==
        false;


      setNotificationsEnabled(
        enabled
      );


      if (!enabled) {

        setNotificationsOpen(false);

        setNotifications([]);

      }

    };


    window.addEventListener(
      "waku-profile-updated",
      handleProfileUpdate
    );


    window.addEventListener(
      "waku-settings-updated",
      handleSettingsUpdate
    );


    return () => {

      window.removeEventListener(
        "waku-profile-updated",
        handleProfileUpdate
      );


      window.removeEventListener(
        "waku-settings-updated",
        handleSettingsUpdate
      );

    };

  }, []);


  /* =====================================================
     REFRESH NOTIFICATIONS WHEN ENABLED
  ===================================================== */

  useEffect(() => {

    if (notificationsEnabled) {

      loadNotifications();

    } else {

      setNotifications([]);

    }

  }, [notificationsEnabled]);


  /* =====================================================
     CLOSE DROPDOWNS WHEN CLICKING OUTSIDE
  ===================================================== */

  useEffect(() => {

    const handleClickOutside = (
      event
    ) => {

      if (
        profileRef.current &&
        !profileRef.current.contains(
          event.target
        )
      ) {

        setProfileOpen(false);

      }


      if (
        notificationRef.current &&
        !notificationRef.current.contains(
          event.target
        )
      ) {

        setNotificationsOpen(false);

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

  const changeAvatar = (
    avatar
  ) => {

    const updatedProfile = {

      ...profile,

      avatar,

    };


    setProfile(
      updatedProfile
    );


    localStorage.setItem(
      "waku_profile",
      JSON.stringify(
        updatedProfile
      )
    );


    window.dispatchEvent(
      new CustomEvent("waku-profile-updated", {
        detail: updatedProfile,
      })
    );

  };


  /* =====================================================
     LOGOUT
  ===================================================== */

  const handleLogout = async () => {

    setProfileOpen(false);

    setNotificationsOpen(false);


    await logoutUser();


    navigate("/", {
      replace: true,
    });

  };


  /* =====================================================
     NOTIFICATION CLICK
  ===================================================== */

  const handleNotificationClick = () => {

    setNotificationsOpen(false);

    navigate(
      "/dashboard/notifications"
    );

  };


  /* =====================================================
     CURRENT AVATAR
  ===================================================== */

  const avatarSrc =
    profile.avatar === "female"
      ? "/avatars/female.png"
      : "/avatars/male.png";


  /* =====================================================
     TOP 3 NOTIFICATIONS
  ===================================================== */

  const previewNotifications =
    notifications.slice(0, 3);


  const unreadCount =
    notifications.length;


  /* =====================================================
     NOTIFICATION ICON
  ===================================================== */

  const NotificationIcon = ({
    notification,
  }) => {

    const Icon =
      notification?.icon ||
      Sparkles;


    return (
      <div
        className={
          styles.notificationItemIcon
        }
      >
        <Icon size={16} />
      </div>
    );

  };


  /* =====================================================
     RENDER
  ===================================================== */

  return (

    <div
      className={
        styles.container
      }
    >

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <Sidebar />


      {/* =================================================
          MAIN
      ================================================= */}

      <main
        className={
          styles.main
        }
      >

        {/* =================================================
            TOP BAR
        ================================================= */}

        <header
          className={
            styles.topbar
          }
        >

          <div
            className={
              styles.topbarSpacer
            }
          />


          <div
            className={
              styles.topbarActions
            }
          >

            {/* =================================================
                NOTIFICATIONS
            ================================================= */}

            {notificationsEnabled && (

              <div
                className={
                  styles.notificationWrapper
                }
                ref={
                  notificationRef
                }
              >

                <button
                  type="button"
                  className={
                    styles.iconButton
                  }
                  aria-label="Notifications"
                  aria-expanded={
                    notificationsOpen
                  }
                  onClick={() => {

                    setNotificationsOpen(
                      (previous) =>
                        !previous
                    );

                    setProfileOpen(false);

                  }}
                >

                  <Bell size={18} />


                  {unreadCount > 0 && (

                    <span
                      className={
                        styles.notificationDot
                      }
                    />

                  )}

                </button>


                {/* =================================================
                    NOTIFICATION POPOVER
                ================================================= */}

                {notificationsOpen && (

                  <div
                    className={
                      styles.notificationMenu
                    }
                  >

                    <div
                      className={
                        styles.notificationMenuHeader
                      }
                    >

                      <div>

                        <strong>
                          Notifications
                        </strong>

                        <span>
                          Your latest money signals
                        </span>

                      </div>


                      {notifications.length > 0 && (

                        <span
                          className={
                            styles.notificationCount
                          }
                        >
                          {notifications.length}
                        </span>

                      )}

                    </div>


                    <div
                      className={
                        styles.notificationList
                      }
                    >

                      {notificationsLoading ? (

                        <div
                          className={
                            styles.notificationEmpty
                          }
                        >

                          <div
                            className={
                              styles.notificationEmptyIcon
                            }
                          >
                            <Sparkles
                              size={17}
                            />
                          </div>

                          <span>
                            Reading your money story...
                          </span>

                        </div>

                      ) : previewNotifications.length === 0 ? (

                        <div
                          className={
                            styles.notificationEmpty
                          }
                        >

                          <div
                            className={
                              styles.notificationEmptyIcon
                            }
                          >
                            <Sparkles
                              size={17}
                            />
                          </div>

                          <strong>
                            You're all caught up.
                          </strong>

                          <span>
                            Waku doesn't have anything new
                            to tell you right now.
                          </span>

                        </div>

                      ) : (

                        previewNotifications.map(
                          (
                            notification
                          ) => (

                            <button
                              type="button"
                              key={
                                notification.id
                              }
                              className={
                                styles.notificationItem
                              }
                              onClick={
                                handleNotificationClick
                              }
                            >

                              <NotificationIcon
                                notification={
                                  notification
                                }
                              />


                              <div
                                className={
                                  styles.notificationItemContent
                                }
                              >

                                <strong>
                                  {
                                    notification.title
                                  }
                                </strong>

                                <span>
                                  {
                                    notification.message
                                  }
                                </span>


                                <small>

                                  {
                                    notification.time ||
                                    "Waku insight"
                                  }

                                  {notification.detail && (
                                    <>
                                      {" "}
                                      ·{" "}
                                      {
                                        notification.detail
                                      }
                                    </>
                                  )}

                                </small>

                              </div>


                              <ChevronRight
                                size={14}
                                className={
                                  styles.notificationItemArrow
                                }
                              />

                            </button>

                          )
                        )

                      )}

                    </div>


                    {/* =================================================
                        VIEW ALL
                    ================================================= */}

                    <div
                      className={
                        styles.notificationMenuFooter
                      }
                    >

                      <button
                        type="button"
                        onClick={
                          handleNotificationClick
                        }
                      >

                        <span>
                          View all notifications
                        </span>

                        <ChevronRight
                          size={15}
                        />

                      </button>

                    </div>

                  </div>

                )}

              </div>

            )}


            {/* =================================================
                PROFILE
            ================================================= */}

            <div
              className={
                styles.profileWrapper
              }
              ref={
                profileRef
              }
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
                    (previous) =>
                      !previous
                  )
                }
              >

                <div
                  className={
                    styles.avatar
                  }
                >

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

                  {/* PROFILE HEADER */}

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
                        {
                          profile.name ||
                          "My Profile"
                        }
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


                  {/* MY PROFILE */}

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


                  {/* AVATAR PICKER */}

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
                          changeAvatar(
                            "male"
                          )
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
                            <Check
                              size={10}
                            />
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
                          changeAvatar(
                            "female"
                          )
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
                            <Check
                              size={10}
                            />
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


                  <div
                    className={
                      styles.profileDivider
                    }
                  />


                  {/* LOGOUT */}

                  <button
                    type="button"
                    className={`
                      ${styles.profileMenuItem}
                      ${styles.logoutItem}
                    `}
                    onClick={
                      handleLogout
                    }
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

        <div
          className={
            styles.pageContent
          }
        >
          {children}
        </div>

      </main>

    </div>

  );

};


export default DashboardLayout;