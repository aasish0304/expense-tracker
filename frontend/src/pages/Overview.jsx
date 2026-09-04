import { useEffect, useMemo, useRef, useState } from "react";

import {
  Wallet,
  Receipt,
  Trophy,
  PiggyBank,
  TrendingUp,
  CalendarDays,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Sparkles,
  ArrowUpRight,
  Check,
} from "lucide-react";

import api from "../services/api";
import styles from "./Overview.module.css";


/* =========================================================
   HELPERS
========================================================= */

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}


function getMonthName(month) {
  return new Date(
    2000,
    month - 1,
    1
  ).toLocaleString("en-IN", {
    month: "long",
  });
}


function getShortMonthName(month) {
  return new Date(
    2000,
    month - 1,
    1
  ).toLocaleString("en-IN", {
    month: "short",
  });
}


function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 17) {
    return "Good afternoon";
  }

  return "Good evening";
}


function parseDate(value) {
  if (!value) {
    return null;
  }

  if (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    const [year, month, day] =
      value.split("-").map(Number);

    return new Date(
      year,
      month - 1,
      day
    );
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? null
    : date;
}


function isSameMonth(
  dateValue,
  month,
  year
) {
  const date = parseDate(dateValue);

  if (!date) {
    return false;
  }

  return (
    date.getMonth() + 1 === month &&
    date.getFullYear() === year
  );
}


/* =========================================================
   CONSTANTS
========================================================= */

const MONTHS = Array.from(
  { length: 12 },
  (_, index) => index + 1
);


/*
  These colors are deliberately tied to the position
  of the category in the spending story.
*/
const CATEGORY_COLORS = [
  "#8B6CFF",
  "#FFBF00",
  "#FF4F91",
  "#DED6FF",
  "#A8DADC",
  "#FFB4A2",
  "#B8E0D2",
  "#F4A261",
];


/* =========================================================
   COMPONENT
========================================================= */

function Overview() {
  const [expenses, setExpenses] =
    useState([]);

  const [budgets, setBudgets] =
    useState([]);

  const [goals, setGoals] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [profile, setProfile] =
    useState({
      name: "there",
    });


  /* =======================================================
     DATE
  ======================================================= */

  const now = new Date();

  const currentMonth =
    now.getMonth() + 1;

  const currentYear =
    now.getFullYear();


  /* =======================================================
     SELECTED MONTH / YEAR
  ======================================================= */

  const [
    selectedMonth,
    setSelectedMonth,
  ] = useState(currentMonth);

  const [
    selectedYear,
    setSelectedYear,
  ] = useState(currentYear);


  /* =======================================================
     PICKER
  ======================================================= */

  const [
    monthPickerOpen,
    setMonthPickerOpen,
  ] = useState(false);

  const [
    yearPickerOpen,
    setYearPickerOpen,
  ] = useState(false);

  const monthPickerRef =
    useRef(null);


  /* =======================================================
     PROFILE
  ======================================================= */

  useEffect(() => {
    try {
      const savedProfile =
        localStorage.getItem(
          "waku_profile"
        );

      if (savedProfile) {
        const parsed =
          JSON.parse(savedProfile);

        setProfile({
          name:
            parsed.name ||
            "there",
        });
      }
    } catch (err) {
      console.error(
        "Unable to load profile:",
        err
      );
    }
  }, []);


  /* =======================================================
     OUTSIDE CLICK
  ======================================================= */

  useEffect(() => {
    const handleOutsideClick =
      (event) => {
        if (
          monthPickerRef.current &&
          !monthPickerRef.current.contains(
            event.target
          )
        ) {
          setMonthPickerOpen(false);
          setYearPickerOpen(false);
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


  /* =======================================================
     ESCAPE
  ======================================================= */

  useEffect(() => {
    const handleEscape = (
      event
    ) => {
      if (event.key === "Escape") {
        setMonthPickerOpen(false);
        setYearPickerOpen(false);
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);


  /* =======================================================
     FETCH DATA
  ======================================================= */

  useEffect(() => {
    const fetchOverviewData =
      async () => {
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

          const expenseData =
            Array.isArray(
              expensesResponse.data
            )
              ? expensesResponse.data
              : expensesResponse.data
                  ?.results || [];

          const budgetData =
            Array.isArray(
              budgetsResponse.data
            )
              ? budgetsResponse.data
              : budgetsResponse.data
                  ?.results || [];

          const goalData =
            Array.isArray(
              goalsResponse.data
            )
              ? goalsResponse.data
              : goalsResponse.data
                  ?.results || [];

          setExpenses(
            expenseData
          );

          setBudgets(
            budgetData
          );

          setGoals(
            goalData
          );
        } catch (err) {
          console.error(
            "Overview Error:",
            err
          );

          setError(
            "Unable to load your financial overview."
          );
        } finally {
          setLoading(false);
        }
      };

    fetchOverviewData();
  }, []);


  /* =======================================================
     AVAILABLE YEARS
  ======================================================= */

  const availableYears =
    useMemo(() => {
      const years = new Set();

      /*
        Always show 10 years before and
        10 years after the current year.
      */

      for (
        let year =
          currentYear - 10;
        year <=
        currentYear + 10;
        year += 1
      ) {
        years.add(year);
      }

      /*
        Also include years found in
        actual expense data.
      */

      expenses.forEach(
        (expense) => {
          const date =
            parseDate(
              expense.date
            );

          if (date) {
            years.add(
              date.getFullYear()
            );
          }
        }
      );


      /*
        Include years found in budgets.
      */

      budgets.forEach(
        (budget) => {
          if (budget.year) {
            years.add(
              Number(
                budget.year
              )
            );
          }
        }
      );

      return Array.from(years)
        .filter((year) =>
          Number.isFinite(year)
        )
        .sort(
          (a, b) => b - a
        );
    }, [
      expenses,
      budgets,
      currentYear,
    ]);


  /* =======================================================
     SELECTED MONTH LABEL
  ======================================================= */

  const selectedMonthLabel =
    `${getMonthName(
      selectedMonth
    )} ${selectedYear}`;


  /* =======================================================
     MONTH EXPENSES
  ======================================================= */

  const selectedMonthExpenses =
    useMemo(() => {
      return expenses.filter(
        (expense) =>
          isSameMonth(
            expense.date,
            selectedMonth,
            selectedYear
          )
      );
    }, [
      expenses,
      selectedMonth,
      selectedYear,
    ]);


  /* =======================================================
     TOTAL SPENDING
  ======================================================= */

  const totalSpending =
    useMemo(() => {
      return selectedMonthExpenses.reduce(
        (sum, expense) =>
          sum +
          Number(
            expense.amount || 0
          ),
        0
      );
    }, [
      selectedMonthExpenses,
    ]);


  /* =======================================================
     TRANSACTIONS
  ======================================================= */

  const transactionCount =
    selectedMonthExpenses.length;


  /* =======================================================
     AVERAGE TRANSACTION
  ======================================================= */

  const averageTransaction =
    transactionCount > 0
      ? totalSpending /
        transactionCount
      : 0;


  /* =======================================================
     CATEGORY BREAKDOWN

     KEEP THIS LOGIC DYNAMIC.
  ======================================================= */

  const categoryBreakdown =
    useMemo(() => {
      const map = {};

      selectedMonthExpenses.forEach(
        (expense) => {
          const category =
            expense.category?.name ||
            "Other";

          map[category] =
            (map[category] || 0) +
            Number(
              expense.amount || 0
            );
        }
      );

      return Object.entries(map)
        .map(
          ([name, amount]) => ({
            name,
            amount,
            percentage:
              totalSpending > 0
                ? (amount /
                    totalSpending) *
                  100
                : 0,
          })
        )
        .sort(
          (a, b) =>
            b.amount - a.amount
        );
    }, [
      selectedMonthExpenses,
      totalSpending,
    ]);


  /* =======================================================
     DONUT SEGMENTS

     All categories are represented.
  ======================================================= */

  const donutSegments =
    useMemo(() => {
      let current = 0;

      return categoryBreakdown.map(
        (category, index) => {
          const start = current;

          current +=
            category.percentage;

          return {
            ...category,
            start,
            end: current,
            color:
              CATEGORY_COLORS[
                index %
                  CATEGORY_COLORS.length
              ],
          };
        }
      );
    }, [categoryBreakdown]);


  const donutGradient =
    useMemo(() => {
      if (
        donutSegments.length === 0
      ) {
        return "#eeeaf1";
      }

      return `conic-gradient(${donutSegments
        .map(
          (segment) =>
            `${segment.color} ${segment.start}% ${segment.end}%`
        )
        .join(", ")})`;
    }, [donutSegments]);


  /* =======================================================
     BUDGET
  ======================================================= */

  const selectedBudgets =
    useMemo(() => {
      return budgets.filter(
        (budget) =>
          Number(
            budget.month
          ) === selectedMonth &&
          Number(
            budget.year
          ) === selectedYear
      );
    }, [
      budgets,
      selectedMonth,
      selectedYear,
    ]);


  const totalBudget =
    selectedBudgets.reduce(
      (sum, budget) =>
        sum +
        Number(
          budget.amount || 0
        ),
      0
    );


  const totalBudgetSpent =
    selectedBudgets.reduce(
      (sum, budget) =>
        sum +
        Number(
          budget.spent || 0
        ),
      0
    );


  const budgetPercentage =
    totalBudget > 0
      ? Math.min(
          100,
          (totalBudgetSpent /
            totalBudget) *
            100
        )
      : 0;


  /* =======================================================
     RECENT EXPENSES
  ======================================================= */

  const recentExpenses =
    useMemo(() => {
      return [
        ...selectedMonthExpenses,
      ]
        .sort((a, b) => {
          const first =
            parseDate(b.date)
              ?.getTime() || 0;

          const second =
            parseDate(a.date)
              ?.getTime() || 0;

          return first - second;
        })
        .slice(0, 5);
    }, [
      selectedMonthExpenses,
    ]);


  /* =======================================================
     GOAL
  ======================================================= */

  const topGoal =
    goals.length > 0
      ? goals[0]
      : null;


  const goalProgress =
    topGoal
      ? Math.min(
          100,
          Number(
            topGoal.progress_percentage ||
              0
          )
        )
      : 0;


  /* =======================================================
     INSIGHT
  ======================================================= */

  const insight =
    useMemo(() => {
      const monthName =
        getMonthName(
          selectedMonth
        );

      if (
        transactionCount === 0
      ) {
        return `No expenses recorded for ${monthName} ${selectedYear}. Add an expense to start building your money story.`;
      }

      if (
        totalBudget > 0 &&
        budgetPercentage >= 100
      ) {
        return `Your ${monthName} budget has been reached. Keep an eye on your spending for the rest of the month.`;
      }

      if (
        totalBudget > 0 &&
        budgetPercentage >= 80
      ) {
        return `You're getting close to your ${monthName} budget. A little awareness now can make a big difference.`;
      }

      if (
        categoryBreakdown.length >
        0
      ) {
        return `${categoryBreakdown[0].name} is your biggest spending category in ${monthName}.`;
      }

      return `You're building a useful spending history for ${monthName}. Keep tracking consistently.`;
    }, [
      selectedMonth,
      selectedYear,
      transactionCount,
      totalBudget,
      budgetPercentage,
      categoryBreakdown,
    ]);


  /* =======================================================
     PICKER ACTIONS
  ======================================================= */

  const selectMonth = (
    month
  ) => {
    setSelectedMonth(month);
    setMonthPickerOpen(false);
    setYearPickerOpen(false);
  };


  const selectYear = (
    year
  ) => {
    setSelectedYear(year);
    setYearPickerOpen(false);
  };


  const moveYear = (
    direction
  ) => {
    const currentIndex =
      availableYears.indexOf(
        selectedYear
      );

    if (currentIndex === -1) {
      return;
    }

    const nextIndex =
      currentIndex + direction;

    if (
      nextIndex >= 0 &&
      nextIndex <
        availableYears.length
    ) {
      setSelectedYear(
        availableYears[
          nextIndex
        ]
      );
    }
  };


  const isCurrentMonth =
    selectedMonth ===
      currentMonth &&
    selectedYear ===
      currentYear;


  /* =======================================================
     TRANSACTION ICON
  ======================================================= */

  const getTransactionIcon = (
    category
  ) => {
    switch (category) {
      case "Food":
        return "🍔";

      case "Transport":
        return "🚕";

      case "Shopping":
        return "🛍️";

      case "Bills & Utilities":
        return "💡";

      case "Health & Fitness":
        return "❤️";

      case "Entertainment":
        return "🎬";

      case "Education":
        return "📚";

      default:
        return "💰";
    }
  };


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <section
        className={styles.page}
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
            ✨
          </div>

          <strong>
            Preparing your Waku overview...
          </strong>

          <span>
            Bringing your money story
            together.
          </span>
        </div>
      </section>
    );
  }


  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <section
        className={styles.page}
      >
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
      </section>
    );
  }


  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <section
      className={styles.page}
    >

      {/* =================================================
          WAKU DOODLES
      ================================================= */}

      {/* TOP RIGHT */}
      <svg
        className={`${styles.doodle} ${styles.doodleTopRight}`}
        viewBox="0 0 180 120"
        aria-hidden="true"
      >
        <path d="M12 78 C28 48, 57 39, 76 50 C96 62, 111 77, 129 66 C145 57, 157 37, 169 17" />

        <path d="M112 61 C125 40, 145 36, 163 42" />

        <path
          className={styles.sparkle}
          d="M163 9 L166 16 L173 19 L166 22 L163 29 L160 22 L153 19 L160 16 Z"
        />
      </svg>


      {/* LEFT */}
      <svg
        className={`${styles.doodle} ${styles.doodleLeft}`}
        viewBox="0 0 170 120"
        aria-hidden="true"
      >
        <path d="M8 82 C25 39, 55 28, 72 53 C89 79, 108 97, 128 73 C142 56, 153 35, 164 13" />
      </svg>


      {/* BOTTOM LEFT */}
      <svg
        className={`${styles.doodle} ${styles.doodleBottomLeft}`}
        viewBox="0 0 220 150"
        aria-hidden="true"
      >
        <path
          className={
            styles.blobYellow
          }
          d="M0 82 C34 57, 77 51, 116 62 C151 72, 176 101, 179 150 L0 150 Z"
        />

        <path
          className={
            styles.loopPurple
          }
          d="M155 91 C167 68, 193 62, 207 73 C217 81, 210 96, 195 103 C179 111, 158 108, 151 99"
        />

        <path
          className={
            styles.sparklePurple
          }
          d="M203 65 L206 72 L213 75 L206 78 L203 85 L200 78 L193 75 L200 72 Z"
        />
      </svg>


      {/* BOTTOM RIGHT */}
      <svg
        className={`${styles.doodle} ${styles.doodleBottomRight}`}
        viewBox="0 0 220 150"
        aria-hidden="true"
      >
        <path
          className={
            styles.blobLavender
          }
          d="M38 150 C41 113, 62 89, 94 77 C126 65, 166 70, 220 91 L220 150 Z"
        />

        <path
          className={
            styles.sparkleYellowSmall
          }
          d="M115 58 L118 65 L125 68 L118 71 L115 78 L112 71 L105 68 L112 65 Z"
        />

        <path
          className={
            styles.starPink
          }
          d="M159 105 L162 114 L172 115 L164 121 L167 130 L159 125 L151 130 L154 121 L146 115 L156 114 Z"
        />
      </svg>


      <div
        className={styles.content}
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <header
          className={styles.hero}
        >

          <div>
            <p
              className={
                styles.eyebrow
              }
            >
              YOUR MONEY STORY
            </p>

            <h1>
              {getGreeting()},{" "}
              {profile.name} 👋
            </h1>

            <p
              className={
                styles.subtitle
              }
            >
              Here's how your money is
              looking for{" "}
              {getMonthName(
                selectedMonth
              )}
              .
            </p>
          </div>


          {/* =================================================
              MONTH PICKER
          ================================================= */}

          <div
            className={
              styles.monthPicker
            }
            ref={
              monthPickerRef
            }
          >

            <button
              type="button"
              className={`${styles.monthBadge} ${
                monthPickerOpen
                  ? styles.monthBadgeActive
                  : ""
              }`}
              onClick={() => {
                setMonthPickerOpen(
                  (open) =>
                    !open
                );

                setYearPickerOpen(
                  false
                );
              }}
            >

              <CalendarDays
                size={15}
              />

              <span>
                {selectedMonthLabel}
              </span>

              <ChevronDown
                size={14}
                className={
                  monthPickerOpen
                    ? styles.chevronOpen
                    : ""
                }
              />

            </button>


            {monthPickerOpen && (
              <div
                className={
                  styles.monthDropdown
                }
              >

                {/* DROPDOWN HEADER */}

                <div
                  className={
                    styles.monthDropdownHeader
                  }
                >

                  <div>
                    <span>
                      VIEW MONTH
                    </span>

                    <strong>
                      {selectedMonthLabel}
                    </strong>
                  </div>


                  <button
                    type="button"
                    className={
                      styles.todayButton
                    }
                    onClick={() => {
                      setSelectedMonth(
                        currentMonth
                      );

                      setSelectedYear(
                        currentYear
                      );

                      setMonthPickerOpen(
                        false
                      );

                      setYearPickerOpen(
                        false
                      );
                    }}
                  >
                    {isCurrentMonth
                      ? "Current"
                      : "Today"}
                  </button>

                </div>


                {/* YEAR SELECTOR */}

                <div
                  className={
                    styles.yearSelector
                  }
                >

                  <button
                    type="button"
                    className={
                      styles.yearArrow
                    }
                    onClick={() =>
                      moveYear(1)
                    }
                    disabled={
                      availableYears.indexOf(
                        selectedYear
                      ) === 0
                    }
                    aria-label="Previous year"
                  >
                    <ChevronLeft
                      size={16}
                    />
                  </button>


                  <button
                    type="button"
                    className={`${styles.yearButton} ${
                      yearPickerOpen
                        ? styles.yearButtonActive
                        : ""
                    }`}
                    onClick={() =>
                      setYearPickerOpen(
                        (open) =>
                          !open
                      )
                    }
                  >

                    <span>
                      {selectedYear}
                    </span>

                    <ChevronDown
                      size={13}
                      className={
                        yearPickerOpen
                          ? styles.chevronOpen
                          : ""
                      }
                    />

                  </button>


                  <button
                    type="button"
                    className={
                      styles.yearArrow
                    }
                    onClick={() =>
                      moveYear(-1)
                    }
                    disabled={
                      availableYears.indexOf(
                        selectedYear
                      ) ===
                      availableYears.length -
                        1
                    }
                    aria-label="Next year"
                  >
                    <ChevronRight
                      size={16}
                    />
                  </button>


                  {/* YEAR DROPDOWN */}

                  {yearPickerOpen && (
                    <div
                      className={
                        styles.yearDropdown
                      }
                    >

                      <div
                        className={
                          styles.yearDropdownTitle
                        }
                      >
                        SELECT YEAR
                      </div>

                      <div
                        className={
                          styles.yearList
                        }
                      >

                        {availableYears.map(
                          (year) => (
                            <button
                              type="button"
                              key={year}
                              className={`${styles.yearOption} ${
                                year ===
                                selectedYear
                                  ? styles.yearOptionActive
                                  : ""
                              } ${
                                year ===
                                  currentYear &&
                                year !==
                                  selectedYear
                                  ? styles.yearOptionCurrent
                                  : ""
                              }`}
                              onClick={() =>
                                selectYear(
                                  year
                                )
                              }
                            >

                              <span>
                                {year}
                              </span>

                              {year ===
                                selectedYear && (
                                <Check
                                  size={13}
                                />
                              )}

                            </button>
                          )
                        )}

                      </div>

                    </div>
                  )}

                </div>


                {/* MONTH GRID */}

                <div
                  className={
                    styles.monthGrid
                  }
                >

                  {MONTHS.map(
                    (month) => {
                      const active =
                        month ===
                        selectedMonth;

                      const current =
                        month ===
                          currentMonth &&
                        selectedYear ===
                          currentYear;

                      return (
                        <button
                          type="button"
                          key={month}
                          className={`${styles.monthOption} ${
                            active
                              ? styles.monthOptionActive
                              : ""
                          } ${
                            current
                              ? styles.monthOptionCurrent
                              : ""
                          }`}
                          onClick={() =>
                            selectMonth(
                              month
                            )
                          }
                        >

                          <span>
                            {getShortMonthName(
                              month
                            )}
                          </span>

                          {current && (
                            <i />
                          )}

                        </button>
                      );
                    }
                  )}

                </div>


                {/* DROPDOWN FOOTER */}

                <div
                  className={
                    styles.monthDropdownFooter
                  }
                >

                  <span>
                    Select a month to
                    update your
                    overview
                  </span>

                  <ArrowUpRight
                    size={13}
                  />

                </div>

              </div>
            )}

          </div>

        </header>


        {/* =================================================
            KPI CARDS
        ================================================= */}

        <div
          className={
            styles.statsGrid
          }
        >

          <article
            className={`${styles.statCard} ${styles.statCardYellow}`}
          >

            <div
              className={
                styles.statIcon
              }
            >
              <Wallet size={18} />
            </div>

            <div
              className={
                styles.statLabel
              }
            >
              MONTHLY SPENDING
            </div>

            <strong
              className={
                styles.statValue
              }
            >
              {formatCurrency(
                totalSpending
              )}
            </strong>

            <span
              className={
                styles.statHint
              }
            >
              {getMonthName(
                selectedMonth
              )}{" "}
              expenses
            </span>

          </article>


          <article
            className={`${styles.statCard} ${styles.statCardPurple}`}
          >

            <div
              className={
                styles.statIcon
              }
            >
              <Receipt size={18} />
            </div>

            <div
              className={
                styles.statLabel
              }
            >
              TRANSACTIONS
            </div>

            <strong
              className={
                styles.statValue
              }
            >
              {transactionCount}
            </strong>

            <span
              className={
                styles.statHint
              }
            >
              Average{" "}
              {formatCurrency(
                averageTransaction
              )}
            </span>

          </article>


          <article
            className={`${styles.statCard} ${styles.statCardPink}`}
          >

            <div
              className={
                styles.statIcon
              }
            >
              <PiggyBank size={18} />
            </div>

            <div
              className={
                styles.statLabel
              }
            >
              MONTHLY BUDGET
            </div>

            <strong
              className={
                styles.statValue
              }
            >
              {formatCurrency(
                totalBudget
              )}
            </strong>

            <span
              className={
                styles.statHint
              }
            >
              {totalBudget > 0
                ? `${budgetPercentage.toFixed(
                    0
                  )}% used`
                : "No budget set yet"}
            </span>

          </article>


          <article
            className={`${styles.statCard} ${styles.statCardCream}`}
          >

            <div
              className={`${styles.statIcon} ${styles.goalStatIcon}`}
            >
              <Trophy size={18} />
            </div>

            <div
              className={
                styles.statLabel
              }
            >
              GOAL PROGRESS
            </div>

            <strong
              className={
                styles.statValue
              }
            >
              {topGoal
                ? `${goalProgress.toFixed(
                    0
                  )}%`
                : "—"}
            </strong>

            <span
              className={
                styles.statHint
              }
            >
              {topGoal
                ? topGoal.name
                : "Create your first goal"}
            </span>

          </article>

        </div>


        {/* =================================================
            MAIN GRID
        ================================================= */}

        <div
          className={
            styles.mainGrid
          }
        >

          {/* =================================================
              SPENDING STORY
          ================================================= */}

          <article
            className={
              styles.card
            }
          >

            <div
              className={
                styles.cardHeader
              }
            >

              <div>

                <p
                  className={
                    styles.cardEyebrow
                  }
                >
                  {getMonthName(
                    selectedMonth
                  ).toUpperCase()}
                </p>

                <h2>
                  Spending overview
                </h2>

              </div>


              <div
                className={
                  styles.trendIcon
                }
              >
                <TrendingUp
                  size={17}
                />
              </div>

            </div>


            <div
              className={
                styles.spendingHero
              }
            >

              <strong>
                {formatCurrency(
                  totalSpending
                )}
              </strong>

              <span>
                across{" "}
                {transactionCount}{" "}
                transactions
              </span>

            </div>


            {categoryBreakdown.length >
            0 ? (

              <div
                className={
                  styles.spendingChartArea
                }
              >

                {/* DONUT */}

                <div
                  className={
                    styles.donutWrapper
                  }
                >

                  <div
                    className={
                      styles.donutChart
                    }
                    style={{
                      background:
                        donutGradient,
                    }}
                  >

                    <div
                      className={
                        styles.donutInner
                      }
                    >

                      <span>
                        Total spent
                      </span>

                      <strong>
                        {formatCurrency(
                          totalSpending
                        )}
                      </strong>

                      <small>
                        {
                          transactionCount
                        }{" "}
                        transactions
                      </small>

                    </div>

                  </div>

                </div>


                {/* CATEGORY STORY */}

                <div
                  className={
                    styles.categoryLegend
                  }
                >

                  {donutSegments.map(
                    (
                      category
                    ) => (
                      <div
                        className={
                          styles.legendRow
                        }
                        key={
                          category.name
                        }
                      >

                        <div
                          className={
                            styles.legendInfo
                          }
                        >

                          <span
                            className={
                              styles.legendDot
                            }
                            style={{
                              background:
                                category.color,
                            }}
                          />

                          <div>

                            <strong>
                              {
                                category.name
                              }
                            </strong>

                            <span>
                              {formatCurrency(
                                category.amount
                              )}
                            </span>

                          </div>

                        </div>


                        <strong
                          className={
                            styles.legendPercentage
                          }
                        >
                          {category.percentage.toFixed(
                            0
                          )}
                          %
                        </strong>

                      </div>
                    )
                  )}

                </div>

              </div>

            ) : (

              <div
                className={
                  styles.emptyInline
                }
              >
                No spending recorded
                for{" "}
                {getMonthName(
                  selectedMonth
                )}{" "}
                {selectedYear}.
              </div>

            )}

          </article>


          {/* =================================================
              BUDGET
          ================================================= */}

          <article
            className={
              styles.card
            }
          >

            <div
              className={
                styles.cardHeader
              }
            >

              <div>

                <p
                  className={
                    styles.cardEyebrow
                  }
                >
                  BUDGET CHECK
                </p>

                <h2>
                  Monthly budget
                </h2>

              </div>

              <PiggyBank
                size={18}
              />

            </div>


            <div
              className={
                styles.budgetNumbers
              }
            >

              <div>

                <span>
                  Spent
                </span>

                <strong>
                  {formatCurrency(
                    totalBudgetSpent
                  )}
                </strong>

              </div>


              <div>

                <span>
                  Budget
                </span>

                <strong>
                  {formatCurrency(
                    totalBudget
                  )}
                </strong>

              </div>

            </div>


            <div
              className={
                styles.progressTrack
              }
            >

              <div
                className={
                  styles.progressFill
                }
                style={{
                  width: `${budgetPercentage}%`,
                }}
              />

            </div>


            <div
              className={
                styles.progressFooter
              }
            >

              <span>
                {totalBudget > 0
                  ? `${budgetPercentage.toFixed(
                      0
                    )}% used`
                  : "No budget yet"}
              </span>

              <span>
                {totalBudget > 0
                  ? `${formatCurrency(
                      Math.max(
                        totalBudget -
                          totalBudgetSpent,
                        0
                      )
                    )} left`
                  : "Set one in Budgets"}
              </span>

            </div>


            <button
              type="button"
              className={
                styles.textButton
              }
              onClick={() =>
                (window.location.href =
                  "/dashboard/budgets")
              }
            >
              View budgets
              <ChevronRight
                size={15}
              />
            </button>

          </article>

        </div>


        {/* =================================================
            LOWER GRID
        ================================================= */}

        <div
          className={
            styles.lowerGrid
          }
        >

          {/* RECENT TRANSACTIONS */}

          <article
            className={
              styles.card
            }
          >

            <div
              className={
                styles.cardHeader
              }
            >

              <div>

                <p
                  className={
                    styles.cardEyebrow
                  }
                >
                  RECENT ACTIVITY
                </p>

                <h2>
                  Recent transactions
                </h2>

              </div>


              <button
                type="button"
                className={
                  styles.viewButton
                }
                onClick={() =>
                  (window.location.href =
                    "/dashboard/expenses")
                }
              >
                View all
                <ChevronRight
                  size={14}
                />
              </button>

            </div>


            {recentExpenses.length >
            0 ? (

              <div
                className={
                  styles.transactionList
                }
              >

                {recentExpenses.map(
                  (expense) => {

                    const categoryName =
                      expense.category
                        ?.name ||
                      "Other";

                    const date =
                      parseDate(
                        expense.date
                      );

                    return (
                      <div
                        className={
                          styles.transactionRow
                        }
                        key={
                          expense.id
                        }
                      >

                        <div
                          className={
                            styles.transactionIcon
                          }
                        >
                          {getTransactionIcon(
                            categoryName
                          )}
                        </div>


                        <div
                          className={
                            styles.transactionDetails
                          }
                        >

                          <strong>
                            {expense.story ||
                              categoryName ||
                              "Expense"}
                          </strong>

                          <span>
                            {categoryName}
                            {" · "}
                            {expense.payment_method ||
                              "Payment"}
                          </span>

                        </div>


                        <div
                          className={
                            styles.transactionRight
                          }
                        >

                          <strong>
                            -{" "}
                            {formatCurrency(
                              expense.amount
                            )}
                          </strong>

                          <span>
                            {date
                              ? date.toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month:
                                      "short",
                                  }
                                )
                              : ""}
                          </span>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>

            ) : (

              <div
                className={
                  styles.emptyInline
                }
              >
                No transactions for{" "}
                {getMonthName(
                  selectedMonth
                )}{" "}
                {selectedYear}.
              </div>

            )}

          </article>


          {/* RIGHT COLUMN */}

          <div
            className={
              styles.sideStack
            }
          >

            {/* GOAL */}

            <article
              className={
                styles.goalCard
              }
            >

              <div
                className={
                  styles.cardHeader
                }
              >

                <div>

                  <p
                    className={
                      styles.cardEyebrow
                    }
                  >
                    YOUR NEXT WIN
                  </p>

                  <h2>
                    {topGoal
                      ? topGoal.name
                      : "Your first goal"}
                  </h2>

                </div>


                <div
                  className={
                    styles.goalIconLarge
                  }
                >
                  <Trophy
                    size={18}
                  />
                </div>

              </div>


              {topGoal ? (

                <>

                  <div
                    className={
                      styles.goalAmounts
                    }
                  >

                    <strong>
                      {formatCurrency(
                        topGoal.current_amount
                      )}
                    </strong>

                    <span>
                      of{" "}
                      {formatCurrency(
                        topGoal.target_amount
                      )}
                    </span>

                  </div>


                  <div
                    className={
                      styles.progressTrack
                    }
                  >

                    <div
                      className={
                        styles.goalProgressFill
                      }
                      style={{
                        width: `${goalProgress}%`,
                      }}
                    />

                  </div>


                  <div
                    className={
                      styles.progressFooter
                    }
                  >

                    <span>
                      {goalProgress.toFixed(
                        0
                      )}
                      % complete
                    </span>

                    {topGoal.target_date && (
                      <span>
                        Target{" "}
                        {parseDate(
                          topGoal.target_date
                        )?.toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month:
                              "short",
                            year:
                              "numeric",
                          }
                        )}
                      </span>
                    )}

                  </div>

                </>

              ) : (

                <div
                  className={
                    styles.emptyInline
                  }
                >
                  Create a goal and
                  start turning your
                  plans into progress.
                </div>

              )}


              <button
                type="button"
                className={
                  styles.textButton
                }
                onClick={() =>
                  (window.location.href =
                    "/dashboard/goals")
                }
              >
                View goals
                <ChevronRight
                  size={15}
                />
              </button>

            </article>


            {/* INSIGHT */}

            <article
              className={
                styles.insightCard
              }
            >

              <div
                className={
                  styles.insightIcon
                }
              >
                <Sparkles
                  size={16}
                />
              </div>

              <div>

                <strong>
                  A little Waku thought
                </strong>

                <p>
                  {insight}
                </p>

              </div>

            </article>

          </div>

        </div>


        {/* =================================================
            FOOTER
        ================================================= */}

        <footer
          className={
            styles.footer
          }
        >

          <div
            className={
              styles.footerContent
            }
          >

            <div
              className={
                styles.footerBrand
              }
            >

              <strong>
                waku.
              </strong>

              <span>
                Spend with a story ✦
              </span>

            </div>


            <div
              className={
                styles.footerMeta
              }
            >

              <span>
                © {currentYear} Waku
              </span>

              <span>
                Your money, your story.
              </span>

            </div>

          </div>

        </footer>

      </div>

    </section>
  );
}


export default Overview;