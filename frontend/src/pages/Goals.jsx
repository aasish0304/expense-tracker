import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Image as ImageIcon,
  Medal,
  Plus,
  Target,
  Trash2,
  Trophy,
  Upload,
  X,
} from "lucide-react";

import api from "../services/api";
import styles from "./Goals.module.css";

const EMPTY_FORM = {
  name: "",
  target_amount: "",
  current_amount: "0",
  target_date: "",
  description: "",
  image: null,
  imagePreview: "",
};

/*
|--------------------------------------------------------------------------
| IMAGE URL
|--------------------------------------------------------------------------
|
| Django may return:
|
| http://localhost/media/goal_images/example.png
|
| But the application is accessed through:
|
| http://localhost:8080
|
| Therefore we convert backend absolute media URLs into:
|
| http://localhost:8080/media/goal_images/example.png
|
| Nginx then proxies /media/ to Django.
|
*/

const getImageUrl = (image) => {
  if (!image) {
    return null;
  }

  if (typeof image !== "string") {
    return null;
  }

  // Browser-selected image preview
  if (image.startsWith("blob:")) {
    return image;
  }

  /*
   * Backend can return:
   *
   * http://localhost/media/...
   * http://127.0.0.1/media/...
   * http://127.0.0.1:8000/media/...
   *
   * Convert all of these to the current frontend origin.
   */
  if (
    image.startsWith("http://localhost/") ||
    image.startsWith("http://127.0.0.1/") ||
    image.startsWith("http://127.0.0.1:8000/")
  ) {
    try {
      const url = new URL(image);

      return `${window.location.origin}${url.pathname}${url.search}`;
    } catch {
      return image;
    }
  }

  // Any other absolute URL
  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  // Relative media path
  return `${window.location.origin}${
    image.startsWith("/") ? "" : "/"
  }${image}`;
};

const money = (value) =>
  Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  });

const formatDate = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const dateKey = (date) =>
  `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getDate()).padStart(
    2,
    "0"
  )}`;

/* ============================================================
   MILESTONES
============================================================ */

const getMilestone = (progress) => {
  const safeProgress = Number(progress || 0);

  if (safeProgress >= 100) {
    return {
      title: "Goal Achieved!",
      message: "You've reached your goal. Amazing work!",
      icon: Trophy,
    };
  }

  if (safeProgress >= 75) {
    return {
      title: "Almost There!",
      message: "You're so close to reaching your goal.",
      icon: Trophy,
    };
  }

  if (safeProgress >= 50) {
    return {
      title: "Halfway There!",
      message: "Keep going — you're making great progress.",
      icon: Target,
    };
  }

  if (safeProgress >= 25) {
    return {
      title: "Great Start!",
      message: "You're making steady progress.",
      icon: Target,
    };
  }

  return {
    title: "Getting Started",
    message: "Every contribution brings you closer.",
    icon: Target,
  };
};

/* ============================================================
   CUSTOM CALENDAR
============================================================ */

function CustomCalendar({
  value,
  onChange,
  onClose,
}) {
  const rootRef = useRef(null);

  const initialDate = value
    ? new Date(`${value}T00:00:00`)
    : new Date();

  const [viewDate, setViewDate] = useState(
    new Date(
      initialDate.getFullYear(),
      initialDate.getMonth(),
      1
    )
  );

  useEffect(() => {
    const handleOutside = (event) => {
      if (
        rootRef.current &&
        !rootRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutside
      );
    };
  }, [onClose]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthLabel = viewDate.toLocaleDateString(
    "en-US",
    {
      month: "long",
      year: "numeric",
    }
  );

  const firstDay = new Date(
    year,
    month,
    1
  ).getDay();

  const daysInMonth = new Date(
    year,
    month + 1,
    0
  ).getDate();

  const previousMonthDays = new Date(
    year,
    month,
    0
  ).getDate();

  const cells = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    const date = new Date(
      year,
      month - 1,
      previousMonthDays - i
    );

    cells.push({
      date,
      outside: true,
    });
  }

  for (
    let day = 1;
    day <= daysInMonth;
    day++
  ) {
    cells.push({
      date: new Date(
        year,
        month,
        day
      ),
      outside: false,
    });
  }

  let next = 1;

  while (cells.length < 42) {
    cells.push({
      date: new Date(
        year,
        month + 1,
        next++
      ),
      outside: true,
    });
  }

  const today = dateKey(new Date());

  return (
    <div
      ref={rootRef}
      className={styles.calendarPopup}
    >
      <div
        className={styles.calendarAccent}
        aria-hidden="true"
      />

      <div
        className={styles.calendarHeaderDoodle}
        aria-hidden="true"
      />

      <div className={styles.calendarHeader}>
        <div>
          <strong>{monthLabel}</strong>

          <span>
            Choose your goal deadline
          </span>
        </div>

        <div
          className={
            styles.calendarNavigation
          }
        >
          <button
            type="button"
            aria-label="Previous month"
            onClick={() =>
              setViewDate(
                new Date(
                  year,
                  month - 1,
                  1
                )
              )
            }
          >
            <ChevronLeft size={16} />
          </button>

          <button
            type="button"
            aria-label="Next month"
            onClick={() =>
              setViewDate(
                new Date(
                  year,
                  month + 1,
                  1
                )
              )
            }
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className={styles.weekDays}>
        {[
          "Su",
          "Mo",
          "Tu",
          "We",
          "Th",
          "Fr",
          "Sa",
        ].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>

      <div className={styles.calendarGrid}>
        {cells.map(({ date, outside }) => {
          const key = dateKey(date);

          const selected = key === value;
          const isToday = key === today;

          return (
            <button
              type="button"
              key={key}
              className={[
                styles.calendarDay,
                outside
                  ? styles.outsideDay
                  : "",
                selected
                  ? styles.selectedDay
                  : "",
                isToday && !selected
                  ? styles.todayDay
                  : "",
              ].join(" ")}
              onClick={() => {
                onChange(key);
                onClose();
              }}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      <div className={styles.calendarFooter}>
        <button
          type="button"
          className={styles.calendarClear}
          onClick={() => {
            onChange("");
            onClose();
          }}
        >
          Clear
        </button>

        <button
          type="button"
          className={styles.calendarToday}
          onClick={() => {
            const now = new Date();

            onChange(dateKey(now));
            onClose();
          }}
        >
          Today
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   GOALS PAGE
============================================================ */

function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("progress");

  const [showModal, setShowModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);

  const [form, setForm] = useState(EMPTY_FORM);

  const [saving, setSaving] = useState(false);

  const [deleteGoal, setDeleteGoal] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const [calendarOpen, setCalendarOpen] = useState(false);

  /* ============================================================
     FETCH GOALS
  ============================================================ */

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/goals/"
      );

      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];

      setGoals(data);
    } catch (err) {
      console.error(
        "Goals Error:",
        err.response?.data || err
      );

      setError(
        "Unable to load your goals."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  /* ============================================================
     FILTER
  ============================================================ */

  const filteredGoals = useMemo(
    () =>
      goals.filter((goal) => {
        const progress = Number(
          goal.progress_percentage || 0
        );

        return activeTab === "completed"
          ? progress >= 100
          : progress < 100;
      }),
    [goals, activeTab]
  );

  /* ============================================================
     MODAL
  ============================================================ */

  const openCreateModal = () => {
    setEditingGoal(null);

    setForm({
      ...EMPTY_FORM,
    });

    setCalendarOpen(false);
    setShowModal(true);
  };

  const openEditModal = (goal) => {
    setEditingGoal(goal);

    setForm({
      name: goal.name || "",
      target_amount: goal.target_amount || "",
      current_amount:
        goal.current_amount || "0",
      target_date:
        goal.target_date || "",
      description:
        goal.description || "",
      image: null,

      /*
       * IMPORTANT:
       * Existing backend image goes through getImageUrl()
       * and therefore loads through localhost:8080/media/...
       */
      imagePreview: getImageUrl(goal.image),
    });

    setCalendarOpen(false);
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) {
      return;
    }

    setShowModal(false);
    setEditingGoal(null);
    setCalendarOpen(false);

    setForm({
      ...EMPTY_FORM,
    });
  };

  /* ============================================================
     FORM
  ============================================================ */

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /* ============================================================
     IMAGE UPLOAD
  ============================================================ */

  const handleImageChange = (event) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert(
        "Please upload a JPG, PNG or WebP image."
      );

      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert(
        "Image size must be less than 5 MB."
      );

      event.target.value = "";
      return;
    }

    const preview =
      URL.createObjectURL(file);

    setForm((previous) => {
      if (
        previous.imagePreview?.startsWith(
          "blob:"
        )
      ) {
        URL.revokeObjectURL(
          previous.imagePreview
        );
      }

      return {
        ...previous,
        image: file,
        imagePreview: preview,
      };
    });
  };

  const removeImage = () => {
    setForm((previous) => ({
      ...previous,
      image: null,
      imagePreview: "",
    }));

    const input =
      document.getElementById(
        "goal-image"
      );

    if (input) {
      input.value = "";
    }
  };

  /* ============================================================
     SAVE GOAL
  ============================================================ */

  const handleSubmit = async (event) => {
    event.preventDefault();

    const targetAmount = Number(
      form.target_amount || 0
    );

    const currentAmount = Number(
      form.current_amount || 0
    );

    if (!form.name.trim()) {
      alert("Please enter a goal name.");
      return;
    }

    if (targetAmount <= 0) {
      alert(
        "Target amount must be greater than zero."
      );
      return;
    }

    if (currentAmount < 0) {
      alert(
        "Current amount cannot be negative."
      );
      return;
    }

    if (currentAmount > targetAmount) {
      alert(
        "Current amount cannot be greater than target amount."
      );
      return;
    }

    try {
      setSaving(true);

      /*
       * Multipart form data.
       *
       * DO NOT manually set Content-Type.
       * Browser automatically adds the multipart boundary.
       */

      const payload = new FormData();

      payload.append(
        "name",
        form.name.trim()
      );

      payload.append(
        "target_amount",
        String(targetAmount)
      );

      payload.append(
        "current_amount",
        String(currentAmount)
      );

      payload.append(
        "description",
        form.description.trim()
      );

      if (form.target_date) {
        payload.append(
          "target_date",
          form.target_date
        );
      }

      /*
       * Only send an actual newly selected file.
       *
       * Existing imagePreview is NEVER submitted as image.
       */

      if (form.image instanceof File) {
        payload.append(
          "image",
          form.image
        );
      }

      const token =
        localStorage.getItem("access");

      if (!token) {
        throw new Error(
          "Your login session has expired. Please sign in again."
        );
      }

      const url = editingGoal
        ? `/api/expenses/goals/${editingGoal.id}/`
        : "/api/expenses/goals/";

      const method = editingGoal
        ? "PATCH"
        : "POST";

      const response = await fetch(url, {
        method,

        headers: {
          Authorization: `Bearer ${token}`,
        },

        body: payload,
      });

      const responseText =
        await response.text();

      let responseData = {};

      try {
        responseData = responseText
          ? JSON.parse(responseText)
          : {};
      } catch {
        responseData = {
          detail: responseText,
        };
      }

      if (!response.ok) {
        console.error(
          "Save Goal Error:",
          responseData
        );

        let message =
          "Unable to save goal.";

        if (
          responseData &&
          typeof responseData === "object"
        ) {
          message = Object.entries(
            responseData
          )
            .map(([key, value]) => {
              const text =
                Array.isArray(value)
                  ? value.join(", ")
                  : String(value);

              return `${key}: ${text}`;
            })
            .join("\n");
        }

        throw new Error(message);
      }

      await fetchGoals();

      closeModal();
    } catch (err) {
      console.error(
        "Save Goal Error:",
        err
      );

      alert(
        err.message ||
          "Unable to save goal."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ============================================================
     DELETE
  ============================================================ */

  const confirmDelete = async () => {
    if (!deleteGoal) {
      return;
    }

    try {
      setDeleting(true);

      await api.delete(
        `/expenses/goals/${deleteGoal.id}/`
      );

      setGoals((previous) =>
        previous.filter(
          (goal) =>
            goal.id !== deleteGoal.id
        )
      );

      setDeleteGoal(null);
    } catch (err) {
      console.error(
        "Delete Goal Error:",
        err.response?.data || err
      );

      alert(
        "Unable to delete this goal."
      );
    } finally {
      setDeleting(false);
    }
  };

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className={styles.page}>
      <span
        className={styles.pageDoodleOne}
        aria-hidden="true"
      />

      <span
        className={styles.pageDoodleTwo}
        aria-hidden="true"
      />

      {/* HEADER */}

      <header className={styles.header}>
        <div>
          <h1>Goals</h1>

          <div className={styles.tabs}>
            <button
              type="button"
              className={
                activeTab === "progress"
                  ? styles.activeTab
                  : ""
              }
              onClick={() =>
                setActiveTab("progress")
              }
            >
              In Progress
            </button>

            <button
              type="button"
              className={
                activeTab === "completed"
                  ? styles.activeTab
                  : ""
              }
              onClick={() =>
                setActiveTab("completed")
              }
            >
              Completed
            </button>
          </div>
        </div>

        <button
          type="button"
          className={
            styles.newGoalButton
          }
          onClick={openCreateModal}
        >
          <Plus
            size={15}
            strokeWidth={2}
          />

          New Goal
        </button>
      </header>

      {/* LOADING */}

      {loading && (
        <div className={styles.loading}>
          Loading goals...
        </div>
      )}

      {/* ERROR */}

      {!loading && error && (
        <div className={styles.errorState}>
          <strong>
            Something went wrong
          </strong>

          <span>{error}</span>

          <button
            type="button"
            onClick={fetchGoals}
          >
            Try again
          </button>
        </div>
      )}

      {/* CONTENT */}

      {!loading && !error && (
        <main className={styles.content}>
          <div className={styles.goalGrid}>
            {filteredGoals.map((goal) => {
              const progress = Math.min(
                Number(
                  goal.progress_percentage || 0
                ),
                100
              );

              const current = Number(
                goal.current_amount || 0
              );

              const target = Number(
                goal.target_amount || 0
              );

              const remaining = Math.max(
                target - current,
                0
              );

              /*
               * IMPORTANT:
               * Keep this call here and keep getMilestone()
               * defined above the component.
               */
              const milestone =
                getMilestone(progress);

              const MilestoneIcon =
                milestone.icon;

              let daysLeft = null;

              if (goal.target_date) {
                const targetDate =
                  new Date(
                    `${goal.target_date}T00:00:00`
                  );

                const today = new Date();

                today.setHours(
                  0,
                  0,
                  0,
                  0
                );

                daysLeft = Math.ceil(
                  (targetDate - today) /
                    86400000
                );
              }

              /*
               * IMAGE FIX
               *
               * This now converts:
               *
               * http://localhost/media/...
               *
               * into:
               *
               * http://localhost:8080/media/...
               */
              const imageUrl =
                getImageUrl(goal.image);

              const hasImage =
                Boolean(imageUrl);

              return (
                <article
                  key={goal.id}
                  className={styles.goalCard}
                >
                  {/* CARD HEADER */}

                  <div
                    className={
                      styles.cardHeader
                    }
                  >
                    <div
                      className={
                        styles.goalIdentity
                      }
                    >
                      <div
                        className={
                          styles.goalIcon
                        }
                      >
                        <Medal
                          size={18}
                          strokeWidth={1.8}
                        />
                      </div>

                      <div
                        className={
                          styles.goalTitle
                        }
                      >
                        <h2>
                          {goal.name}
                        </h2>

                        {goal.description && (
                          <p>
                            {goal.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div
                      className={
                        styles.cardActions
                      }
                    >
                      <button
                        type="button"
                        onClick={() =>
                          openEditModal(goal)
                        }
                        aria-label="Edit goal"
                      >
                        <Edit3 size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setDeleteGoal(goal)
                        }
                        aria-label="Delete goal"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  {/* IMAGE */}

                  <div
                    className={[
                      styles.goalVisual,
                      hasImage
                        ? styles.goalVisualImage
                        : "",
                    ].join(" ")}
                  >
                    {hasImage ? (
                      <img
                        src={imageUrl}
                        alt={goal.name}
                        className={
                          styles.goalImage
                        }
                        onError={(event) => {
                          /*
                           * If an old/broken image URL
                           * exists, hide only the image
                           * instead of crashing the page.
                           */
                          event.currentTarget.style.display =
                            "none";
                        }}
                      />
                    ) : (
                      <>
                        <div
                          className={
                            styles.imagePlaceholder
                          }
                        >
                          <Target
                            size={38}
                            strokeWidth={1.4}
                          />

                          <span>
                            Visualise
                            your goal
                          </span>
                        </div>

                        <svg
                          className={
                            styles.doodleOne
                          }
                          viewBox="0 0 32 32"
                          aria-hidden="true"
                        >
                          <path d="M16 3 C16 9 16 23 16 29" />
                          <path d="M3 16 C9 16 23 16 29 16" />
                        </svg>

                        <svg
                          className={
                            styles.doodleTwo
                          }
                          viewBox="0 0 40 24"
                          aria-hidden="true"
                        >
                          <path d="M2 19 C8 7 17 3 28 6 C33 7 36 11 38 16" />
                        </svg>

                        <svg
                          className={
                            styles.doodleThree
                          }
                          viewBox="0 0 28 28"
                          aria-hidden="true"
                        >
                          <path d="M14 2 C14 7 14 21 14 26" />
                          <path d="M2 14 C7 14 21 14 26 14" />
                        </svg>
                      </>
                    )}
                  </div>

                  {/* AMOUNT */}

                  <div
                    className={
                      styles.amountRow
                    }
                  >
                    <div>
                      <strong>
                        ₹
                        {money(current)}
                      </strong>

                      <span>
                        {" "}
                        / ₹
                        {money(target)}
                      </span>
                    </div>

                    <strong>
                      {Math.round(progress)}%
                    </strong>
                  </div>

                  {/* PROGRESS */}

                  <div
                    className={
                      styles.progressTrack
                    }
                  >
                    <div
                      className={
                        styles.progressBar
                      }
                      style={{
                        width: `${progress}%`,
                      }}
                    />
                  </div>

                  {/* META */}

                  <div
                    className={
                      styles.metaRow
                    }
                  >
                    <span>
                      {remaining > 0
                        ? `₹${money(
                            remaining
                          )} remaining`
                        : "Goal completed"}
                    </span>

                    {goal.target_date && (
                      <span
                        className={
                          styles.dateMeta
                        }
                      >
                        <CalendarDays
                          size={14}
                        />

                        {daysLeft > 0
                          ? `${daysLeft} days left`
                          : daysLeft === 0
                          ? "Due today"
                          : "Past deadline"}
                      </span>
                    )}
                  </div>

                  {/* MILESTONE */}

                  <div
                    className={
                      styles.milestone
                    }
                  >
                    <div
                      className={
                        styles.milestoneIcon
                      }
                    >
                      <MilestoneIcon
                        size={18}
                        strokeWidth={1.7}
                      />
                    </div>

                    <div>
                      <strong>
                        {milestone.title}
                      </strong>

                      <span>
                        {milestone.message}
                      </span>
                    </div>
                  </div>

                  <span
                    className={
                      styles.cardBottomDoodle
                    }
                  />
                </article>
              );
            })}

            {/* ADD GOAL */}

            {activeTab === "progress" && (
              <button
                type="button"
                className={
                  styles.addGoalCard
                }
                onClick={openCreateModal}
              >
                <svg
                  className={
                    styles.addDoodleOne
                  }
                  viewBox="0 0 80 36"
                  aria-hidden="true"
                >
                  <path d="M3 27 C18 5 38 3 55 13 C64 18 69 23 77 12" />
                </svg>

                <svg
                  className={
                    styles.addDoodleTwo
                  }
                  viewBox="0 0 32 32"
                  aria-hidden="true"
                >
                  <path d="M16 2 C16 9 16 23 16 30" />
                  <path d="M2 16 C9 16 23 16 30 16" />
                </svg>

                <svg
                  className={
                    styles.addDoodleThree
                  }
                  viewBox="0 0 30 30"
                  aria-hidden="true"
                >
                  <path d="M15 2 C15 8 15 22 15 28" />
                  <path d="M2 15 C8 15 22 15 28 15" />
                </svg>

                <div
                  className={
                    styles.addPlus
                  }
                >
                  <Plus
                    size={24}
                    strokeWidth={1.7}
                  />
                </div>

                <strong>
                  Add New Goal
                </strong>

                <span>
                  Start saving for
                  something
                  meaningful.
                </span>
              </button>
            )}
          </div>

          {/* MOTIVATION */}

          {activeTab === "progress" && (
            <div
              className={
                styles.motivation
              }
            >
              <div
                className={
                  styles.motivationShape
                }
              />

              <div
                className={
                  styles.motivationContent
                }
              >
                <strong>
                  Stay consistent,
                  stay awesome! 💪
                </strong>

                <span>
                  Small steps today,
                  big freedom tomorrow.
                </span>
              </div>

              <svg
                className={
                  styles.motivationDoodle
                }
                viewBox="0 0 70 36"
                aria-hidden="true"
              >
                <path d="M3 27 C16 7 34 3 51 11 C60 15 64 20 67 29" />
              </svg>
            </div>
          )}
        </main>
      )}

      {/* ==========================================================
          CREATE / EDIT MODAL
      ========================================================== */}

      {showModal && (
        <div
          className={
            styles.modalOverlay
          }
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeModal();
            }
          }}
        >
          <div
            className={styles.modal}
          >
            <div
              className={
                styles.modalHeader
              }
            >
              <div>
                <h2>
                  {editingGoal
                    ? "Edit Goal"
                    : "New Goal"}
                </h2>

                <p>
                  Give your money
                  a purpose.
                </p>
              </div>

              <button
                type="button"
                className={
                  styles.closeButton
                }
                onClick={closeModal}
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form
              className={styles.form}
              onSubmit={handleSubmit}
            >
              {/* NAME */}

              <label>
                Goal Name

                <input
                  name="name"
                  value={form.name}
                  onChange={
                    handleChange
                  }
                  placeholder="e.g. New Shoes"
                  required
                />
              </label>

              {/* IMAGE */}

              <div
                className={
                  styles.uploadSection
                }
              >
                <span
                  className={
                    styles.fieldLabel
                  }
                >
                  Goal Image
                </span>

                <input
                  id="goal-image"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className={
                    styles.fileInput
                  }
                  onChange={
                    handleImageChange
                  }
                />

                <label
                  htmlFor="goal-image"
                  className={
                    styles.uploadArea
                  }
                >
                  {form.imagePreview ? (
                    <div
                      className={
                        styles.previewWrapper
                      }
                    >
                      <img
                        src={
                          form.imagePreview
                        }
                        alt="Goal preview"
                        className={
                          styles.uploadPreview
                        }
                        onError={(
                          event
                        ) => {
                          /*
                           * If an existing image
                           * somehow fails, don't
                           * break the modal.
                           */
                          event.currentTarget.style.display =
                            "none";
                        }}
                      />

                      <div
                        className={
                          styles.previewOverlay
                        }
                      >
                        <ImageIcon
                          size={18}
                        />

                        <span>
                          Change
                          image
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div
                        className={
                          styles.uploadIcon
                        }
                      >
                        <Upload
                          size={19}
                          strokeWidth={1.8}
                        />
                      </div>

                      <strong>
                        Add a goal
                        image
                      </strong>

                      <span>
                        Upload a photo
                        that
                        represents
                        your goal
                      </span>

                      <small>
                        JPG, PNG or
                        WebP · Max
                        5 MB
                      </small>
                    </>
                  )}
                </label>

                {form.imagePreview && (
                  <button
                    type="button"
                    className={
                      styles.removeImage
                    }
                    onClick={
                      removeImage
                    }
                  >
                    Remove image
                  </button>
                )}
              </div>

              {/* AMOUNTS */}

              <div
                className={
                  styles.twoColumns
                }
              >
                <label>
                  Target Amount

                  <input
                    name="target_amount"
                    type="number"
                    min="1"
                    step="0.01"
                    value={
                      form.target_amount
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="15000"
                    required
                  />
                </label>

                <label>
                  Current Amount

                  <input
                    name="current_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      form.current_amount
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="0"
                  />
                </label>
              </div>

              {/* TARGET DATE */}

              <div
                className={
                  styles.formField
                }
              >
                <span
                  className={
                    styles.fieldLabel
                  }
                >
                  Target Date
                </span>

                <div
                  className={
                    styles.datePickerWrapper
                  }
                >
                  <button
                    type="button"
                    className={
                      styles.dateInput
                    }
                    onClick={() =>
                      setCalendarOpen(
                        (value) =>
                          !value
                      )
                    }
                  >
                    <span
                      className={
                        form.target_date
                          ? styles.dateValue
                          : styles.datePlaceholder
                      }
                    >
                      {form.target_date
                        ? formatDate(
                            form.target_date
                          )
                        : "Choose target date"}
                    </span>

                    <CalendarDays
                      size={18}
                    />
                  </button>

                  {calendarOpen && (
                    <CustomCalendar
                      value={
                        form.target_date
                      }
                      onChange={(
                        value
                      ) =>
                        setForm(
                          (
                            previous
                          ) => ({
                            ...previous,
                            target_date:
                              value,
                          })
                        )
                      }
                      onClose={() =>
                        setCalendarOpen(
                          false
                        )
                      }
                    />
                  )}
                </div>
              </div>

              {/* DESCRIPTION */}

              <label>
                Description

                <textarea
                  name="description"
                  value={
                    form.description
                  }
                  onChange={
                    handleChange
                  }
                  rows={3}
                  placeholder="What are you saving for?"
                />
              </label>

              {/* VALIDATION */}

              {Number(
                form.current_amount ||
                  0
              ) >
                Number(
                  form.target_amount ||
                    0
                ) &&
                Number(
                  form.target_amount ||
                    0
                ) > 0 && (
                  <div
                    className={
                      styles.formError
                    }
                  >
                    Current amount
                    cannot be greater
                    than target.
                  </div>
                )}

              {/* ACTIONS */}

              <div
                className={
                  styles.modalActions
                }
              >
                <button
                  type="button"
                  className={
                    styles.cancelButton
                  }
                  onClick={
                    closeModal
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={
                    styles.saveButton
                  }
                  disabled={
                    saving ||
                    !form.name.trim() ||
                    !form.target_amount ||
                    Number(
                      form.current_amount ||
                        0
                    ) >
                      Number(
                        form.target_amount ||
                          0
                      )
                  }
                >
                  {saving
                    ? "Saving..."
                    : editingGoal
                    ? "Save Changes"
                    : "Create Goal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================================
          DELETE MODAL
      ========================================================== */}

      {deleteGoal && (
        <div
          className={
            styles.modalOverlay
          }
          onMouseDown={() =>
            !deleting &&
            setDeleteGoal(null)
          }
        >
          <div
            className={
              styles.deleteModal
            }
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div
              className={
                styles.deleteIcon
              }
            >
              <Trash2
                size={20}
                strokeWidth={1.8}
              />
            </div>

            <h2>
              Delete this goal?
            </h2>

            <p>
              This will permanently
              delete{" "}
              <strong>
                {deleteGoal.name}
              </strong>
              .
            </p>

            <div
              className={
                styles.modalActions
              }
            >
              <button
                type="button"
                className={
                  styles.cancelButton
                }
                onClick={() =>
                  setDeleteGoal(null)
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className={
                  styles.deleteButton
                }
                onClick={
                  confirmDelete
                }
                disabled={deleting}
              >
                {deleting
                  ? "Deleting..."
                  : "Delete Goal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Goals;