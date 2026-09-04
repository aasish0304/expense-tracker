import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  ChevronDown,
  CreditCard,
  Flame,
  Lightbulb,
  Receipt,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

import api from "../services/api";
import styles from "./Reports.module.css";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const CATEGORY_COLORS = [
  "#8B6CFF",
  "#FFBF00",
  "#FF4F91",
  "#73C991",
  "#5E9CFF",
  "#FF8B5E",
];

const PAYMENT_SYMBOLS = {
  UPI: "↗",
  Cash: "₹",
  Card: "▣",
  Bank: "⌁",
};

const formatCurrency = (value = 0) =>
  `₹${Number(value || 0).toLocaleString("en-IN", {
    maximumFractionDigits: 0,
  })}`;

const parseDate = (value) => {
  if (!value) return null;

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

const getCategory = (expense) =>
  expense?.category?.name || "Other";

const getType = (expense) =>
  String(expense?.expense_type || "").toLowerCase();

const getWeekNumber = (date) =>
  date ? Math.ceil(date.getDate() / 7) : 1;


/* =========================================================
   STYLED DROPDOWN
========================================================= */

function StyledDropdown({
  value,
  options,
  onChange,
  className = "",
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        ref.current &&
        !ref.current.contains(event.target)
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

  const selected = options.find(
    (option) =>
      String(option.value) === String(value)
  );

  return (
    <div
      ref={ref}
      className={`${styles.dropdown} ${className}`}
    >
      <button
        type="button"
        className={styles.dropdownButton}
        onClick={() => setOpen((current) => !current)}
      >
        <span>{selected?.label || "Select"}</span>

        <ChevronDown
          size={16}
          className={
            open ? styles.chevronOpen : ""
          }
        />
      </button>

      {open && (
        <div className={styles.dropdownMenu}>
          {options.map((option) => (
            <button
              type="button"
              key={option.value}
              className={
                String(option.value) === String(value)
                  ? styles.dropdownOptionActive
                  : styles.dropdownOption
              }
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}


/* =========================================================
   REPORTS
========================================================= */

export default function Reports() {
  const today = new Date();

  const [expenses, setExpenses] = useState([]);
  const [budgets, setBudgets] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedMonth, setSelectedMonth] =
    useState(today.getMonth());

  const [selectedYear, setSelectedYear] =
    useState(today.getFullYear());

  const [view, setView] = useState("month");

  const [selectedWeek, setSelectedWeek] =
    useState(1);


  /* =========================================================
     LOAD DATA
  ========================================================= */

  useEffect(() => {
    const loadReports = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          expenseResponse,
          budgetResponse,
        ] = await Promise.all([
          api.get("/"),
          api.get("/budgets/"),
        ]);

        setExpenses(
          Array.isArray(expenseResponse.data)
            ? expenseResponse.data
            : []
        );

        setBudgets(
          Array.isArray(budgetResponse.data)
            ? budgetResponse.data
            : []
        );
      } catch (err) {
        console.error(err);
        setError(
          "We couldn't load your spending reports."
        );
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);


  /* =========================================================
     YEAR OPTIONS
  ========================================================= */

  const yearOptions = useMemo(() => {
    const years = new Set();

    for (
      let year = today.getFullYear() - 3;
      year <= today.getFullYear() + 2;
      year++
    ) {
      years.add(year);
    }

    expenses.forEach((expense) => {
      const date = parseDate(expense.date);

      if (date) {
        years.add(date.getFullYear());
      }
    });

    budgets.forEach((budget) => {
      if (budget.year) {
        years.add(Number(budget.year));
      }
    });

    return [...years]
      .sort((a, b) => b - a)
      .map((year) => ({
        value: year,
        label: String(year),
      }));
  }, [expenses, budgets, today]);


  /* =========================================================
     SELECTED MONTH
  ========================================================= */

  const selectedMonthExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const date = parseDate(expense.date);

      return (
        date &&
        date.getMonth() === selectedMonth &&
        date.getFullYear() === selectedYear
      );
    });
  }, [
    expenses,
    selectedMonth,
    selectedYear,
  ]);


  /* =========================================================
     PREVIOUS MONTH
  ========================================================= */

  const previousMonth =
    selectedMonth === 0
      ? 11
      : selectedMonth - 1;

  const previousYear =
    selectedMonth === 0
      ? selectedYear - 1
      : selectedYear;

  const previousMonthExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const date = parseDate(expense.date);

      return (
        date &&
        date.getMonth() === previousMonth &&
        date.getFullYear() === previousYear
      );
    });
  }, [
    expenses,
    previousMonth,
    previousYear,
  ]);


  /* =========================================================
     TOTALS
  ========================================================= */

  const totalSpending =
    selectedMonthExpenses.reduce(
      (sum, expense) =>
        sum + Number(expense.amount || 0),
      0
    );

  const previousSpending =
    previousMonthExpenses.reduce(
      (sum, expense) =>
        sum + Number(expense.amount || 0),
      0
    );

  const transactionCount =
    selectedMonthExpenses.length;

  const averageTransaction =
    transactionCount
      ? totalSpending / transactionCount
      : 0;

  const spendingChange =
    previousSpending
      ? ((totalSpending - previousSpending) /
          previousSpending) *
        100
      : totalSpending
      ? 100
      : 0;


  /* =========================================================
     BUDGET
  ========================================================= */

  const selectedBudget = budgets.reduce(
    (sum, budget) => {
      if (
        Number(budget.month) ===
          selectedMonth + 1 &&
        Number(budget.year) ===
          selectedYear
      ) {
        return (
          sum + Number(budget.amount || 0)
        );
      }

      return sum;
    },
    0
  );

  const budgetPercentage =
    selectedBudget
      ? (totalSpending / selectedBudget) * 100
      : 0;

  const budgetRemaining =
    selectedBudget - totalSpending;


  /* =========================================================
     CATEGORY BREAKDOWN
  ========================================================= */

  const categoryBreakdown = useMemo(() => {
    const map = {};

    selectedMonthExpenses.forEach((expense) => {
      const category = getCategory(expense);

      map[category] =
        (map[category] || 0) +
        Number(expense.amount || 0);
    });

    return Object.entries(map)
      .map(([name, amount], index) => ({
        name,
        amount,
        percentage: totalSpending
          ? (amount / totalSpending) * 100
          : 0,
        color:
          CATEGORY_COLORS[
            index % CATEGORY_COLORS.length
          ],
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [
    selectedMonthExpenses,
    totalSpending,
  ]);

  const topCategory = categoryBreakdown[0];


  /* =========================================================
     NEEDS / WANTS
  ========================================================= */

  const needs = selectedMonthExpenses
    .filter(
      (expense) =>
        getType(expense) === "need"
    )
    .reduce(
      (sum, expense) =>
        sum + Number(expense.amount || 0),
      0
    );

  const wants = selectedMonthExpenses
    .filter(
      (expense) =>
        getType(expense) === "want"
    )
    .reduce(
      (sum, expense) =>
        sum + Number(expense.amount || 0),
      0
    );

  const needsPercentage = totalSpending
    ? (needs / totalSpending) * 100
    : 0;


  /* =========================================================
     PAYMENT METHODS
  ========================================================= */

  const paymentBreakdown = useMemo(() => {
    const map = {};

    selectedMonthExpenses.forEach((expense) => {
      const payment =
        expense.payment_method || "Other";

      map[payment] =
        (map[payment] || 0) +
        Number(expense.amount || 0);
    });

    return Object.entries(map)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: totalSpending
          ? (amount / totalSpending) * 100
          : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [
    selectedMonthExpenses,
    totalSpending,
  ]);


  /* =========================================================
     DAYS
  ========================================================= */

  const daysInMonth = new Date(
    selectedYear,
    selectedMonth + 1,
    0
  ).getDate();

  const dailySpending = useMemo(() => {
    return Array.from(
      { length: daysInMonth },
      (_, index) => {
        const day = index + 1;

        const dayExpenses =
          selectedMonthExpenses.filter(
            (expense) => {
              const date = parseDate(expense.date);

              return (
                date &&
                date.getDate() === day
              );
            }
          );

        return {
          day,
          amount: dayExpenses.reduce(
            (sum, expense) =>
              sum +
              Number(expense.amount || 0),
            0
          ),
          transactions: dayExpenses.length,
        };
      }
    );
  }, [
    selectedMonthExpenses,
    daysInMonth,
  ]);


  /* =========================================================
     WEEK DATA
  ========================================================= */

  const weeklySpending = useMemo(() => {
    return [1, 2, 3, 4, 5].map((week) => {
      const weekExpenses =
        selectedMonthExpenses.filter(
          (expense) =>
            getWeekNumber(
              parseDate(expense.date)
            ) === week
        );

      return {
        week,
        amount: weekExpenses.reduce(
          (sum, expense) =>
            sum +
            Number(expense.amount || 0),
          0
        ),
        transactions:
          weekExpenses.length,
      };
    });
  }, [selectedMonthExpenses]);


  /* =========================================================
     SELECTED WEEK DAYS
  ========================================================= */

  const selectedWeekDays = useMemo(() => {
    const startDay =
      (selectedWeek - 1) * 7 + 1;

    const endDay = Math.min(
      selectedWeek * 7,
      daysInMonth
    );

    return dailySpending.filter(
      (day) =>
        day.day >= startDay &&
        day.day <= endDay
    );
  }, [
    dailySpending,
    selectedWeek,
    daysInMonth,
  ]);


  /* =========================================================
     SIX MONTH TREND
  ========================================================= */

  const sixMonthTrend = useMemo(() => {
    return Array.from(
      { length: 6 },
      (_, index) => {
        const offset = 5 - index;

        const date = new Date(
          selectedYear,
          selectedMonth - offset,
          1
        );

        const month = date.getMonth();
        const year = date.getFullYear();

        const amount = expenses
          .filter((expense) => {
            const expenseDate =
              parseDate(expense.date);

            return (
              expenseDate &&
              expenseDate.getMonth() === month &&
              expenseDate.getFullYear() === year
            );
          })
          .reduce(
            (sum, expense) =>
              sum +
              Number(expense.amount || 0),
            0
          );

        return {
          month,
          year,
          label: MONTHS[month].slice(0, 3),
          amount,
          active:
            month === selectedMonth &&
            year === selectedYear,
        };
      }
    );
  }, [
    expenses,
    selectedMonth,
    selectedYear,
  ]);


  /* =========================================================
     HIGHEST DAY
  ========================================================= */

  const highestSpendDay =
    [...dailySpending].sort(
      (a, b) => b.amount - a.amount
    )[0];


  /* =========================================================
     TOP TRANSACTIONS
  ========================================================= */

  const topExpenses = [
    ...selectedMonthExpenses,
  ]
    .sort(
      (a, b) =>
        Number(b.amount || 0) -
        Number(a.amount || 0)
    )
    .slice(0, 5);


  /* =========================================================
     MONTH STORY
  ========================================================= */

  const story = useMemo(() => {
    if (!totalSpending) {
      return {
        title:
          "Your spending story is waiting.",
        text:
          "Add a few transactions and Waku will start connecting the dots.",
      };
    }

    if (
      previousSpending > 0 &&
      spendingChange > 25
    ) {
      return {
        title:
          "This month got a little louder.",
        text: `You spent ${Math.round(
          spendingChange
        )}% more than last month.`,
      };
    }

    if (
      previousSpending > 0 &&
      spendingChange < -15
    ) {
      return {
        title:
          "You're finding your rhythm.",
        text: `Your spending came down ${Math.abs(
          Math.round(spendingChange)
        )}% compared with last month.`,
      };
    }

    if (topCategory) {
      return {
        title: `${topCategory.name} became the biggest part of your month.`,
        text: `It made up ${Math.round(
          topCategory.percentage
        )}% of your spending.`,
      };
    }

    return {
      title:
        "Your money is telling a steady story.",
      text: `You made ${transactionCount} transactions this month.`,
    };
  }, [
    totalSpending,
    previousSpending,
    spendingChange,
    topCategory,
    transactionCount,
  ]);


  /* =========================================================
     DAY STORY
  ========================================================= */

  const selectedWeekTotal =
    selectedWeekDays.reduce(
      (sum, day) => sum + day.amount,
      0
    );

  const selectedWeekTransactions =
    selectedWeekDays.reduce(
      (sum, day) =>
        sum + day.transactions,
      0
    );

  const selectedWeekAverage =
    selectedWeekDays.length
      ? selectedWeekTotal /
        selectedWeekDays.length
      : 0;

  const busiestWeekDay =
    [...selectedWeekDays].sort(
      (a, b) => b.amount - a.amount
    )[0];

  const quietestWeekDay =
    [...selectedWeekDays].sort(
      (a, b) => a.amount - b.amount
    )[0];

  const noSpendDays =
    selectedWeekDays.filter(
      (day) => day.amount === 0
    ).length;


  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <Activity size={20} />
        <span>
          Reading your spending story...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorState}>
        {error}
      </div>
    );
  }


  return (
    <div className={styles.page}>

      <div className={styles.doodleLeft}>
        〰
      </div>

      <div className={styles.doodleRight}>
        ✦
      </div>

      <main className={styles.content}>

        {/* =================================================
            HEADER
        ================================================= */}

        <header className={styles.header}>

          <div className={styles.headerText}>
            <div className={styles.eyebrow}>
              MONEY REPORT
            </div>

            <h1>
              Your spending, at a glance.
            </h1>

            <p>
              See where your money went and
              what your spending habits are
              telling you.
            </p>
          </div>

          <div className={styles.filters}>

            <StyledDropdown
              value={selectedMonth}
              onChange={setSelectedMonth}
              options={MONTHS.map(
                (month, index) => ({
                  value: index,
                  label: month,
                })
              )}
            />

            <StyledDropdown
              value={selectedYear}
              onChange={setSelectedYear}
              options={yearOptions}
              className={styles.yearDropdown}
            />

          </div>

        </header>


        {/* =================================================
            DRILL DOWN
        ================================================= */}

        <div className={styles.drillRow}>

          <div className={styles.drillTabs}>

            <button
              type="button"
              className={
                view === "month"
                  ? styles.drillActive
                  : styles.drillButton
              }
              onClick={() => setView("month")}
            >
              Month
            </button>

            <button
              type="button"
              className={
                view === "week"
                  ? styles.drillActive
                  : styles.drillButton
              }
              onClick={() => setView("week")}
            >
              Week
            </button>

            <button
              type="button"
              className={
                view === "day"
                  ? styles.drillActive
                  : styles.drillButton
              }
              onClick={() => setView("day")}
            >
              Day
            </button>

          </div>

          {view !== "month" && (
            <StyledDropdown
              value={selectedWeek}
              onChange={setSelectedWeek}
              options={[1, 2, 3, 4, 5].map(
                (week) => ({
                  value: week,
                  label: `Week ${week}`,
                })
              )}
            />
          )}

        </div>


        {/* =================================================
            SUMMARY
        ================================================= */}

        <section className={styles.summaryGrid}>

          <article
            className={`${styles.summaryCard} ${styles.yellow}`}
          >
            <div className={styles.summaryContent}>
              <span>Total spending</span>

              <strong>
                {formatCurrency(totalSpending)}
              </strong>

              <small
                className={
                  spendingChange <= 0
                    ? styles.good
                    : styles.bad
                }
              >
                {spendingChange <= 0 ? (
                  <ArrowDownRight size={13} />
                ) : (
                  <ArrowUpRight size={13} />
                )}

                {Math.abs(
                  Math.round(spendingChange)
                )}
                % vs last month
              </small>
            </div>

            <div className={styles.cardIcon}>
              <Wallet size={18} />
            </div>
          </article>


          <article
            className={`${styles.summaryCard} ${styles.purple}`}
          >
            <div className={styles.summaryContent}>
              <span>Transactions</span>

              <strong>
                {transactionCount}
              </strong>

              <small>
                {formatCurrency(
                  averageTransaction
                )}{" "}
                average
              </small>
            </div>

            <div className={styles.cardIcon}>
              <Receipt size={18} />
            </div>
          </article>


          <article
            className={`${styles.summaryCard} ${styles.pink}`}
          >
            <div className={styles.summaryContent}>
              <span>Average transaction</span>

              <strong>
                {formatCurrency(
                  averageTransaction
                )}
              </strong>

              <small>
                per transaction
              </small>
            </div>

            <div className={styles.cardIcon}>
              <BarChart3 size={18} />
            </div>
          </article>


          <article
            className={`${styles.summaryCard} ${styles.cream}`}
          >
            <div className={styles.summaryContent}>
              <span>Budget used</span>

              <strong>
                {selectedBudget
                  ? `${Math.round(
                      budgetPercentage
                    )}%`
                  : "—"}
              </strong>

              <small>
                {selectedBudget
                  ? `${formatCurrency(
                      Math.max(
                        budgetRemaining,
                        0
                      )
                    )} remaining`
                  : "No budget set"}
              </small>
            </div>

            <div className={styles.cardIcon}>
              <Target size={18} />
            </div>
          </article>

        </section>


        {/* =================================================
            MONTH VIEW
        ================================================= */}

        {view === "month" && (
          <>
            <section className={styles.twoColumn}>

              {/* SIX MONTH TREND */}

              <article
                className={`${styles.card} ${styles.trendCard}`}
              >

                <div className={styles.cardHeader}>
                  <div>
                    <span>SPENDING JOURNEY</span>

                    <h2>
                      How your spending moved
                    </h2>

                    <p>
                      Six months of your money story.
                    </p>
                  </div>

                  <div className={styles.headerIcon}>
                    <TrendingUp size={18} />
                  </div>
                </div>

                <div className={styles.chart}>

                  <div className={styles.chartLines}>
                    <span />
                    <span />
                    <span />
                  </div>

                  <div className={styles.bars}>

                    {sixMonthTrend.map((item) => {
                      const max = Math.max(
                        ...sixMonthTrend.map(
                          (x) => x.amount
                        ),
                        1
                      );

                      const height = item.amount
                        ? Math.max(
                            (item.amount / max) *
                              100,
                            8
                          )
                        : 3;

                      return (
                        <div
                          className={styles.barColumn}
                          key={`${item.month}-${item.year}`}
                        >
                          <div className={styles.barValue}>
                            {item.amount
                              ? formatCurrency(
                                  item.amount
                                )
                              : ""}
                          </div>

                          <div className={styles.barTrack}>
                            <div
                              className={
                                item.active
                                  ? styles.barActive
                                  : styles.bar
                              }
                              style={{
                                height: `${height}%`,
                              }}
                            />
                          </div>

                          <span>{item.label}</span>
                        </div>
                      );
                    })}

                  </div>
                </div>

                <div className={styles.chartStory}>

                  <div>
                    <span>THIS MONTH</span>
                    <strong>
                      {formatCurrency(totalSpending)}
                    </strong>
                  </div>

                  <div>
                    <span>LAST MONTH</span>
                    <strong>
                      {formatCurrency(previousSpending)}
                    </strong>
                  </div>

                  <div
                    className={
                      spendingChange <= 0
                        ? styles.good
                        : styles.bad
                    }
                  >
                    {spendingChange <= 0 ? (
                      <TrendingDown size={14} />
                    ) : (
                      <TrendingUp size={14} />
                    )}

                    {Math.abs(
                      Math.round(spendingChange)
                    )}
                    %
                  </div>

                </div>

              </article>


              {/* BUDGET */}

              <article className={styles.card}>

                <div className={styles.cardHeader}>
                  <div>
                    <span>BUDGET PERFORMANCE</span>

                    <h2>
                      How you're tracking
                    </h2>

                    <p>
                      Spending against your monthly plan.
                    </p>
                  </div>

                  <div className={styles.headerIcon}>
                    <Target size={18} />
                  </div>
                </div>

                {selectedBudget ? (
                  <>
                    <div className={styles.budgetCircle}>
                      <strong>
                        {Math.round(
                          budgetPercentage
                        )}
                        %
                      </strong>

                      <span>used</span>
                    </div>

                    <div className={styles.budgetNumbers}>

                      <div>
                        <span>Spent</span>

                        <strong>
                          {formatCurrency(
                            totalSpending
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>Budget</span>

                        <strong>
                          {formatCurrency(
                            selectedBudget
                          )}
                        </strong>
                      </div>

                    </div>

                    <div className={styles.progressTrack}>
                      <div
                        className={styles.progressFill}
                        style={{
                          width: `${Math.min(
                            budgetPercentage,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </>
                ) : (
                  <div className={styles.emptyState}>
                    <Target size={30} />

                    <strong>
                      No budget set
                    </strong>

                    <span>
                      Set a budget to compare your
                      spending.
                    </span>
                  </div>
                )}

              </article>

            </section>


            <section className={styles.threeColumn}>

              {/* CATEGORY */}

              <article className={styles.card}>

                <div className={styles.cardHeader}>
                  <div>
                    <span>WHERE IT WENT</span>

                    <h2>
                      Your biggest categories
                    </h2>
                  </div>

                  <div className={styles.headerIcon}>
                    <BarChart3 size={18} />
                  </div>
                </div>

                {categoryBreakdown.length ? (
                  <div className={styles.categoryList}>
                    {categoryBreakdown.map(
                      (category) => (
                        <div
                          className={styles.categoryRow}
                          key={category.name}
                        >
                          <div className={styles.categoryTop}>

                            <div>
                              <i
                                style={{
                                  background:
                                    category.color,
                                }}
                              />

                              <span>
                                {category.name}
                              </span>
                            </div>

                            <strong>
                              {formatCurrency(
                                category.amount
                              )}
                            </strong>

                          </div>

                          <div className={styles.categoryTrack}>
                            <div
                              style={{
                                width: `${category.percentage}%`,
                                background:
                                  category.color,
                              }}
                            />
                          </div>

                          <small>
                            {Math.round(
                              category.percentage
                            )}
                            % of spending
                          </small>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className={styles.emptyState}>
                    <BarChart3 size={28} />

                    <strong>
                      No spending recorded
                    </strong>
                  </div>
                )}

              </article>


              {/* NEEDS / WANTS */}

              <article className={styles.card}>

                <div className={styles.cardHeader}>
                  <div>
                    <span>SPENDING MIX</span>

                    <h2>
                      What was essential?
                    </h2>
                  </div>

                  <div className={styles.headerIcon}>
                    <Flame size={18} />
                  </div>
                </div>

                <div
                  className={styles.donut}
                  style={{
                    background: `conic-gradient(#FFBF00 0 ${needsPercentage}%, #DED6FF ${needsPercentage}% 100%)`,
                  }}
                >
                  <div>
                    <strong>
                      {Math.round(
                        needsPercentage
                      )}
                      %
                    </strong>

                    <span>Needs</span>
                  </div>
                </div>

                <div className={styles.mixList}>

                  <div>
                    <span>
                      <i className={styles.needDot} />
                      Needs
                    </span>

                    <strong>
                      {formatCurrency(needs)}
                    </strong>
                  </div>

                  <div>
                    <span>
                      <i className={styles.wantDot} />
                      Wants
                    </span>

                    <strong>
                      {formatCurrency(wants)}
                    </strong>
                  </div>

                </div>

                <div className={styles.mixTrack}>
                  <div
                    className={styles.needBar}
                    style={{
                      width: `${needsPercentage}%`,
                    }}
                  />

                  <div
                    className={styles.wantBar}
                    style={{
                      width: `${100 - needsPercentage}%`,
                    }}
                  />
                </div>

              </article>


              {/* PAYMENT */}

              <article className={styles.card}>

                <div className={styles.cardHeader}>
                  <div>
                    <span>PAYMENT BEHAVIOUR</span>

                    <h2>
                      How your money moved
                    </h2>
                  </div>

                  <div className={styles.headerIcon}>
                    <CreditCard size={18} />
                  </div>
                </div>

                <div className={styles.paymentList}>

                  {paymentBreakdown.length ? (
                    paymentBreakdown.map(
                      (payment) => (
                        <div
                          className={styles.paymentRow}
                          key={payment.name}
                        >
                          <div>
                            <div className={styles.paymentIcon}>
                              {PAYMENT_SYMBOLS[
                                payment.name
                              ] || "•"}
                            </div>

                            <span>
                              {payment.name}
                            </span>
                          </div>

                          <div>
                            <strong>
                              {formatCurrency(
                                payment.amount
                              )}
                            </strong>

                            <small>
                              {Math.round(
                                payment.percentage
                              )}
                              %
                            </small>
                          </div>
                        </div>
                      )
                    )
                  ) : (
                    <div className={styles.emptyState}>
                      <CreditCard size={28} />

                      <strong>
                        No payment data
                      </strong>
                    </div>
                  )}

                </div>

              </article>

            </section>


            <section className={styles.threeColumn}>

              {/* TOP TRANSACTIONS */}

              <article className={styles.card}>

                <div className={styles.cardHeader}>
                  <div>
                    <span>BIGGEST MONEY MOMENTS</span>

                    <h2>
                      Your largest transactions
                    </h2>
                  </div>

                  <div className={styles.headerIcon}>
                    <Receipt size={18} />
                  </div>
                </div>

                <div className={styles.expenseList}>

                  {topExpenses.length ? (
                    topExpenses.map(
                      (expense, index) => (
                        <div
                          className={styles.expenseRow}
                          key={
                            expense.id || index
                          }
                        >
                          <div className={styles.expenseRank}>
                            {index + 1}
                          </div>

                          <div className={styles.expenseDetails}>
                            <strong>
                              {expense.story ||
                                getCategory(
                                  expense
                                )}
                            </strong>

                            <span>
                              {getCategory(expense)}
                              {" · "}
                              {expense.payment_method ||
                                "Other"}
                            </span>
                          </div>

                          <strong
                            className={styles.expenseAmount}
                          >
                            {formatCurrency(
                              expense.amount
                            )}
                          </strong>
                        </div>
                      )
                    )
                  ) : (
                    <div className={styles.emptyState}>
                      <Receipt size={28} />

                      <strong>
                        No transactions
                      </strong>
                    </div>
                  )}

                </div>

              </article>


              {/* DAILY RHYTHM */}

              <article className={styles.card}>

                <div className={styles.cardHeader}>
                  <div>
                    <span>DAILY RHYTHM</span>

                    <h2>
                      When your wallet gets busy
                    </h2>
                  </div>

                  <div className={styles.headerIcon}>
                    <CalendarDays size={18} />
                  </div>
                </div>

                <div className={styles.dayGrid}>

                  {dailySpending.map((day) => {
                    const max = Math.max(
                      ...dailySpending.map(
                        (item) => item.amount
                      ),
                      1
                    );

                    const ratio =
                      day.amount / max;

                    const level =
                      ratio === 0
                        ? 0
                        : ratio < 0.25
                        ? 1
                        : ratio < 0.5
                        ? 2
                        : ratio < 0.75
                        ? 3
                        : 4;

                    return (
                      <div
                        key={day.day}
                        className={`${styles.dayCell} ${styles[`level${level}`]}`}
                        title={`Day ${day.day}: ${formatCurrency(
                          day.amount
                        )}`}
                      >
                        {day.day}
                      </div>
                    );
                  })}

                </div>

                <div className={styles.rhythmInsight}>
                  <Flame size={15} />

                  <span>
                    {highestSpendDay?.amount > 0
                      ? `Day ${highestSpendDay.day} was your busiest money day at ${formatCurrency(
                          highestSpendDay.amount
                        )}.`
                      : "Your spending rhythm will appear here."}
                  </span>
                </div>

              </article>


              {/* MONTH STORY */}

              <article className={styles.storyCardSmall}>

                <div className={styles.storyIconSmall}>
                  <Sparkles size={19} />
                </div>

                <span>WAKU'S TAKE</span>

                <h2>
                  {story.title}
                </h2>

                <p>
                  {story.text}
                </p>

              </article>

            </section>
          </>
        )}


        {/* =================================================
            WEEK VIEW
        ================================================= */}

        {view === "week" && (
          <>
            <section className={styles.twoColumn}>

              <article
                className={`${styles.card} ${styles.largeCard}`}
              >

                <div className={styles.cardHeader}>
                  <div>
                    <span>WEEKLY JOURNEY</span>

                    <h2>
                      How each week unfolded
                    </h2>

                    <p>
                      Compare the five parts of your
                      month and select one to explore.
                    </p>
                  </div>

                  <div className={styles.headerIcon}>
                    <CalendarDays size={18} />
                  </div>
                </div>

                <div className={styles.weekChart}>

                  {weeklySpending.map((week) => {
                    const max = Math.max(
                      ...weeklySpending.map(
                        (item) => item.amount
                      ),
                      1
                    );

                    const height = week.amount
                      ? Math.max(
                          (week.amount / max) *
                            100,
                          8
                        )
                      : 3;

                    return (
                      <div
                        className={styles.weekColumn}
                        key={week.week}
                      >
                        <strong>
                          {formatCurrency(
                            week.amount
                          )}
                        </strong>

                        <div
                          className={
                            week.week === selectedWeek
                              ? styles.weekBarActive
                              : styles.weekBar
                          }
                          style={{
                            height: `${height}%`,
                          }}
                        />

                        <span>
                          Week {week.week}
                        </span>

                        <small>
                          {week.transactions}{" "}
                          transactions
                        </small>
                      </div>
                    );
                  })}

                </div>

              </article>


              <article className={styles.card}>

                <div className={styles.cardHeader}>
                  <div>
                    <span>WEEKLY STORY</span>

                    <h2>
                      What happened this week?
                    </h2>
                  </div>

                  <div className={styles.headerIcon}>
                    <Lightbulb size={18} />
                  </div>
                </div>

                <div className={styles.weekStory}>

                  <span>
                    WEEK {selectedWeek}
                  </span>

                  <strong>
                    {formatCurrency(
                      weeklySpending[
                        selectedWeek - 1
                      ]?.amount || 0
                    )}
                  </strong>

                  <small>
                    {weeklySpending[
                      selectedWeek - 1
                    ]?.transactions || 0}{" "}
                    transactions
                  </small>

                  <p>
                    {weeklySpending[
                      selectedWeek - 1
                    ]?.amount
                      ? `Week ${selectedWeek} contributed ${Math.round(
                          ((weeklySpending[
                            selectedWeek - 1
                          ]?.amount || 0) /
                            (totalSpending || 1)) *
                            100
                        )}% of your monthly spending.`
                      : "This week is quiet. No spending has been recorded yet."}
                  </p>

                </div>

              </article>

            </section>


            <section className={styles.threeColumn}>

              {/* WEEK CATEGORY */}

              <article className={styles.card}>

                <div className={styles.cardHeader}>
                  <div>
                    <span>WEEKLY CATEGORY</span>

                    <h2>
                      Where Week {selectedWeek} went
                    </h2>
                  </div>

                  <div className={styles.headerIcon}>
                    <BarChart3 size={18} />
                  </div>
                </div>

                {(() => {
                  const weekExpenses =
                    selectedMonthExpenses.filter(
                      (expense) =>
                        getWeekNumber(
                          parseDate(expense.date)
                        ) === selectedWeek
                    );

                  const map = {};

                  weekExpenses.forEach((expense) => {
                    const category =
                      getCategory(expense);

                    map[category] =
                      (map[category] || 0) +
                      Number(
                        expense.amount || 0
                      );
                  });

                  const data =
                    Object.entries(map).sort(
                      (a, b) => b[1] - a[1]
                    );

                  const max = Math.max(
                    ...data.map(
                      (item) => item[1]
                    ),
                    1
                  );

                  return data.length ? (
                    <div className={styles.categoryList}>
                      {data.map(
                        ([name, amount], index) => (
                          <div
                            className={styles.categoryRow}
                            key={name}
                          >
                            <div className={styles.categoryTop}>
                              <div>
                                <i
                                  style={{
                                    background:
                                      CATEGORY_COLORS[
                                        index %
                                          CATEGORY_COLORS.length
                                      ],
                                  }}
                                />

                                <span>{name}</span>
                              </div>

                              <strong>
                                {formatCurrency(
                                  amount
                                )}
                              </strong>
                            </div>

                            <div className={styles.categoryTrack}>
                              <div
                                style={{
                                  width: `${
                                    (amount / max) *
                                    100
                                  }%`,
                                  background:
                                    CATEGORY_COLORS[
                                      index %
                                        CATEGORY_COLORS.length
                                    ],
                                }}
                              />
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div className={styles.emptyState}>
                      <BarChart3 size={28} />

                      <strong>
                        No spending this week
                      </strong>
                    </div>
                  );
                })()}

              </article>


              {/* WEEK TRANSACTIONS */}

              <article className={styles.card}>

                <div className={styles.cardHeader}>
                  <div>
                    <span>WEEKLY TRANSACTIONS</span>

                    <h2>
                      Your money moments
                    </h2>
                  </div>

                  <div className={styles.headerIcon}>
                    <Receipt size={18} />
                  </div>
                </div>

                <div className={styles.expenseList}>

                  {selectedMonthExpenses
                    .filter(
                      (expense) =>
                        getWeekNumber(
                          parseDate(expense.date)
                        ) === selectedWeek
                    )
                    .sort(
                      (a, b) =>
                        Number(b.amount) -
                        Number(a.amount)
                    )
                    .slice(0, 5)
                    .map((expense, index) => (
                      <div
                        className={styles.expenseRow}
                        key={
                          expense.id || index
                        }
                      >
                        <div className={styles.expenseRank}>
                          {index + 1}
                        </div>

                        <div className={styles.expenseDetails}>
                          <strong>
                            {expense.story ||
                              getCategory(
                                expense
                              )}
                          </strong>

                          <span>
                            {getCategory(expense)}
                          </span>
                        </div>

                        <strong
                          className={styles.expenseAmount}
                        >
                          {formatCurrency(
                            expense.amount
                          )}
                        </strong>
                      </div>
                    ))}

                </div>

              </article>


              {/* WEEK STORY */}

              <article className={styles.storyCardSmall}>

                <div className={styles.storyIconSmall}>
                  <Sparkles size={19} />
                </div>

                <span>THE WEEK IN A STORY</span>

                <h2>
                  Week {selectedWeek}{" "}
                  {weeklySpending[
                    selectedWeek - 1
                  ]?.amount >
                  totalSpending /
                    Math.max(
                      weeklySpending.length,
                      1
                    )
                    ? "is running hot."
                    : "is keeping things calm."}
                </h2>

                <p>
                  Breaking the month into weeks
                  makes changes much easier to see.
                </p>

              </article>

            </section>
          </>
        )}


        {/* =================================================
            DAY VIEW
        ================================================= */}

        {view === "day" && (
          <>
            <section className={styles.twoColumn}>

              {/* SINGLE DAY LINE CHART */}

              <article
                className={`${styles.card} ${styles.largeCard}`}
              >

                <div className={styles.cardHeader}>
                  <div>
                    <span>DAILY JOURNEY</span>

                    <h2>
                      Week {selectedWeek}, one day
                      at a time
                    </h2>

                    <p>
                      Daily spending across the
                      selected week.
                    </p>
                  </div>

                  <div className={styles.headerIcon}>
                    <Activity size={18} />
                  </div>
                </div>


                <div className={styles.lineChart}>

                  <div className={styles.lineYAxis}>
                    <span>
                      {formatCurrency(
                        Math.max(
                          ...selectedWeekDays.map(
                            (day) => day.amount
                          ),
                          1
                        )
                      )}
                    </span>

                    <span>₹0</span>
                  </div>


                  <div className={styles.lineArea}>

                    <div className={styles.lineGrid}>
                      <span />
                      <span />
                      <span />
                      <span />
                    </div>


                    <svg
                      className={styles.lineSvg}
                      viewBox="0 0 700 250"
                      preserveAspectRatio="none"
                    >

                      <polyline
                        className={styles.linePath}
                        points={selectedWeekDays
                          .map(
                            (day, index) => {
                              const max =
                                Math.max(
                                  ...selectedWeekDays.map(
                                    (item) =>
                                      item.amount
                                  ),
                                  1
                                );

                              const x =
                                selectedWeekDays.length >
                                1
                                  ? (index /
                                      (selectedWeekDays.length -
                                        1)) *
                                      680 +
                                    10
                                  : 350;

                              const y =
                                225 -
                                (day.amount / max) *
                                  205;

                              return `${x},${y}`;
                            }
                          )
                          .join(" ")}
                      />


                      {selectedWeekDays.map(
                        (day, index) => {
                          const max =
                            Math.max(
                              ...selectedWeekDays.map(
                                (item) =>
                                  item.amount
                              ),
                              1
                            );

                          const x =
                            selectedWeekDays.length >
                            1
                              ? (index /
                                  (selectedWeekDays.length -
                                    1)) *
                                  680 +
                                10
                              : 350;

                          const y =
                            225 -
                            (day.amount / max) *
                              205;

                          return (
                            <circle
                              key={day.day}
                              className={
                                styles.linePoint
                              }
                              cx={x}
                              cy={y}
                              r="5"
                            />
                          );
                        }
                      )}

                    </svg>


                    <div className={styles.lineLabels}>
                      {selectedWeekDays.map(
                        (day) => (
                          <span key={day.day}>
                            {MONTHS[
                              selectedMonth
                            ].slice(0, 3)}{" "}
                            {day.day}
                          </span>
                        )
                      )}
                    </div>

                  </div>

                </div>


                {/* WEEK METRICS */}

                <div className={styles.lineStory}>

                  <div>
                    <span>WEEK TOTAL</span>

                    <strong>
                      {formatCurrency(
                        selectedWeekTotal
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>DAILY AVERAGE</span>

                    <strong>
                      {formatCurrency(
                        selectedWeekAverage
                      )}
                    </strong>
                  </div>

                  <div>
                    <span>BUSIEST DAY</span>

                    <strong>
                      {busiestWeekDay?.day
                        ? `Day ${busiestWeekDay.day}`
                        : "—"}
                    </strong>
                  </div>

                </div>

              </article>


              {/* WEEK STORY */}

              <article className={styles.card}>

                <div className={styles.cardHeader}>
                  <div>
                    <span>WEEK AT A GLANCE</span>

                    <h2>
                      What stood out this week?
                    </h2>

                    <p>
                      A quick read of the pattern
                      behind your daily line.
                    </p>
                  </div>

                  <div className={styles.headerIcon}>
                    <Sparkles size={18} />
                  </div>
                </div>


                <div className={styles.dayStory}>

                  <span>
                    WEEK {selectedWeek}
                  </span>

                  <strong>
                    {formatCurrency(
                      selectedWeekTotal
                    )}
                  </strong>

                  <small>
                    {selectedWeekTransactions}{" "}
                    transactions
                  </small>

                  <p>
                    {busiestWeekDay?.amount > 0
                      ? `Day ${busiestWeekDay.day} was the biggest money moment at ${formatCurrency(
                          busiestWeekDay.amount
                        )}.`
                      : "This week has no recorded spending yet."}
                  </p>

                </div>

              </article>

            </section>


            {/* =================================================
                WEEK AT A GLANCE
            ================================================= */}

            <section className={styles.weekAtGlance}>

              <div className={styles.cardHeader}>
                <div>
                  <span>WEEK AT A GLANCE</span>

                  <h2>
                    What stood out this week?
                  </h2>

                  <p>
                    The key signals from the selected
                    week without repeating the daily chart.
                  </p>
                </div>

                <div className={styles.headerIcon}>
                  <Lightbulb size={18} />
                </div>
              </div>


              <div className={styles.glanceGrid}>

                <div className={styles.glanceItem}>
                  <span>HIGHEST SPEND</span>

                  <strong>
                    {formatCurrency(
                      busiestWeekDay?.amount || 0
                    )}
                  </strong>

                  <small>
                    Day{" "}
                    {busiestWeekDay?.day || "—"}
                  </small>
                </div>


                <div className={styles.glanceItem}>
                  <span>QUIETEST DAY</span>

                  <strong>
                    {formatCurrency(
                      quietestWeekDay?.amount || 0
                    )}
                  </strong>

                  <small>
                    Day{" "}
                    {quietestWeekDay?.day || "—"}
                  </small>
                </div>


                <div className={styles.glanceItem}>
                  <span>NO-SPEND DAYS</span>

                  <strong>
                    {noSpendDays}
                  </strong>

                  <small>
                    days with ₹0 spending
                  </small>
                </div>


                <div className={styles.glanceItem}>
                  <span>TRANSACTIONS</span>

                  <strong>
                    {selectedWeekTransactions}
                  </strong>

                  <small>
                    across the selected week
                  </small>
                </div>

              </div>


              <div className={styles.weekInsight}>

                <div className={styles.weekInsightIcon}>
                  <Lightbulb size={17} />
                </div>

                <div>
                  <span>WAKU INSIGHT</span>

                  <p>
                    {(() => {
                      if (
                        !busiestWeekDay?.amount
                      ) {
                        return "This week is quiet so far. Once spending picks up, Waku will highlight the strongest pattern here.";
                      }

                      if (noSpendDays >= 3) {
                        return `Your spending is concentrated rather than constant. Day ${busiestWeekDay.day} carried the biggest spend, while ${noSpendDays} days stayed completely quiet.`;
                      }

                      return `Your spending was spread across the week, with Day ${busiestWeekDay.day} standing out as the biggest money moment at ${formatCurrency(
                        busiestWeekDay.amount
                      )}.`;
                    })()}
                  </p>
                </div>

              </div>

            </section>

          </>
        )}


        {/* =================================================
            MONTH STORY ONLY
        ================================================= */}

        {view === "month" && (
          <section className={styles.finalStory}>

            <div className={styles.finalStoryIcon}>
              <Sparkles size={20} />
            </div>

            <div>
              <span>
                THE STORY BEHIND YOUR NUMBERS
              </span>

              <h2>
                {story.title}
              </h2>

              <p>
                {story.text}
              </p>
            </div>

          </section>
        )}

      </main>
    </div>
  );
}