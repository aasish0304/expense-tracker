import {
  useEffect,
  useState,
} from "react";

import {
  Bell,
  Check,
  CheckCheck,
  ChevronRight,
  Sparkles,
  Trash2,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import api from "../services/api";

import {
  buildNotifications,
} from "../utils/notificationUtils";

import styles from "./Notifications.module.css";


const READ_NOTIFICATIONS_KEY =
  "waku_read_notifications";

const CLEARED_NOTIFICATIONS_KEY =
  "waku_cleared_notifications";


const getNotificationKey = (
  notification
) => {

  if (!notification) {
    return "";
  }


  if (
    notification.id !== undefined &&
    notification.id !== null
  ) {
    return String(
      notification.id
    );
  }


  return [
    notification.title || "",
    notification.message || "",
    notification.detail || "",
  ]
    .join("|")
    .trim();
};


const getStoredArray = (
  key
) => {

  try {

    const saved =
      localStorage.getItem(key);

    if (!saved) {
      return [];
    }

    const parsed =
      JSON.parse(saved);

    return Array.isArray(parsed)
      ? parsed
      : [];

  } catch {

    return [];

  }
};


const saveStoredArray = (
  key,
  values
) => {

  localStorage.setItem(
    key,
    JSON.stringify(
      [...new Set(values)]
    )
  );
};


const Notifications = () => {

  const navigate =
    useNavigate();


  const [
    notifications,
    setNotifications,
  ] = useState([]);


  const [
    selected,
    setSelected,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  const [
    notificationsEnabled,
    setNotificationsEnabled,
  ] = useState(() => {

    try {

      const saved =
        localStorage.getItem(
          "waku_settings"
        );

      if (!saved) {
        return true;
      }

      return (
        JSON.parse(saved)
          .notifications !== false
      );

    } catch {

      return true;

    }

  });


  /* =====================================================
     LOAD NOTIFICATIONS
  ===================================================== */

  const loadNotifications =
    async () => {

      if (!notificationsEnabled) {

        setNotifications([]);

        setLoading(false);

        return;
      }


      try {

        setLoading(true);

        setError("");


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
            : expensesResponse?.data
                ?.results || [];


        const budgets =
          Array.isArray(
            budgetsResponse?.data
          )
            ? budgetsResponse.data
            : budgetsResponse?.data
                ?.results || [];


        const goals =
          Array.isArray(
            goalsResponse?.data
          )
            ? goalsResponse.data
            : goalsResponse?.data
                ?.results || [];


        const generated =
          buildNotifications(
            expenses,
            budgets,
            goals
          ) || [];


        const cleared =
          getStoredArray(
            CLEARED_NOTIFICATIONS_KEY
          );


        const visible =
          generated.filter(
            (notification) =>
              !cleared.includes(
                getNotificationKey(
                  notification
                )
              )
          );


        setNotifications(
          visible
        );

      } catch (err) {

        console.error(
          "Unable to load notifications:",
          err
        );

        setError(
          "Unable to load your notifications."
        );

      } finally {

        setLoading(false);

      }

    };


  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {

    loadNotifications();

  }, [
    notificationsEnabled,
  ]);


  /* =====================================================
     SETTINGS + NOTIFICATION EVENTS
  ===================================================== */

  useEffect(() => {

    const handleSettingsUpdate =
      (event) => {

        const enabled =
          event?.detail
            ?.notifications !== false;


        setNotificationsEnabled(
          enabled
        );


        if (!enabled) {

          setSelected([]);

        }

      };


    const handleNotificationUpdate =
      () => {

        loadNotifications();

      };


    window.addEventListener(
      "waku-settings-updated",
      handleSettingsUpdate
    );


    window.addEventListener(
      "waku-notifications-updated",
      handleNotificationUpdate
    );


    return () => {

      window.removeEventListener(
        "waku-settings-updated",
        handleSettingsUpdate
      );


      window.removeEventListener(
        "waku-notifications-updated",
        handleNotificationUpdate
      );

    };

  }, []);


  /* =====================================================
     SELECT
  ===================================================== */

  const toggleSelected =
    (notification) => {

      const key =
        getNotificationKey(
          notification
        );


      setSelected(
        (current) => {

          if (
            current.includes(key)
          ) {

            return current.filter(
              (item) =>
                item !== key
            );

          }


          return [
            ...current,
            key,
          ];

        }
      );

    };


  /* =====================================================
     SELECT ALL
  ===================================================== */

  const selectAll = () => {

    if (
      selected.length ===
      notifications.length
    ) {

      setSelected([]);

      return;

    }


    setSelected(
      notifications.map(
        getNotificationKey
      )
    );

  };


  /* =====================================================
     CLEAR SELECTED
  ===================================================== */

  const clearSelected =
    () => {

      if (
        selected.length === 0
      ) {
        return;
      }


      const existing =
        getStoredArray(
          CLEARED_NOTIFICATIONS_KEY
        );


      const updated = [
        ...existing,
        ...selected,
      ];


      saveStoredArray(
        CLEARED_NOTIFICATIONS_KEY,
        updated
      );


      setNotifications(
        (current) =>
          current.filter(
            (notification) =>
              !selected.includes(
                getNotificationKey(
                  notification
                )
              )
          )
      );


      setSelected([]);


      window.dispatchEvent(
        new Event(
          "waku-notifications-updated"
        )
      );

    };


  /* =====================================================
     CLEAR ALL
  ===================================================== */

  const clearAll = () => {

    if (
      notifications.length === 0
    ) {
      return;
    }


    const existing =
      getStoredArray(
        CLEARED_NOTIFICATIONS_KEY
      );


    const allKeys =
      notifications.map(
        getNotificationKey
      );


    saveStoredArray(
      CLEARED_NOTIFICATIONS_KEY,
      [
        ...existing,
        ...allKeys,
      ]
    );


    setNotifications([]);

    setSelected([]);


    window.dispatchEvent(
      new Event(
        "waku-notifications-updated"
      )
    );

  };


  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {

    return (

      <section
        className={
          styles.page
        }
      >

        <div
          className={
            styles.content
          }
        >

          <div
            className={
              styles.loadingState
            }
          >

            <div
              className={
                styles.loadingIcon
              }
            >
              <Sparkles size={22} />
            </div>


            <strong>
              Reading your money story...
            </strong>


            <span>
              Waku is preparing your latest
              financial signals.
            </span>

          </div>

        </div>

      </section>

    );

  }


  /* =====================================================
     NOTIFICATIONS OFF
  ===================================================== */

  if (!notificationsEnabled) {

    return (

      <section
        className={
          styles.page
        }
      >

        <div
          className={
            styles.content
          }
        >

          <header
            className={
              styles.hero
            }
          >

            <div>

              <p
                className={
                  styles.eyebrow
                }
              >
                YOUR MONEY SIGNALS
              </p>


              <h1>
                Notifications
              </h1>


              <p
                className={
                  styles.subtitle
                }
              >
                Stay informed about patterns
                in your spending story.
              </p>

            </div>


            <div
              className={
                styles.headerIcon
              }
            >
              <Bell size={20} />
            </div>

          </header>


          <div
            className={
              styles.emptyCard
            }
          >

            <div
              className={
                styles.emptyIcon
              }
            >
              <Bell size={22} />
            </div>


            <div>

              <h3>
                Notifications are turned off
              </h3>


              <p>
                Turn notifications back on in
                Settings to receive Waku's
                money signals and insights.
              </p>


              <button
                type="button"
                className={
                  styles.settingsButton
                }
                onClick={() =>
                  navigate(
                    "/dashboard/settings"
                  )
                }
              >
                Go to Settings
              </button>

            </div>

          </div>

        </div>

      </section>

    );

  }


  /* =====================================================
     MAIN PAGE
  ===================================================== */

  return (

    <section
      className={
        styles.page
      }
    >

      <div
        className={
          styles.content
        }
      >

        {/* HEADER */}

        <header
          className={
            styles.hero
          }
        >

          <div>

            <p
              className={
                styles.eyebrow
              }
            >
              YOUR MONEY SIGNALS
            </p>


            <h1>
              Notifications
            </h1>


            <p
              className={
                styles.subtitle
              }
            >
              Useful updates and patterns
              from your spending story.
            </p>

          </div>


          <div
            className={
              styles.headerActions
            }
          >

            <div
              className={
                styles.headerIcon
              }
            >
              <Bell size={20} />
            </div>

          </div>

        </header>


        {/* TOOLBAR */}

        <div
          className={
            styles.toolbar
          }
        >

          <div>

            <strong>
              Recent notifications
            </strong>


            <span>
              {notifications.length}{" "}
              {notifications.length === 1
                ? "notification"
                : "notifications"}
            </span>

          </div>


          <div
            className={
              styles.toolbarActions
            }
          >

            {notifications.length > 0 && (

              <button
                type="button"
                className={
                  styles.selectButton
                }
                onClick={
                  selectAll
                }
              >

                <CheckCheck size={14} />

                {selected.length ===
                notifications.length
                  ? "Deselect all"
                  : "Select all"}

              </button>

            )}


            <button
              type="button"
              className={
                styles.clearSelectedButton
              }
              disabled={
                selected.length === 0
              }
              onClick={
                clearSelected
              }
            >

              <Check size={14} />

              Clear selected

            </button>


            <button
              type="button"
              className={
                styles.clearAllButton
              }
              disabled={
                notifications.length === 0
              }
              onClick={
                clearAll
              }
            >

              <Trash2 size={14} />

              Clear all

            </button>

          </div>

        </div>


        {/* ERROR */}

        {error && (

          <div
            className={
              styles.errorState
            }
          >

            <strong>
              Something went wrong
            </strong>

            <span>
              {error}
            </span>

          </div>

        )}


        {/* EMPTY */}

        {!error &&
          notifications.length === 0 && (

          <div
            className={
              styles.emptyCard
            }
          >

            <div
              className={
                styles.emptyIcon
              }
            >
              <Check size={22} />
            </div>


            <div>

              <h3>
                You're all caught up
              </h3>


              <p>
                Waku doesn't have any new
                money signals right now.
                Keep tracking your expenses,
                budgets and goals and useful
                patterns will appear here.
              </p>

            </div>

          </div>

        )}


        {/* NOTIFICATION LIST */}

        {notifications.length > 0 && (

          <div
            className={
              styles.feedCard
            }
          >

            <div
              className={
                styles.feedHeader
              }
            >

              <div>

                <h2>
                  Your money signals
                </h2>


                <p>
                  Insights generated from
                  your actual financial activity.
                </p>

              </div>


              <span
                className={
                  styles.feedCount
                }
              >
                {notifications.length}
              </span>

            </div>


            <div
              className={
                styles.notificationList
              }
            >

              {notifications.map(
                (notification) => {

                  const key =
                    getNotificationKey(
                      notification
                    );


                  const isSelected =
                    selected.includes(
                      key
                    );


                  const readKeys =
                    getStoredArray(
                      READ_NOTIFICATIONS_KEY
                    );


                  const isRead =
                    readKeys.includes(
                      key
                    );


                  return (

                    <article
                      key={key}
                      className={`
                        ${styles.notificationCard}
                        ${
                          isRead
                            ? styles.notificationRead
                            : styles.notificationUnread
                        }
                      `}
                    >

                      {/* CHECKBOX */}

                      <button
                        type="button"
                        className={`
                          ${styles.checkbox}
                          ${
                            isSelected
                              ? styles.checkboxSelected
                              : ""
                          }
                        `}
                        aria-label={
                          isSelected
                            ? "Deselect notification"
                            : "Select notification"
                        }
                        onClick={() =>
                          toggleSelected(
                            notification
                          )
                        }
                      >

                        {isSelected && (
                          <Check size={12} />
                        )}

                      </button>


                      {/* ICON */}

                      <div
                        className={`
                          ${styles.notificationIcon}
                          ${
                            notification.type &&
                            styles[
                              notification.type
                            ]
                              ? styles[
                                  notification.type
                                ]
                              : styles.default
                          }
                        `}
                      >

                        {notification.icon ? (
                          <notification.icon
                            size={18}
                          />
                        ) : (
                          <Sparkles
                            size={18}
                          />
                        )}

                      </div>


                      {/* CONTENT */}

                      <div
                        className={
                          styles.notificationContent
                        }
                      >

                        <div
                          className={
                            styles.notificationTitleRow
                          }
                        >

                          <h3>
                            {
                              notification.title
                            }
                          </h3>


                          <span
                            className={
                              styles.notificationTime
                            }
                          >
                            {
                              notification.time ||
                              "Waku insight"
                            }
                          </span>

                        </div>


                        <p>
                          {
                            notification.message
                          }
                        </p>


                        {notification.detail && (

                          <span
                            className={
                              styles.notificationDetail
                            }
                          >
                            {
                              notification.detail
                            }
                          </span>

                        )}


                        {isRead && (

                          <span
                            className={
                              styles.readLabel
                            }
                          >

                            <Check size={10} />

                            Read

                          </span>

                        )}

                      </div>


                      <ChevronRight
                        size={16}
                        className={
                          styles.notificationArrow
                        }
                      />

                    </article>

                  );

                }
              )}

            </div>

          </div>

        )}


        <div
          className={
            styles.footerNote
          }
        >

          <Sparkles size={13} />

          Waku creates these signals
          from your actual spending,
          budgets and goals.

        </div>

      </div>

    </section>

  );

};


export default Notifications;