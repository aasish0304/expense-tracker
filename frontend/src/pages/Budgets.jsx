import { useEffect, useMemo, useState } from "react";
import axios from "axios";

import {
  Plus,
  ChevronRight,
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  HeartPulse,
  Lightbulb,
  Film,
  CreditCard,
  X,
  Pencil,
  Trash2,
} from "lucide-react";

import styles from "./Budgets.module.css";

const API_BASE_URL = "http://127.0.0.1:8000/api";

/* ============================================================
   CATEGORY ICONS
============================================================ */

const categoryIcons = {
  Food: Utensils,
  Entertainment: Film,
  Subscriptions: CreditCard,
  Transport: Car,
  Shopping: ShoppingBag,
  "Bills & Utilities": Receipt,
  "Health & Fitness": HeartPulse,
  "Food & Drinks": Utensils,
};

/* ============================================================
   CURRENCY
============================================================ */

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

/* ============================================================
   CUSTOM DROPDOWN
============================================================ */

const CustomDropdown = ({
  value,
  options,
  onChange,
  placeholder = "Select",
  className = "",
  menuStyle = {},
}) => {
  const [open, setOpen] = useState(false);

  const selectedOption = options.find(
    (option) =>
      String(option.value) === String(value)
  );

  useEffect(() => {
    const handleOutsideClick = () => {
      setOpen(false);
    };

    if (open) {
      document.addEventListener(
        "click",
        handleOutsideClick
      );
    }

    return () => {
      document.removeEventListener(
        "click",
        handleOutsideClick
      );
    };
  }, [open]);

  return (
    <div
      className={`${styles.customDropdown} ${className}`}
      onClick={(event) =>
        event.stopPropagation()
      }
    >
      <button
        type="button"
        className={`${styles.customDropdownButton} ${
          open
            ? styles.customDropdownButtonOpen
            : ""
        }`}
        onClick={() =>
          setOpen((previous) => !previous)
        }
      >
        <span
          className={
            selectedOption
              ? styles.dropdownSelectedText
              : styles.dropdownPlaceholder
          }
        >
          {selectedOption?.label || placeholder}
        </span>

        <ChevronRight
          size={17}
          className={
            open
              ? styles.dropdownChevronOpen
              : styles.dropdownChevron
          }
        />
      </button>

      {open && (
        <div
          className={styles.customDropdownMenu}
          style={menuStyle}
        >
          {options.map((option) => {
            const selected =
              String(option.value) ===
              String(value);

            return (
              <button
                key={String(option.value)}
                type="button"
                className={
                  selected
                    ? styles.customDropdownOptionActive
                    : styles.customDropdownOption
                }
                style={{
                  minWidth: 0,
                  width: "100%",
                  justifyContent: "center",
                  padding: "10px 8px",
                  borderRadius: "9px",
                }}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                <span>{option.label}</span>

                {selected && (
                  <span
                    className={
                      styles.dropdownCheck
                    }
                  >
                    ✓
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

/* ============================================================
   BUDGETS
============================================================ */

const Budgets = () => {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);

  /* ============================================================
     PERSIST SELECTED VIEW
  ============================================================ */

  const [activeTab, setActiveTab] = useState(() => {
    return (
      localStorage.getItem("waku_budget_tab") ||
      "active"
    );
  });

  const [periodView, setPeriodView] = useState(() => {
    return (
      localStorage.getItem("waku_budget_tab") ||
      "active"
    );
  });

  /* ============================================================
     HISTORY MONTH FILTER
  ============================================================ */

  const [selectedHistoryYear, setSelectedHistoryYear] =
    useState("all");

  const [selectedHistoryMonth, setSelectedHistoryMonth] =
    useState("all");

  /* ============================================================
     BUDGET FILTERS
  ============================================================ */

  const [selectedActiveCategory, setSelectedActiveCategory] =
    useState("all");

  const [selectedActiveStatus, setSelectedActiveStatus] =
    useState("all");

  const [selectedActiveSort, setSelectedActiveSort] =
    useState("category");

  const [selectedHistoryCategory, setSelectedHistoryCategory] =
    useState("all");

  const [selectedHistorySort, setSelectedHistorySort] =
    useState("date");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ============================================================
     MODALS
  ============================================================ */

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [selectedBudget, setSelectedBudget] =
    useState(null);

  const [editingBudget, setEditingBudget] =
    useState(null);

  const [deleteBudgetTarget, setDeleteBudgetTarget] =
    useState(null);

  /* ============================================================
     FORM
  ============================================================ */

  const [form, setForm] = useState({
    category_id: "",
    amount: "",
  });

  /* ============================================================
     AUTH
  ============================================================ */

  const token = localStorage.getItem("access");

  const authConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  /* ============================================================
     FETCH BUDGETS
  ============================================================ */

  const fetchBudgets = async (selectedView) => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${API_BASE_URL}/expenses/budgets/`,
        {
          ...authConfig,
          params: {
            view: selectedView,
          },
        }
      );

      console.log(
        "Budget API response:",
        response.data
      );

      setBudgets(
        Array.isArray(response.data)
          ? response.data
          : response.data.results || []
      );
    } catch (err) {
      console.error(
        "Failed to fetch budgets:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to load budgets."
      );

      setBudgets([]);
    } finally {
      setLoading(false);
    }
  };

  /* ============================================================
     FETCH CATEGORIES
  ============================================================ */

  const fetchCategories = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/expenses/categories/`,
        authConfig
      );

      setCategories(
        Array.isArray(response.data)
          ? response.data
          : response.data.results || []
      );
    } catch (err) {
      console.error(
        "Failed to fetch categories:",
        err
      );
    }
  };

  /* ============================================================
     INITIAL LOAD / TAB CHANGE
  ============================================================ */

  useEffect(() => {
    fetchBudgets(activeTab);
  }, [activeTab]);

  useEffect(() => {
    fetchCategories();
  }, []);

  /* ============================================================
     BUILD HISTORY YEAR OPTIONS
  ============================================================ */

  const historyYearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();

    const years = new Set();

    /*
     * Include years returned by the API.
     */
    budgets.forEach((budget) => {
      const year = Number(budget.year);

      if (year) {
        years.add(year);
      }
    });

    /*
     * Also include the previous 5 years so the filter
     * is available even before a budget is returned for
     * a particular year.
     */
    for (let i = 0; i < 5; i++) {
      years.add(currentYear - i);
    }

    return [
      {
        value: "all",
        label: "All Years",
      },
      ...Array.from(years)
        .sort((a, b) => b - a)
        .map((year) => ({
          value: String(year),
          label: String(year),
        })),
    ];
  }, [budgets]);

  /* ============================================================
     BUILD HISTORY MONTH OPTIONS
  ============================================================ */

  const historyMonthOptions = useMemo(() => {
    /*
     * Always show all 12 calendar months.
     * The selected year controls which budgets are displayed,
     * but it does NOT remove months from this dropdown.
     */
    const months = [
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

    return [
      {
        value: "all",
        label: "All Months",
      },
      ...months.map((label, index) => ({
        value: String(index + 1),
        label,
      })),
    ];
  }, []);

  /*
   * If the selected month no longer exists
   * after changing the year, reset it.
   */
  useEffect(() => {
    if (
      selectedHistoryMonth === "all"
    ) {
      return;
    }

    const monthExists =
      historyMonthOptions.some(
        (option) =>
          String(option.value) ===
          String(selectedHistoryMonth)
      );

    if (!monthExists) {
      setSelectedHistoryMonth("all");
    }
  }, [
    historyMonthOptions,
    selectedHistoryMonth,
  ]);

  /* ============================================================
     FILTER OPTIONS
  ============================================================ */

  const budgetCategoryOptions = useMemo(() => {
    const categoryNames = new Set();

    categories.forEach((category) => {
      if (category?.name) {
        categoryNames.add(category.name);
      }
    });

    budgets.forEach((budget) => {
      if (budget?.category?.name) {
        categoryNames.add(budget.category.name);
      }
    });

    return [
      {
        value: "all",
        label: "All Categories",
      },
      ...Array.from(categoryNames)
        .sort((a, b) => a.localeCompare(b))
        .map((name) => ({
          value: name,
          label: name,
        })),
    ];
  }, [categories, budgets]);

  const activeStatusOptions = [
    {
      value: "all",
      label: "All Status",
    },
    {
      value: "under50",
      label: "Under 50%",
    },
    {
      value: "50to75",
      label: "50% – 75%",
    },
    {
      value: "75to100",
      label: "75% – 100%",
    },
    {
      value: "over",
      label: "Over Budget",
    },
  ];

  const activeSortOptions = [
    {
      value: "category",
      label: "Category A–Z",
    },
    {
      value: "amountAsc",
      label: "Budget: Low → High",
    },
    {
      value: "amountDesc",
      label: "Budget: High → Low",
    },
    {
      value: "spentAsc",
      label: "Spent: Low → High",
    },
    {
      value: "spentDesc",
      label: "Spent: High → Low",
    },
    {
      value: "usageAsc",
      label: "Usage: Low → High",
    },
    {
      value: "usageDesc",
      label: "Usage: High → Low",
    },
  ];

  const historySortOptions = [
    {
      value: "date",
      label: "Newest First",
    },
    {
      value: "category",
      label: "Category A–Z",
    },
    {
      value: "amountAsc",
      label: "Budget: Low → High",
    },
    {
      value: "amountDesc",
      label: "Budget: High → Low",
    },
    {
      value: "usageDesc",
      label: "Usage: High → Low",
    },
    {
      value: "usageAsc",
      label: "Usage: Low → High",
    },
  ];

  const getUsagePercentage = (budget) =>
    Number(budget?.percentage || 0);

  /* ============================================================
     FILTER DISPLAYED BUDGETS
  ============================================================ */

  const displayedBudgets = useMemo(() => {
    let filtered = [...budgets];

    /* ==========================================================
       ACTIVE BUDGETS
    ========================================================== */

    if (activeTab !== "history") {
      if (selectedActiveCategory !== "all") {
        filtered = filtered.filter(
          (budget) =>
            budget.category?.name ===
            selectedActiveCategory
        );
      }

      if (selectedActiveStatus !== "all") {
        filtered = filtered.filter((budget) => {
          const usage = getUsagePercentage(budget);

          if (selectedActiveStatus === "under50") {
            return usage < 50;
          }

          if (selectedActiveStatus === "50to75") {
            return usage >= 50 && usage < 75;
          }

          if (selectedActiveStatus === "75to100") {
            return usage >= 75 && usage <= 100;
          }

          if (selectedActiveStatus === "over") {
            return usage > 100;
          }

          return true;
        });
      }

      return filtered.sort((a, b) => {
        const categoryA =
          a.category?.name || "";
        const categoryB =
          b.category?.name || "";

        const amountA =
          Number(a.amount || 0);
        const amountB =
          Number(b.amount || 0);

        const spentA =
          Number(a.spent || 0);
        const spentB =
          Number(b.spent || 0);

        const usageA =
          getUsagePercentage(a);
        const usageB =
          getUsagePercentage(b);

        switch (selectedActiveSort) {
          case "amountAsc":
            return amountA - amountB;

          case "amountDesc":
            return amountB - amountA;

          case "spentAsc":
            return spentA - spentB;

          case "spentDesc":
            return spentB - spentA;

          case "usageAsc":
            return usageA - usageB;

          case "usageDesc":
            return usageB - usageA;

          case "category":
          default:
            return categoryA.localeCompare(
              categoryB
            );
        }
      });
    }

    /* ==========================================================
       HISTORY
    ========================================================== */

    if (selectedHistoryYear !== "all") {
      filtered = filtered.filter(
        (budget) =>
          Number(budget.year) ===
          Number(selectedHistoryYear)
      );
    }

    if (selectedHistoryMonth !== "all") {
      filtered = filtered.filter(
        (budget) =>
          Number(budget.month) ===
          Number(selectedHistoryMonth)
      );
    }

    if (selectedHistoryCategory !== "all") {
      filtered = filtered.filter(
        (budget) =>
          budget.category?.name ===
          selectedHistoryCategory
      );
    }

    return filtered.sort((a, b) => {
      const yearA = Number(a.year || 0);
      const yearB = Number(b.year || 0);
      const monthA = Number(a.month || 0);
      const monthB = Number(b.month || 0);

      const categoryA =
        a.category?.name || "";
      const categoryB =
        b.category?.name || "";

      const amountA =
        Number(a.amount || 0);
      const amountB =
        Number(b.amount || 0);

      const usageA =
        getUsagePercentage(a);
      const usageB =
        getUsagePercentage(b);

      switch (selectedHistorySort) {
        case "category":
          return categoryA.localeCompare(
            categoryB
          );

        case "amountAsc":
          return amountA - amountB;

        case "amountDesc":
          return amountB - amountA;

        case "usageAsc":
          return usageA - usageB;

        case "usageDesc":
          return usageB - usageA;

        case "date":
        default:
          if (yearB !== yearA) {
            return yearB - yearA;
          }

          if (monthB !== monthA) {
            return monthB - monthA;
          }

          return categoryA.localeCompare(
            categoryB
          );
      }
    });
  }, [
    budgets,
    activeTab,
    selectedHistoryYear,
    selectedHistoryMonth,
    selectedHistoryCategory,
    selectedHistorySort,
    selectedActiveCategory,
    selectedActiveStatus,
    selectedActiveSort,
  ]);

  /* ============================================================
     TAB CHANGE
  ============================================================ */

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPeriodView(tab);

    localStorage.setItem(
      "waku_budget_tab",
      tab
    );

    /* Reset filters when changing tabs */
    setSelectedHistoryYear("all");
    setSelectedHistoryMonth("all");
    setSelectedHistoryCategory("all");
    setSelectedHistorySort("date");
    setSelectedActiveCategory("all");
    setSelectedActiveStatus("all");
    setSelectedActiveSort("category");

    setSelectedBudget(null);
    setDeleteBudgetTarget(null);
    setEditingBudget(null);
  };

  /* ============================================================
     TOP DROPDOWN CHANGE
  ============================================================ */

  const handlePeriodChange = (value) => {
    setPeriodView(value);
    setActiveTab(value);

    localStorage.setItem(
      "waku_budget_tab",
      value
    );

    /* Reset filters when switching
       between This Month and History */
    setSelectedHistoryYear("all");
    setSelectedHistoryMonth("all");
    setSelectedHistoryCategory("all");
    setSelectedHistorySort("date");
    setSelectedActiveCategory("all");
    setSelectedActiveStatus("all");
    setSelectedActiveSort("category");

    setSelectedBudget(null);
    setDeleteBudgetTarget(null);
    setEditingBudget(null);
  };

  /* ============================================================
     HISTORY YEAR CHANGE
  ============================================================ */

  const handleHistoryYearChange = (value) => {
    setSelectedHistoryYear(value);

    /*
     * Changing year resets the month to All Months.
     */
    setSelectedHistoryMonth("all");

    setSelectedBudget(null);
    setDeleteBudgetTarget(null);
  };

  /* ============================================================
     HISTORY MONTH CHANGE
  ============================================================ */

  const handleHistoryMonthChange = (value) => {
    setSelectedHistoryMonth(value);

    setSelectedBudget(null);
    setDeleteBudgetTarget(null);
  };

  const handleCategoryFilterChange = (value) => {
    if (activeTab === "history") {
      setSelectedHistoryCategory(value);
    } else {
      setSelectedActiveCategory(value);
    }

    setSelectedBudget(null);
    setDeleteBudgetTarget(null);
  };

  const handleSortChange = (value) => {
    if (activeTab === "history") {
      setSelectedHistorySort(value);
    } else {
      setSelectedActiveSort(value);
    }

    setSelectedBudget(null);
    setDeleteBudgetTarget(null);
  };

  const handleActiveStatusChange = (value) => {
    setSelectedActiveStatus(value);

    setSelectedBudget(null);
    setDeleteBudgetTarget(null);
  };

  /* ============================================================
     CREATE BUDGET
  ============================================================ */

  const createBudget = async (event) => {
    event.preventDefault();

    if (
      !form.category_id ||
      !form.amount
    ) {
      return;
    }

    try {
      const currentDate = new Date();

      await axios.post(
        `${API_BASE_URL}/expenses/budgets/`,
        {
          category_id: Number(
            form.category_id
          ),
          amount: Number(form.amount),
          month:
            currentDate.getMonth() + 1,
          year:
            currentDate.getFullYear(),
        },
        authConfig
      );

      setForm({
        category_id: "",
        amount: "",
      });

      setShowCreateModal(false);

      await fetchBudgets(activeTab);
    } catch (err) {
      console.error(
        "Failed to create budget:",
        err
      );

      const message =
        err.response?.data?.category_id?.[0] ||
        err.response?.data?.amount?.[0] ||
        err.response?.data?.detail ||
        "Unable to create budget.";

      setError(message);
    }
  };

  /* ============================================================
     UPDATE BUDGET
  ============================================================ */

  const updateBudget = async (event) => {
    event.preventDefault();

    if (!editingBudget) {
      return;
    }

    try {
      await axios.patch(
        `${API_BASE_URL}/expenses/budgets/${editingBudget.id}/`,
        {
          amount: Number(form.amount),
        },
        authConfig
      );

      setEditingBudget(null);
      setSelectedBudget(null);

      setForm({
        category_id: "",
        amount: "",
      });

      await fetchBudgets(activeTab);
    } catch (err) {
      console.error(
        "Failed to update budget:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to update budget."
      );
    }
  };

  /* ============================================================
     DELETE BUDGET
  ============================================================ */

  const deleteBudget = async (budget) => {
    if (!budget) {
      return;
    }

    try {
      await axios.delete(
        `${API_BASE_URL}/expenses/budgets/${budget.id}/`,
        authConfig
      );

      setDeleteBudgetTarget(null);
      setSelectedBudget(null);

      await fetchBudgets(activeTab);
    } catch (err) {
      console.error(
        "Failed to delete budget:",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Unable to delete budget."
      );
    }
  };

  /* ============================================================
     OPEN EDIT
  ============================================================ */

  const openEdit = (budget) => {
    setEditingBudget(budget);

    setForm({
      category_id:
        budget.category?.id || "",
      amount: budget.amount || "",
    });

    setSelectedBudget(null);
  };

  /* ============================================================
     CATEGORY ICON
  ============================================================ */

  const getCategoryIcon = (name) => {
    return (
      categoryIcons[name] || Receipt
    );
  };

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div
      className={styles.page}
      style={{
        position: "relative",
        overflow: "hidden",
      }}
    >

      {/* WAKU decorative background — does not change filters or page logic */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          overflow: "hidden",
          zIndex: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            left: "-35px",
            bottom: "-95px",
            width: "285px",
            height: "185px",
            background: "#FFF2C7",
            borderRadius: "70% 45% 0 0",
            transform: "rotate(-5deg)",
            opacity: 0.82,
          }}
        />

        <div
          style={{
            position: "absolute",
            right: "-65px",
            bottom: "-70px",
            width: "330px",
            height: "210px",
            background: "#DDD5FF",
            borderRadius: "72% 28% 0 0",
            transform: "rotate(-7deg)",
            opacity: 0.82,
          }}
        />

        <div
          style={{
            position: "absolute",
            right: "34px",
            top: "82px",
            width: "110px",
            height: "72px",
            transform: "rotate(-8deg)",
          }}
        >
          <span
            style={{
              position: "absolute",
              left: "2px",
              top: "0",
              color: "#FFB900",
              fontSize: "16px",
              lineHeight: 1,
            }}
          >
            ✦
          </span>
          <span
            style={{
              position: "absolute",
              left: "23px",
              top: "25px",
              width: "70px",
              height: "27px",
              borderTop: "2px solid #FFB900",
              borderRadius: "50%",
              transform: "rotate(-10deg)",
            }}
          />
          <span
            style={{
              position: "absolute",
              left: "75px",
              top: "14px",
              width: "28px",
              height: "22px",
              borderTop: "2px solid #FFB900",
              borderRadius: "50%",
              transform: "rotate(25deg)",
            }}
          />
        </div>

        <div
          style={{
            position: "absolute",
            left: "275px",
            bottom: "22px",
            width: "105px",
            height: "65px",
            transform: "rotate(-7deg)",
          }}
        >
          <span
            style={{
              position: "absolute",
              left: "4px",
              top: "24px",
              width: "65px",
              height: "27px",
              borderTop: "2px solid #8767FF",
              borderRadius: "50%",
              transform: "rotate(-14deg)",
            }}
          />
          <span
            style={{
              position: "absolute",
              left: "38px",
              top: "8px",
              width: "45px",
              height: "31px",
              borderTop: "2px solid #8767FF",
              borderRadius: "50%",
              transform: "rotate(18deg)",
            }}
          />
          <span
            style={{
              position: "absolute",
              right: "0",
              top: "5px",
              color: "#FFB900",
              fontSize: "13px",
            }}
          >
            ✦
          </span>
        </div>

        <div
          style={{
            position: "absolute",
            right: "38px",
            bottom: "25px",
            color: "#FF4F91",
            fontSize: "31px",
            lineHeight: 1,
            transform: "rotate(-12deg)",
          }}
        >
          ☆
        </div>
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className={styles.header}>

        <div className={styles.headerText}>
          <h1>Budgets</h1>

          <p>
            Plan your spending and stay on track.
          </p>
        </div>

        <div className={styles.headerActions}>

          {/* TOP LEVEL VIEW */}

          <CustomDropdown
            className={
              styles.periodDropdown
            }
            value={periodView}
            options={[
              {
                value: "active",
                label: "This Month",
              },
              {
                value: "history",
                label: "Budget History",
              },
            ]}
            onChange={
              handlePeriodChange
            }
          />

          <button
            type="button"
            className={
              styles.newBudgetButton
            }
            onClick={() => {
              setError("");
              setShowCreateModal(true);
            }}
          >
            <Plus size={17} />
            New Budget
          </button>

        </div>
      </div>

      {/* ======================================================
          BUDGET FILTERS
      ====================================================== */}

      <div
        style={{
          display: "flex",
          gap: "12px",
          marginBottom: "18px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {activeTab === "history" ? (
          <>
            <CustomDropdown
              className={styles.periodDropdown}
              value={selectedHistoryYear}
              options={historyYearOptions}
              onChange={handleHistoryYearChange}
            />

            <CustomDropdown
              className={styles.periodDropdown}
              value={selectedHistoryMonth}
              options={historyMonthOptions}
              onChange={handleHistoryMonthChange}
              menuStyle={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(3, minmax(90px, 1fr))",
                gap: "6px",
                padding: "10px",
                width: "330px",
                maxHeight: "none",
                overflow: "visible",
                background: "#ffffff",
                border: "1px solid #e7e3dc",
                borderRadius: "14px",
                boxShadow:
                  "0 12px 30px rgba(0, 0, 0, 0.12)",
              }}
            />

            <CustomDropdown
              className={styles.periodDropdown}
              value={selectedHistoryCategory}
              options={budgetCategoryOptions}
              onChange={handleCategoryFilterChange}
            />

            <CustomDropdown
              className={styles.periodDropdown}
              value={selectedHistorySort}
              options={historySortOptions}
              onChange={handleSortChange}
            />
          </>
        ) : (
          <>
            <CustomDropdown
              className={styles.periodDropdown}
              value={selectedActiveCategory}
              options={budgetCategoryOptions}
              onChange={handleCategoryFilterChange}
            />

            <CustomDropdown
              className={styles.periodDropdown}
              value={selectedActiveStatus}
              options={activeStatusOptions}
              onChange={handleActiveStatusChange}
            />

            <CustomDropdown
              className={styles.periodDropdown}
              value={selectedActiveSort}
              options={activeSortOptions}
              onChange={handleSortChange}
            />
          </>
        )}
      </div>

      {/* ======================================================
          TABS
      ====================================================== */}

      <div className={styles.tabs}>

        <button
          type="button"
          className={
            activeTab === "active"
              ? styles.activeTab
              : styles.tab
          }
          onClick={() =>
            handleTabChange("active")
          }
        >
          Active Budgets
        </button>

        <button
          type="button"
          className={
            activeTab === "history"
              ? styles.activeTab
              : styles.tab
          }
          onClick={() =>
            handleTabChange("history")
          }
        >
          Budget History
        </button>

      </div>

      {/* ======================================================
          BUDGET LIST
      ====================================================== */}

      <div className={styles.budgetCard}>

        {loading ? (

          <div className={styles.emptyState}>
            Loading budgets...
          </div>

        ) : error ? (

          <div className={styles.emptyState}>

            <div
              className={
                styles.emptyIcon
              }
            >
              <Receipt size={24} />
            </div>

            <h3>
              Unable to load budgets
            </h3>

            <p>{error}</p>

          </div>

        ) : displayedBudgets.length === 0 ? (

          <div className={styles.emptyState}>

            <div
              className={
                styles.emptyIcon
              }
            >
              <Receipt size={24} />
            </div>

            <h3>
              No budgets yet
            </h3>

            <p>
              {activeTab === "history"
                ? selectedHistoryMonth !==
                  "all"
                  ? `No budget found for ${
                      historyMonthOptions.find(
                        (item) =>
                          item.value ===
                          selectedHistoryMonth
                      )?.label ||
                      "this month"
                    }${
                      selectedHistoryYear !== "all"
                        ? ` ${selectedHistoryYear}`
                        : ""
                    }.`
                  : selectedHistoryYear !== "all"
                  ? `No budgets found for ${selectedHistoryYear}.`
                  : "Previous month budgets will appear here."
                : "Create a budget to start tracking your spending."}
            </p>

            {activeTab === "active" && (
              <button
                type="button"
                className={
                  styles.emptyButton
                }
                onClick={() => {
                  setError("");
                  setShowCreateModal(
                    true
                  );
                }}
              >
                <Plus size={16} />
                Create Budget
              </button>
            )}

          </div>

        ) : (

          displayedBudgets.map(
            (budget) => {

              const Icon =
                getCategoryIcon(
                  budget.category?.name
                );

              const percentage =
                Math.min(
                  Number(
                    budget.percentage ||
                      0
                  ),
                  100
                );

              return (
                <div
                  className={
                    styles.budgetRow
                  }
                  key={budget.id}
                >

                  <div
                    className={
                      styles.categoryIcon
                    }
                  >
                    <Icon size={18} />
                  </div>

                  <div
                    className={
                      styles.categoryDetails
                    }
                  >

                    <div
                      className={
                        styles.categoryName
                      }
                    >
                      {
                        budget.category
                          ?.name
                      }
                    </div>

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
                          width: `${percentage}%`,
                        }}
                      />
                    </div>

                  </div>

                  <div
                    className={
                      styles.amountSection
                    }
                  >
                    <strong>
                      {formatCurrency(
                        budget.spent
                      )}
                    </strong>

                    <span>
                      {" / "}
                      {formatCurrency(
                        budget.amount
                      )}
                    </span>
                  </div>

                  <div
                    className={
                      styles.percentage
                    }
                  >
                    {Math.round(
                      Number(
                        budget.percentage ||
                          0
                      )
                    )}
                    %
                  </div>

                  <button
                    type="button"
                    className={
                      styles.arrowButton
                    }
                    onClick={() =>
                      setSelectedBudget(
                        budget
                      )
                    }
                    aria-label="View budget details"
                  >
                    <ChevronRight
                      size={18}
                    />
                  </button>

                </div>
              );
            }
          )

        )}

      </div>

      {/* ======================================================
          PRO TIP
      ====================================================== */}

      <div className={styles.tipCard}>

        <div className={styles.tipIcon}>
          <Lightbulb size={29} />
        </div>

        <div>
          <span
            className={
              styles.tipLabel
            }
          >
            Pro tip
          </span>

          <p>
            You're doing great! Try to
            keep your spending under
            budget to reach your
            financial goals faster.
          </p>
        </div>

        <div
          className={
            styles.tipDecor
          }
        >
          ✦
        </div>

      </div>

      {/* ======================================================
          CREATE BUDGET MODAL
      ====================================================== */}

      {showCreateModal && (

        <div
          className={
            styles.modalOverlay
          }
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setShowCreateModal(
                false
              );
            }
          }}
        >

          <div
            className={styles.modal}
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            <div
              className={
                styles.modalHeader
              }
            >

              <div>
                <h2>
                  New Budget
                </h2>

                <p>
                  Set a spending limit
                  for this month.
                </p>
              </div>

              <button
                type="button"
                className={
                  styles.closeButton
                }
                onClick={() =>
                  setShowCreateModal(
                    false
                  )
                }
              >
                <X size={20} />
              </button>

            </div>

            <form
              onSubmit={
                createBudget
              }
            >

              <label>
                Category
              </label>

              <CustomDropdown
                className={
                  styles.categoryDropdown
                }
                value={
                  form.category_id
                }
                placeholder="Select category"
                options={[
                  {
                    value: "",
                    label:
                      "Select category",
                  },
                  ...categories.map(
                    (category) => ({
                      value:
                        String(
                          category.id
                        ),
                      label:
                        category.name,
                    })
                  ),
                ]}
                onChange={(value) =>
                  setForm({
                    ...form,
                    category_id:
                      value,
                  })
                }
              />

              <label>
                Budget Amount
              </label>

              <input
                className={
                  styles.formInput
                }
                type="number"
                min="1"
                step="0.01"
                placeholder="₹10,000"
                value={
                  form.amount
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    amount:
                      event.target.value,
                  })
                }
                required
              />

              <button
                type="submit"
                className={
                  styles.createButton
                }
              >
                Create Budget
              </button>

            </form>

          </div>

        </div>
      )}

      {/* ======================================================
          BUDGET DETAILS MODAL
      ====================================================== */}

      {selectedBudget && (

        <div
          className={
            styles.modalOverlay
          }
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setSelectedBudget(
                null
              );
            }
          }}
        >

          <div
            className={
              styles.detailsModal
            }
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            <div
              className={
                styles.modalHeader
              }
            >

              <div>

                <h2>
                  {
                    selectedBudget
                      .category?.name
                  }
                </h2>

                <p>
                  {
                    selectedBudget.month
                  }
                  /
                  {
                    selectedBudget.year
                  }
                </p>

              </div>

              <button
                type="button"
                className={
                  styles.closeButton
                }
                onClick={() =>
                  setSelectedBudget(
                    null
                  )
                }
              >
                <X size={20} />
              </button>

            </div>

            <div
              className={
                styles.detailsProgress
              }
            >

              <div
                className={
                  styles.detailsProgressTop
                }
              >

                <span>
                  Spending
                </span>

                <strong>
                  {Math.round(
                    Number(
                      selectedBudget.percentage ||
                        0
                    )
                  )}
                  %
                </strong>

              </div>

              <div
                className={
                  styles.detailsProgressTrack
                }
              >

                <div
                  className={
                    styles.detailsProgressBar
                  }
                  style={{
                    width: `${Math.min(
                      Number(
                        selectedBudget.percentage ||
                          0
                      ),
                      100
                    )}%`,
                  }}
                />

              </div>

            </div>

            <div
              className={
                styles.detailsGrid
              }
            >

              <div
                className={
                  styles.detailBox
                }
              >
                <span>
                  Budget
                </span>

                <strong>
                  {formatCurrency(
                    selectedBudget.amount
                  )}
                </strong>
              </div>

              <div
                className={
                  styles.detailBox
                }
              >
                <span>
                  Spent
                </span>

                <strong>
                  {formatCurrency(
                    selectedBudget.spent
                  )}
                </strong>
              </div>

              <div
                className={
                  styles.detailBox
                }
              >
                <span>
                  Remaining
                </span>

                <strong>
                  {formatCurrency(
                    selectedBudget.remaining
                  )}
                </strong>
              </div>

              <div
                className={
                  styles.detailBox
                }
              >
                <span>
                  Status
                </span>

                <strong>
                  {
                    selectedBudget.status ||
                    "Healthy"
                  }
                </strong>
              </div>

            </div>

            <div
              className={
                styles.detailsActions
              }
            >

              <button
                type="button"
                className={
                  styles.editButton
                }
                onClick={() =>
                  openEdit(
                    selectedBudget
                  )
                }
              >
                <Pencil size={15} />
                Edit Budget
              </button>

              <button
                type="button"
                className={
                  styles.deleteButton
                }
                onClick={() => {
                  setDeleteBudgetTarget(
                    selectedBudget
                  );
                }}
              >
                <Trash2 size={15} />
                Delete
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ======================================================
          EDIT BUDGET MODAL
      ====================================================== */}

      {editingBudget && (

        <div
          className={
            styles.modalOverlay
          }
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setEditingBudget(null);
            }
          }}
        >

          <div
            className={styles.modal}
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            <div
              className={
                styles.modalHeader
              }
            >

              <div>

                <h2>
                  Edit Budget
                </h2>

                <p>
                  Update your budget
                  amount.
                </p>

              </div>

              <button
                type="button"
                className={
                  styles.closeButton
                }
                onClick={() =>
                  setEditingBudget(null)
                }
              >
                <X size={20} />
              </button>

            </div>

            <form
              onSubmit={
                updateBudget
              }
            >

              <label>
                Category
              </label>

              <input
                className={
                  styles.formInput
                }
                value={
                  editingBudget
                    .category?.name || ""
                }
                disabled
              />

              <label>
                Budget Amount
              </label>

              <input
                className={
                  styles.formInput
                }
                type="number"
                min="1"
                step="0.01"
                value={
                  form.amount
                }
                onChange={(event) =>
                  setForm({
                    ...form,
                    amount:
                      event.target.value,
                  })
                }
                required
              />

              <button
                type="submit"
                className={
                  styles.createButton
                }
              >
                Save Changes
              </button>

            </form>

          </div>

        </div>
      )}

      {/* ======================================================
          DELETE CONFIRMATION
      ====================================================== */}

      {deleteBudgetTarget && (

        <div
          className={
            styles.modalOverlay
          }
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setDeleteBudgetTarget(
                null
              );
            }
          }}
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
              <Trash2 size={24} />
            </div>

            <h2>
              Delete Budget?
            </h2>

            <p>
              Are you sure you want
              to delete the{" "}
              <strong>
                {
                  deleteBudgetTarget
                    .category?.name ||
                  "selected"
                }
              </strong>{" "}
              budget?
            </p>

            <p
              className={
                styles.deleteWarning
              }
            >
              This action cannot be
              undone.
            </p>

            <div
              className={
                styles.deleteModalActions
              }
            >

              <button
                type="button"
                className={
                  styles.cancelDeleteButton
                }
                onClick={() =>
                  setDeleteBudgetTarget(
                    null
                  )
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className={
                  styles.confirmDeleteButton
                }
                onClick={() =>
                  deleteBudget(
                    deleteBudgetTarget
                  )
                }
              >
                <Trash2 size={15} />
                Delete Budget
              </button>

            </div>

          </div>

        </div>
      )}

      </div>
    </div>
  );
};

export default Budgets;