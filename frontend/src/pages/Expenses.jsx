import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowDownUp,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Filter,
  MoreVertical,
  Plus,
  Search,
  Trash2,
  Wallet,
  X,
} from "lucide-react";

import api from "../services/api";
import styles from "./Expenses.module.css";


/* =====================================================
   CATEGORY ICONS
===================================================== */

const categoryIcons = {
  Food: "🍔",
  Transport: "🚕",
  Shopping: "🛍️",
  "Bills & Utilities": "💡",
  "Health & Fitness": "❤️",
  Entertainment: "🎬",
  Education: "📚",
  Other: "💰",
};


/* =====================================================
   WAKU DECORATIVE DOODLES
   Visual only — does not affect expense/category logic.
===================================================== */

function WakuDoodles() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: "-45px",
          bottom: "-105px",
          width: "310px",
          height: "205px",
          background: "#FFF4CF",
          borderRadius: "62% 38% 0 0",
          transform: "rotate(-7deg)",
          opacity: 0.82,
        }}
      />

      <div
        style={{
          position: "absolute",
          right: "-55px",
          bottom: "-75px",
          width: "355px",
          height: "225px",
          background: "#DED6FF",
          borderRadius: "72% 28% 0 0",
          transform: "rotate(-8deg)",
          opacity: 0.82,
        }}
      />

      {/* Yellow upper-right doodle */}
      <div
        style={{
          position: "absolute",
          right: "55px",
          top: "92px",
          width: "125px",
          height: "82px",
          transform: "rotate(-7deg)",
        }}
      >
        <span
          style={{
            position: "absolute",
            left: "4px",
            top: "4px",
            color: "#FFBF00",
            fontSize: "15px",
            fontWeight: 700,
          }}
        >
          ✦
        </span>

        <span
          style={{
            position: "absolute",
            left: "27px",
            top: "25px",
            width: "75px",
            height: "33px",
            borderTop: "2px solid #FFBF00",
            borderRadius: "50%",
            transform: "rotate(-12deg)",
          }}
        />

        <span
          style={{
            position: "absolute",
            left: "82px",
            top: "18px",
            width: "32px",
            height: "20px",
            borderTop: "2px solid #FFBF00",
            borderRadius: "50%",
            transform: "rotate(24deg)",
          }}
        />
      </div>

      {/* Purple lower-left doodle */}
      <div
        style={{
          position: "absolute",
          left: "300px",
          bottom: "34px",
          width: "125px",
          height: "82px",
          transform: "rotate(-8deg)",
        }}
      >
        <span
          style={{
            position: "absolute",
            left: "7px",
            top: "26px",
            width: "72px",
            height: "35px",
            borderTop: "2px solid #8B6CFF",
            borderRadius: "55%",
            transform: "rotate(-15deg)",
          }}
        />

        <span
          style={{
            position: "absolute",
            left: "43px",
            top: "10px",
            width: "53px",
            height: "38px",
            borderTop: "2px solid #8B6CFF",
            borderRadius: "50%",
            transform: "rotate(18deg)",
          }}
        />

        <span
          style={{
            position: "absolute",
            right: "5px",
            top: "7px",
            color: "#FFBF00",
            fontSize: "13px",
          }}
        >
          ✦
        </span>
      </div>

      {/* Small purple sparkle — upper left of content */}
      <div
        style={{
          position: "absolute",
          left: "255px",
          top: "155px",
          color: "#8B6CFF",
          fontSize: "12px",
          transform: "rotate(18deg)",
        }}
      >
        ✦
      </div>

      {/* Yellow hand-drawn arrow — beside filters */}
      <div
        style={{
          position: "absolute",
          right: "175px",
          top: "300px",
          width: "85px",
          height: "55px",
          transform: "rotate(-10deg)",
        }}
      >
        <span
          style={{
            position: "absolute",
            left: "5px",
            top: "27px",
            width: "62px",
            borderTop: "2px solid #FFBF00",
            transform: "rotate(-8deg)",
          }}
        />
        <span
          style={{
            position: "absolute",
            right: "10px",
            top: "19px",
            width: "14px",
            height: "14px",
            borderTop: "2px solid #FFBF00",
            borderRight: "2px solid #FFBF00",
            transform: "rotate(25deg)",
          }}
        />
      </div>

      {/* Purple curved doodle — right side */}
      <div
        style={{
          position: "absolute",
          right: "30px",
          top: "430px",
          width: "90px",
          height: "75px",
          transform: "rotate(12deg)",
        }}
      >
        <span
          style={{
            position: "absolute",
            left: "12px",
            top: "15px",
            width: "55px",
            height: "38px",
            borderTop: "2px solid #8B6CFF",
            borderRadius: "50%",
            transform: "rotate(-18deg)",
          }}
        />
        <span
          style={{
            position: "absolute",
            left: "42px",
            top: "7px",
            color: "#8B6CFF",
            fontSize: "13px",
          }}
        >
          ✦
        </span>
      </div>

      {/* Tiny yellow star — around transaction area */}
      <div
        style={{
          position: "absolute",
          left: "215px",
          top: "475px",
          color: "#FFBF00",
          fontSize: "10px",
          transform: "rotate(-15deg)",
        }}
      >
        ✦
      </div>

      {/* Pink mini sparkle — lower middle */}
      <div
        style={{
          position: "absolute",
          right: "285px",
          bottom: "115px",
          color: "#FF4F91",
          fontSize: "13px",
          transform: "rotate(15deg)",
        }}
      >
        ✦
      </div>

      {/* Little yellow loop — lower right */}
      <div
        style={{
          position: "absolute",
          right: "115px",
          bottom: "150px",
          width: "58px",
          height: "32px",
          borderTop: "2px solid #FFBF00",
          borderRadius: "50%",
          transform: "rotate(-18deg)",
        }}
      />

      {/* Pink curved stroke — near bottom-right */}
      <div
        style={{
          position: "absolute",
          right: "185px",
          bottom: "72px",
          width: "55px",
          height: "25px",
          borderTop: "2px solid #FF4F91",
          borderRadius: "50%",
          transform: "rotate(22deg)",
        }}
      />

      {/* Pink lower-right star */}
      <div
        style={{
          position: "absolute",
          right: "46px",
          bottom: "34px",
          color: "#FF4F91",
          fontSize: "31px",
          lineHeight: 1,
          fontWeight: 300,
          transform: "rotate(-12deg)",
        }}
      >
        ☆
      </div>

      <div
        style={{
          position: "absolute",
          right: "255px",
          bottom: "42px",
          color: "#FFBF00",
          fontSize: "11px",
        }}
      >
        ✦
      </div>
    </div>
  );
}


/* =====================================================
   EMPTY EXPENSE FORM
===================================================== */

const emptyForm = {
  story: "",
  amount: "",
  category: "",
  payment_method: "Cash",
  expense_type: "Need",
  date: new Date().toISOString().split("T")[0],
};


function CustomDropdown({ value, options, onChange, icon, placeholder = "Select", open, setOpen }) {
  const selected = options.find((option) => String(option.value) === String(value));
  const triggerRef = useRef(null);
  const [menuStyle, setMenuStyle] = useState({});

  const updateMenuPosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const menuWidth = Math.max(rect.width, 180);
    const menuHeight = Math.min(Math.max(options.length * 48 + 14, 110), 260);
    const gap = 8;
    let left = rect.left;
    let top = rect.bottom + gap;

    if (left + menuWidth > window.innerWidth - 12) {
      left = Math.max(12, window.innerWidth - menuWidth - 12);
    }

    if (top + menuHeight > window.innerHeight - 12) {
      top = rect.top - menuHeight - gap;
    }

    if (top < 12) top = 12;

    setMenuStyle({
      position: "fixed",
      top,
      left,
      width: menuWidth,
    });
  };

  useEffect(() => {
    if (!open) return;
    updateMenuPosition();
    const handle = () => updateMenuPosition();
    window.addEventListener("resize", handle);
    window.addEventListener("scroll", handle, true);
    return () => {
      window.removeEventListener("resize", handle);
      window.removeEventListener("scroll", handle, true);
    };
  }, [open, options.length]);

  const menu = open
    ? createPortal(
        <div className={`${styles.dropdownMenu} ${styles.portalDropdownMenu}`} style={menuStyle}>
          {options.map((option) => (
            <button
              type="button"
              key={String(option.value)}
              className={`${styles.dropdownOption} ${String(option.value) === String(value) ? styles.dropdownOptionActive : ""}`}
              onClick={() => {
                onChange(option.value);
                setOpen(null);
              }}
            >
              {option.icon && <span className={styles.dropdownOptionIcon}>{option.icon}</span>}
              <span>{option.label}</span>
              {String(option.value) === String(value) && (
                <span className={styles.dropdownCheck}>✓</span>
              )}
            </button>
          ))}
        </div>,
        document.body
      )
    : null;

  return (
    <div className={styles.customDropdown}>
      <button
        ref={triggerRef}
        type="button"
        className={`${styles.dropdownTrigger} ${open ? styles.dropdownOpen : ""}`}
        onClick={() => setOpen(open ? null : true)}
      >
        {icon && <span className={styles.dropdownIcon}>{icon}</span>}
        <span className={styles.dropdownValue}>{selected?.label || placeholder}</span>
        <ChevronDown
          size={15}
          className={`${styles.dropdownChevron} ${open ? styles.dropdownChevronOpen : ""}`}
        />
      </button>
      {menu}
    </div>
  );
}

function parseDateValue(value) {
  if (!value) return null;
  const [y, m, d] = String(value).split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function formatDateValue(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDisplayDate(value) {
  if (!value) return "dd-mm-yyyy";
  const [y, m, d] = value.split("-");
  return `${d}-${m}-${y}`;
}

function CustomDatePicker({
  value,
  onChange,
  label,
  min,
  open,
  setOpen,
}) {
  const selectedDate = parseDateValue(value) || new Date();
  const minDate = parseDateValue(min);
  const dateTriggerRef = useRef(null);
  const [calendarStyle, setCalendarStyle] = useState({});

  const updateCalendarPosition = () => {
    if (!dateTriggerRef.current) return;

    const rect = dateTriggerRef.current.getBoundingClientRect();
    const width = 286;
    const height = 350;
    const gap = 8;
    const padding = 12;

    // Prefer opening directly BELOW the field.
    let left = rect.left;
    let top = rect.bottom + gap;

    // Keep the calendar inside the horizontal viewport.
    if (left + width > window.innerWidth - padding) {
      left = window.innerWidth - width - padding;
    }
    if (left < padding) left = padding;

    // Only move above if there genuinely isn't enough room below.
    if (top + height > window.innerHeight - padding) {
      const aboveTop = rect.top - height - gap;
      top = aboveTop >= padding
        ? aboveTop
        : Math.max(padding, window.innerHeight - height - padding);
    }

    setCalendarStyle({
      position: "fixed",
      top,
      left,
      width,
      zIndex: 99999,
    });
  };

  useEffect(() => {
    if (!open) return;
    updateCalendarPosition();
    const handle = () => updateCalendarPosition();
    window.addEventListener("resize", handle);
    window.addEventListener("scroll", handle, true);
    return () => {
      window.removeEventListener("resize", handle);
      window.removeEventListener("scroll", handle, true);
    };
  }, [open]);
  const [viewDate, setViewDate] = useState(
    new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
  );

  useEffect(() => {
    if (value) {
      const d = parseDateValue(value);
      if (d) setViewDate(new Date(d.getFullYear(), d.getMonth(), 1));
    }
  }, [value]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleString("en-IN", { month: "long", year: "numeric" });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const previousMonthDays = new Date(year, month, 0).getDate();
  const cells = [];

  for (let i = 0; i < 42; i += 1) {
    const dayNumber = i - firstDay + 1;
    let cellDate;
    let muted = false;

    if (dayNumber < 1) {
      const d = previousMonthDays + dayNumber;
      cellDate = new Date(year, month - 1, d);
      muted = true;
    } else if (dayNumber > daysInMonth) {
      const d = dayNumber - daysInMonth;
      cellDate = new Date(year, month + 1, d);
      muted = true;
    } else {
      cellDate = new Date(year, month, dayNumber);
    }

    cells.push({ date: cellDate, muted });
  }

  const todayValue = formatDateValue(new Date());
  const selectedValue = value || "";

  const chooseDate = (date) => {
    const nextValue = formatDateValue(date);
    if (minDate && date < minDate) return;
    onChange(nextValue);
    setOpen(false);
  };

  return (
    <div className={`${styles.customDatePicker} ${open ? styles.datePickerLayerOpen : ""}`}>
      <button
        type="button"
        ref={dateTriggerRef}
        className={`${styles.datePickerTrigger} ${open ? styles.datePickerOpen : ""}`}
        onClick={() => {
          setOpen(!open);
        }}
        aria-expanded={open}
      >
        <CalendarDays size={16} />
        <span>
          {label && <small>{label}</small>}
          <strong className={!value ? styles.datePlaceholder : ""}>
            {formatDisplayDate(value)}
          </strong>
        </span>
        <ChevronDown
          size={15}
          className={`${styles.datePickerChevron} ${open ? styles.datePickerChevronOpen : ""}`}
        />
      </button>

      {open && createPortal(
        <div
          className={`${styles.calendarPopup} ${styles.portalCalendarPopup}`}
          role="dialog"
          aria-label="Choose date"
          style={calendarStyle}
        >
          <div className={styles.calendarHeader}>
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
            >
              <ChevronLeft size={17} />
            </button>
            <strong>{monthName}</strong>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
            >
              <ChevronRight size={17} />
            </button>
          </div>

          <div className={styles.calendarWeekdays}>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <span key={day}>{day}</span>
            ))}
          </div>

          <div className={styles.calendarGrid}>
            {cells.map(({ date, muted }) => {
              const dateValue = formatDateValue(date);
              const disabled = Boolean(minDate && date < minDate);
              const selected = dateValue === selectedValue;
              const today = dateValue === todayValue;

              return (
                <button
                  key={dateValue}
                  type="button"
                  disabled={disabled}
                  className={`${styles.calendarDay} ${muted ? styles.calendarDayMuted : ""} ${selected ? styles.calendarDaySelected : ""} ${today ? styles.calendarDayToday : ""}`}
                  onClick={() => chooseDate(date)}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className={styles.calendarFooter}>
            <button type="button" onClick={() => { onChange(""); setOpen(false); }}>
              Clear
            </button>
            <button type="button" onClick={() => chooseDate(new Date())}>
              Today
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function Expenses() {

  /* =====================================================
     EXPENSE STATE
  ===================================================== */

  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);

  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [search, setSearch] = useState("");
  const [openDropdown, setOpenDropdown] = useState(null);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  /* =====================================================
     EXPENSE MODAL
  ===================================================== */

  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);


  /* =====================================================
     DELETE EXPENSE
  ===================================================== */

  const [deleteExpense, setDeleteExpense] = useState(null);
  const [deleting, setDeleting] = useState(false);


  /* =====================================================
     CATEGORY MODAL
  ===================================================== */

  const [showCategoryModal, setShowCategoryModal] =
    useState(false);

  const [editingCategory, setEditingCategory] =
    useState(null);

  const [categoryName, setCategoryName] =
    useState("");

  const [savingCategory, setSavingCategory] =
    useState(false);


  /* =====================================================
     CATEGORY MENU
  ===================================================== */

  const [categoryMenu, setCategoryMenu] =
    useState(null);


  /* =====================================================
     DELETE CATEGORY
  ===================================================== */

  const [deleteCategory, setDeleteCategory] =
    useState(null);

  const [deletingCategory, setDeletingCategory] =
    useState(false);

  const [categoryDeleteError, setCategoryDeleteError] =
    useState("");


  /* =====================================================
     FETCH EXPENSES
  ===================================================== */

  const fetchExpenses = async () => {

    try {

      setLoading(true);
      setError("");

      const response = await api.get("/expenses/");

      const expenseData = Array.isArray(response.data)
        ? response.data
        : response.data?.results || [];

setExpenses(expenseData);

if (categories.length === 0 && expenseData.length > 0) {
  const categoryMap = new Map();

  expenseData.forEach((expense) => {
    if (expense.category?.id && expense.category?.name) {
      categoryMap.set(
        expense.category.id,
        {
          id: expense.category.id,
          name: expense.category.name,
        }
      );
    }
  });

  setCategories(Array.from(categoryMap.values()));
}
    } catch (err) {

      console.error("Expenses Error:", err);

      setError(
        "Unable to load your expenses."
      );

    } finally {

      setLoading(false);

    }

  };


  /* =====================================================
     FETCH CATEGORIES
  ===================================================== */

  const fetchCategories = async () => {

    try {

      const response =
        await api.get("/categories/");

      console.log(
        "Categories API response:",
        response.data
      );

      const categoryData =
        Array.isArray(response.data)
          ? response.data
          : response.data?.results || [];

      setCategories(categoryData);

    } catch (err) {

      console.error(
        "Categories Error:",
        err
      );

      console.error(
        "Category response:",
        err.response?.data
      );

      setCategories([]);

    }

  };


  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {

    fetchExpenses();
    fetchCategories();

  }, []);


  /* =====================================================
     FILTER + SORT
  ===================================================== */

  const filteredExpenses = useMemo(() => {

    let result = [...expenses];


    /* CATEGORY */

    if (category !== "All") {

      result = result.filter(
        (expense) =>
          expense.category?.name === category
      );

    }


    /* FROM DATE */

    if (fromDate) {

      result = result.filter(
        (expense) =>
          expense.date?.split("T")[0] >=
          fromDate
      );

    }


    /* TO DATE */

    if (toDate) {

      result = result.filter(
        (expense) =>
          expense.date?.split("T")[0] <=
          toDate
      );

    }


    /* SEARCH */

    if (search.trim()) {

      const query =
        search.toLowerCase().trim();

      result = result.filter(
        (expense) =>
          expense.story
            ?.toLowerCase()
            .includes(query) ||

          expense.category?.name
            ?.toLowerCase()
            .includes(query) ||

          expense.payment_method
            ?.toLowerCase()
            .includes(query)
      );

    }


    /* SORT */

    result.sort((a, b) => {

      if (sortBy === "newest") {

        return (
          new Date(b.date) -
          new Date(a.date)
        );

      }


      if (sortBy === "oldest") {

        return (
          new Date(a.date) -
          new Date(b.date)
        );

      }


      if (sortBy === "highest") {

        return (
          Number(b.amount) -
          Number(a.amount)
        );

      }


      if (sortBy === "lowest") {

        return (
          Number(a.amount) -
          Number(b.amount)
        );

      }


      return 0;

    });


    return result;

  }, [
    expenses,
    category,
    sortBy,
    search,
    fromDate,
    toDate,
  ]);


  /* =====================================================
     TOTAL
  ===================================================== */

  const totalVisible =
    filteredExpenses.reduce(
      (sum, expense) =>
        sum + Number(expense.amount),
      0
    );


  /* =====================================================
     CLEAR DATE FILTER
  ===================================================== */

  const clearDateFilter = () => {

    setFromDate("");
    setToDate("");

  };


  /* =====================================================
     OPEN ADD EXPENSE
  ===================================================== */

  const openAddModal = () => {

    setEditingExpense(null);

    setForm({
      ...emptyForm,
      category: categories[0]?.id
        ? String(categories[0].id)
        : "",
    });

    setShowModal(true);

  };


  /* =====================================================
     OPEN EDIT EXPENSE
  ===================================================== */

  const openEditModal = (expense) => {

    setEditingExpense(expense);

    setForm({

      story: expense.story || "",

      amount: expense.amount || "",

      category: expense.category?.id
        ? String(expense.category.id)
        : "",

      payment_method:
        expense.payment_method || "Cash",

      expense_type:
        expense.expense_type || "Need",

      date: expense.date
        ? expense.date.split("T")[0]
        : new Date()
            .toISOString()
            .split("T")[0],

    });

    setShowModal(true);

  };


  /* =====================================================
     FORM CHANGE
  ===================================================== */

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


  /* =====================================================
     SAVE EXPENSE
  ===================================================== */

  const handleSubmit = async (event) => {

    event.preventDefault();


    if (
      !form.amount ||
      !form.category ||
      !form.date
    ) {

      return;

    }


    try {

      setSaving(true);


      const payload = {

        story: form.story,

        amount: Number(form.amount),

        category_id:
          Number(form.category),

        payment_method:
          form.payment_method,

        expense_type:
          form.expense_type,

        date: form.date,

      };


      if (editingExpense) {

        await api.patch(
          `/expenses/${editingExpense.id}/`,
          payload
        );

      } else {

        await api.post(
          "/expenses/",
          payload
        );

      }


      setShowModal(false);

      setEditingExpense(null);

      setForm(emptyForm);

      await fetchExpenses();

    } catch (err) {

      console.error(
        "Save Expense Error:",
        err
      );

      alert(
        err.response?.data
          ? JSON.stringify(
              err.response.data
            )
          : "Unable to save expense."
      );

    } finally {

      setSaving(false);

    }

  };


  /* =====================================================
     DELETE EXPENSE
  ===================================================== */

  const handleDeleteExpense =
    async () => {

      if (!deleteExpense) return;


      try {

        setDeleting(true);

        await api.delete(
          `/expenses/${deleteExpense.id}/`
        );

        setDeleteExpense(null);

        await fetchExpenses();

      } catch (err) {

        console.error(
          "Delete Expense Error:",
          err
        );

        alert(
          "Unable to delete this expense."
        );

      } finally {

        setDeleting(false);

      }

    };


  /* =====================================================
     GROUP BY DAY
  ===================================================== */

  const groupedExpenses =
    useMemo(() => {

      const groups = {};

      filteredExpenses.forEach(
        (expense) => {

          const key =
            expense.date?.split("T")[0];

          if (!groups[key]) {

            groups[key] = [];

          }

          groups[key].push(expense);

        }
      );

      return Object.entries(groups);

    }, [filteredExpenses]);


  /* =====================================================
     ADD CATEGORY MODAL
  ===================================================== */

  const openAddCategoryModal = () => {

    setEditingCategory(null);

    setCategoryName("");

    setShowCategoryModal(true);

  };


  /* =====================================================
     EDIT CATEGORY MODAL
  ===================================================== */

  const openEditCategoryModal =
    (item) => {

      setEditingCategory(item);

      setCategoryName(item.name);

      setCategoryMenu(null);

      setShowCategoryModal(true);

    };


  /* =====================================================
     SAVE CATEGORY
  ===================================================== */

  const handleCategorySubmit =
    async (event) => {

      event.preventDefault();


      const trimmedName =
        categoryName.trim();


      if (!trimmedName) return;


      try {

        setSavingCategory(true);


        if (editingCategory) {

          await api.patch(
            `/categories/${editingCategory.id}/`,
            {
              name: trimmedName,
            }
          );

        } else {

          await api.post(
            "/categories/",
            {
              name: trimmedName,
            }
          );

        }


        setShowCategoryModal(false);

        setEditingCategory(null);

        setCategoryName("");

        await fetchCategories();

        await fetchExpenses();

      } catch (err) {

        console.error(
          "Category Save Error:",
          err
        );

        alert(
          err.response?.data
            ? JSON.stringify(
                err.response.data
              )
            : "Unable to save category."
        );

      } finally {

        setSavingCategory(false);

      }

    };


  /* =====================================================
     OPEN DELETE CATEGORY
  ===================================================== */

  const openDeleteCategory =
    (item) => {

      setCategoryMenu(null);

      setCategoryDeleteError("");

      setDeleteCategory(item);

    };


  /* =====================================================
     DELETE CATEGORY
  ===================================================== */

  const handleDeleteCategory =
    async () => {

      if (!deleteCategory) return;


      try {

        setDeletingCategory(true);

        setCategoryDeleteError("");


        await api.delete(
          `/categories/${deleteCategory.id}/`
        );


        setDeleteCategory(null);

        await fetchCategories();

        await fetchExpenses();

      } catch (err) {

        console.error(
          "Delete Category Error:",
          err
        );


        setCategoryDeleteError(
          "This category is being used by existing expenses and cannot be deleted."
        );

      } finally {

        setDeletingCategory(false);

      }

    };


  /* =====================================================
     RENDER
  ===================================================== */

  return (

    <section
      className={styles.page}
      style={{
        position: "relative",
        overflow: "hidden",
        isolation: "isolate",
      }}
    >

      <WakuDoodles />

      <div style={{ position: "relative", zIndex: 1 }}>


      {/* =================================================
          HERO
      ================================================= */}

      <div className={styles.hero}>

        <div>

          <p className={styles.eyebrow}>
            EVERY RUPEE HAS A STORY
          </p>

          <h1>
            My Expenses
          </h1>

          <p className={styles.subtitle}>
            Understand where your money goes,
            one story at a time.
          </p>

        </div>


        <div className={styles.heroActions}>

          <div className={styles.walletCard}>

            <Wallet size={20} />

            <div>

              <span>
                Showing
              </span>

              <strong>
                ₹{totalVisible.toFixed(2)}
              </strong>

            </div>

          </div>


          <button
            type="button"
            className={styles.addButton}
            onClick={openAddModal}
          >

            <Plus size={17} />

            Add Expense

          </button>

        </div>

      </div>


      {/* =================================================
          SEARCH + DATE + SORT
      ================================================= */}

      <div className={styles.filterCard}>


        {/* SEARCH */}

        <div className={styles.searchBox}>

          <Search size={17} />

          <input
            type="text"
            placeholder="Search your expenses..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />

        </div>


        {/* FROM DATE */}
        <div className={styles.dateFilter}>
          <CustomDatePicker
            value={fromDate}
            onChange={setFromDate}
            label="From"
            open={openDropdown === "from-date"}
            setOpen={(state) =>
              setOpenDropdown(state ? "from-date" : null)
            }
          />
        </div>

        {/* TO DATE */}
        <div className={styles.dateFilter}>
          <CustomDatePicker
            value={toDate}
            onChange={setToDate}
            label="To"
            min={fromDate || undefined}
            open={openDropdown === "to-date"}
            setOpen={(state) =>
              setOpenDropdown(state ? "to-date" : null)
            }
          />
        </div>


        {/* SORT */}

        <div className={styles.sortBox}>
          <CustomDropdown
            value={sortBy}
            open={openDropdown === "sort"}
            setOpen={(state) => setOpenDropdown(state ? "sort" : null)}
            onChange={setSortBy}
            icon={<ArrowDownUp size={16} />}
            options={[
              { value: "newest", label: "Newest first" },
              { value: "oldest", label: "Oldest first" },
              { value: "highest", label: "Highest amount" },
              { value: "lowest", label: "Lowest amount" },
            ]}
          />
        </div>

      </div>


      {/* =================================================
          ACTIVE DATE FILTER
      ================================================= */}

      {(fromDate || toDate) && (

        <div
          className={
            styles.activeDateFilter
          }
        >

          <CalendarDays size={14} />

          <span>

            {fromDate || "Any date"}

            {" → "}

            {toDate || "Any date"}

          </span>

          <button
            type="button"
            onClick={clearDateFilter}
            title="Clear date filter"
          >

            <X size={13} />

          </button>

        </div>

      )}


      {/* =================================================
          CATEGORY FILTER
      ================================================= */}

      <div
        className={
          styles.categorySection
        }
      >

        <div
          className={
            styles.categoryHeader
          }
        >

          <div
            className={
              styles.sectionLabel
            }
          >

            <Filter size={15} />

            <span>
              Filter by category
            </span>

          </div>


          <button
            type="button"
            className={
              styles.addCategoryButton
            }
            onClick={
              openAddCategoryModal
            }
          >

            <Plus size={14} />

            Add Category

          </button>

        </div>


        <div
          className={
            styles.categoryList
          }
        >


          {/* ALL */}

          <button
            type="button"
            className={`${styles.categoryChip} ${
              category === "All"
                ? styles.activeChip
                : ""
            }`}
            onClick={() =>
              setCategory("All")
            }
          >

            All

          </button>


          {/* DATABASE CATEGORIES */}

          {categories.length > 0 ? (

            categories.map(
              (item) => (

                <div
                  key={item.id}
                  className={
                    styles.categoryWrapper
                  }
                >

                  <button
                    type="button"
                    className={`${styles.categoryChip} ${
                      category === item.name
                        ? styles.activeChip
                        : ""
                    }`}
                    onClick={() =>
                      setCategory(
                        item.name
                      )
                    }
                  >

                    {categoryIcons[
                      item.name
                    ] || "💰"}

                    {item.name}

                  </button>


                  {/* THREE DOTS */}

                  <button
                    type="button"
                    className={
                      styles.categoryMenuButton
                    }
                    title="Category options"
                    onClick={(event) => {

                      event.stopPropagation();

                      setCategoryMenu(
                        categoryMenu ===
                          item.id
                          ? null
                          : item.id
                      );

                    }}
                  >

                    <MoreVertical
                      size={14}
                    />

                  </button>


                  {/* CATEGORY MENU */}

                  {categoryMenu ===
                    item.id && (

                    <div
                      className={
                        styles.categoryMenu
                      }
                      onClick={(event) =>
                        event.stopPropagation()
                      }
                    >

                      <button
                        type="button"
                        onClick={() =>
                          openEditCategoryModal(
                            item
                          )
                        }
                      >

                        <Edit3 size={14} />

                        Edit category

                      </button>


                      <button
                        type="button"
                        className={
                          styles.categoryDeleteOption
                        }
                        onClick={() =>
                          openDeleteCategory(
                            item
                          )
                        }
                      >

                        <Trash2
                          size={14}
                        />

                        Delete category

                      </button>

                    </div>

                  )}

                </div>

              )

            )

          ) : (

            <span
              style={{
                fontSize: "13px",
                color: "#888",
                padding: "8px 0",
              }}
            >

              No categories found

            </span>

          )}

        </div>

      </div>


      {/* =================================================
          RESULTS HEADER
      ================================================= */}

      <div
        className={
          styles.resultHeader
        }
      >

        <div>

          <h2>
            Transactions
          </h2>

          <span>

            {filteredExpenses.length}{" "}

            {filteredExpenses.length === 1
              ? "expense"
              : "expenses"}

          </span>

        </div>


        {(category !== "All" ||
          fromDate ||
          toDate) && (

          <button
            type="button"
            className={
              styles.clearButton
            }
            onClick={() => {

              setCategory("All");

              clearDateFilter();

            }}
          >

            Clear filters

          </button>

        )}

      </div>


      {/* =================================================
          LOADING
      ================================================= */}

      {loading && (

        <div
          className={
            styles.emptyState
          }
        >

          Loading your expenses...

        </div>

      )}


      {/* =================================================
          ERROR
      ================================================= */}

      {!loading && error && (

        <div
          className={
            styles.emptyState
          }
        >

          <strong>
            Something went wrong
          </strong>

          <p>
            {error}
          </p>

          <button
            type="button"
            onClick={
              fetchExpenses
            }
          >

            Try again

          </button>

        </div>

      )}


      {/* =================================================
          EMPTY
      ================================================= */}

      {!loading &&
        !error &&
        filteredExpenses.length === 0 && (

          <div
            className={
              styles.emptyState
            }
          >

            <div
              className={
                styles.emptyIcon
              }
            >
              🪙
            </div>

            <h3>
              No expenses found
            </h3>

            <p>

              {search ||
                category !== "All" ||
                fromDate ||
                toDate

                ? "Try changing your filters or search."

                : "Start by adding your first expense."}

            </p>


            {!search &&
              category === "All" &&
              !fromDate &&
              !toDate && (

              <button
                type="button"
                onClick={
                  openAddModal
                }
              >

                Add your first expense

              </button>

            )}

          </div>

        )}


      {/* =================================================
          DAY-WISE EXPENSES
      ================================================= */}

      {!loading &&
        !error &&
        filteredExpenses.length > 0 && (

        <div
          className={
            styles.dayGroups
          }
        >

          {groupedExpenses.map(
            ([date, dayExpenses]) => {

              const dayTotal =
                dayExpenses.reduce(
                  (
                    sum,
                    expense
                  ) =>
                    sum +
                    Number(
                      expense.amount
                    ),
                  0
                );


              return (

                <div
                  className={
                    styles.dayGroup
                  }
                  key={date}
                >

                  <div
                    className={
                      styles.dayHeader
                    }
                  >

                    <div>

                      <h3>

                        {new Date(
                          date
                        ).toLocaleDateString(
                          "en-IN",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          }
                        )}

                      </h3>

                      <span>

                        {dayExpenses.length}{" "}

                        {dayExpenses.length ===
                        1
                          ? "transaction"
                          : "transactions"}

                      </span>

                    </div>


                    <strong
                      className={
                        styles.dayTotal
                      }
                    >

                      ₹
                      {dayTotal.toFixed(
                        2
                      )}

                    </strong>

                  </div>


                  <div
                    className={
                      styles.expenseList
                    }
                  >

                    {dayExpenses.map(
                      (expense) => {

                        const categoryName =
                          expense
                            .category
                            ?.name ||
                          "Other";


                        return (

                          <article
                            className={
                              styles.expenseCard
                            }
                            key={
                              expense.id
                            }
                          >


                            {/* ICON */}

                            <div
                              className={
                                styles.expenseIcon
                              }
                            >

                              {categoryIcons[
                                categoryName
                              ] || "💰"}

                            </div>


                            {/* INFO */}

                            <div
                              className={
                                styles.expenseInfo
                              }
                            >

                              <h3>

                                {expense.story ||
                                  categoryName}

                              </h3>

                              <p>

                                {categoryName}

                                {" · "}

                                {
                                  expense.payment_method
                                }

                              </p>

                              <span>

                                {new Date(
                                  expense.date
                                ).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                  }
                                )}

                              </span>

                            </div>


                            {/* AMOUNT */}

                            <div
                              className={
                                styles.expenseAmount
                              }
                            >

                              <strong>

                                -₹
                                {Number(
                                  expense.amount
                                ).toFixed(
                                  2
                                )}

                              </strong>

                              <small>

                                {expense.expense_type ===
                                "Want"
                                  ? "Want"
                                  : "Need"}

                              </small>

                            </div>


                            {/* ACTIONS */}

                            <div
                              className={
                                styles.expenseActions
                              }
                            >

                              <button
                                type="button"
                                title="Edit expense"
                                onClick={() =>
                                  openEditModal(
                                    expense
                                  )
                                }
                              >

                                <Edit3
                                  size={15}
                                />

                              </button>


                              <button
                                type="button"
                                title="Delete expense"
                                onClick={() =>
                                  setDeleteExpense(
                                    expense
                                  )
                                }
                              >

                                <Trash2
                                  size={15}
                                />

                              </button>

                            </div>

                          </article>

                        );

                      }
                    )}

                  </div>

                </div>

              );

            }
          )}

        </div>

      )}


      {/* =================================================
          ADD / EDIT EXPENSE MODAL
      ================================================= */}

      {showModal && (

        <div
          className={
            styles.modalOverlay
          }
          onMouseDown={() =>
            setShowModal(false)
          }
        >

          <div
            className={
              styles.modal
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

                <span
                  className={
                    styles.modalEyebrow
                  }
                >

                  {editingExpense
                    ? "UPDATE YOUR STORY"
                    : "NEW EXPENSE"}

                </span>

                <h2>

                  {editingExpense
                    ? "Edit Expense"
                    : "Add Expense"}

                </h2>

              </div>


              <button
                type="button"
                className={
                  styles.closeButton
                }
                onClick={() =>
                  setShowModal(false)
                }
              >

                <X size={18} />

              </button>

            </div>


            <form
              className={
                styles.expenseForm
              }
              onSubmit={
                handleSubmit
              }
            >


              {/* STORY */}

              <label>

                What did you spend on?

                <input
                  name="story"
                  type="text"
                  placeholder="e.g. Dinner with friends"
                  value={
                    form.story
                  }
                  onChange={
                    handleChange
                  }
                />

              </label>


              {/* AMOUNT */}

              <label>

                Amount

                <div
                  className={
                    styles.amountInput
                  }
                >

                  <span>
                    ₹
                  </span>

                  <input
                    name="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={
                      form.amount
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />

                </div>

              </label>


              {/* CATEGORY */}

              <label>

                Category

                <div className={styles.selectWrapper}>
                  <CustomDropdown
                    value={form.category}
                    open={openDropdown === "expense-category"}
                    setOpen={(state) => setOpenDropdown(state ? "expense-category" : null)}
                    onChange={(value) => setForm((previous) => ({ ...previous, category: value }))}
                    placeholder="Select category"
                    options={categories.map((item) => ({
                      value: String(item.id),
                      label: item.name,
                      icon: categoryIcons[item.name] || "💰",
                    }))}
                  />
                </div>

              </label>


              {/* PAYMENT + TYPE */}

              <div
                className={
                  styles.formRow
                }
              >

                <label>

                  Payment method

                  <div className={styles.selectWrapper}>
                    <CustomDropdown
                      value={form.payment_method}
                      open={openDropdown === "payment"}
                      setOpen={(state) => setOpenDropdown(state ? "payment" : null)}
                      onChange={(value) => setForm((previous) => ({ ...previous, payment_method: value }))}
                      options={[
                        { value: "Cash", label: "Cash", icon: "💵" },
                        { value: "UPI", label: "UPI", icon: "📱" },
                        { value: "Card", label: "Card", icon: "💳" },
                        { value: "Bank Transfer", label: "Bank Transfer", icon: "🏦" },
                      ]}
                    />
                  </div>

                </label>


                <label>

                  Type

                  <div className={styles.selectWrapper}>
                    <CustomDropdown
                      value={form.expense_type}
                      open={openDropdown === "expense-type"}
                      setOpen={(state) => setOpenDropdown(state ? "expense-type" : null)}
                      onChange={(value) => setForm((previous) => ({ ...previous, expense_type: value }))}
                      options={[
                        { value: "Need", label: "Need", icon: "✓" },
                        { value: "Want", label: "Want", icon: "♡" },
                      ]}
                    />
                  </div>

                </label>

              </div>


              {/* DATE */}
              <label>
                Date
                <CustomDatePicker
                  value={form.date}
                  onChange={(value) =>
                    setForm((previous) => ({
                      ...previous,
                      date: value,
                    }))
                  }
                  open={openDropdown === "expense-date"}
                  setOpen={(state) =>
                    setOpenDropdown(state ? "expense-date" : null)
                  }
                />
              </label>


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
                  onClick={() =>
                    setShowModal(false)
                  }
                >

                  Cancel

                </button>


                <button
                  type="submit"
                  className={
                    styles.saveButton
                  }
                  disabled={saving}
                >

                  {saving
                    ? "Saving..."
                    : editingExpense
                    ? "Save Changes"
                    : "Add Expense"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* =================================================
          DELETE EXPENSE MODAL
      ================================================= */}

      {deleteExpense && (

        <div
          className={
            styles.modalOverlay
          }
          onMouseDown={() =>
            setDeleteExpense(null)
          }
        >

          <div
            className={`${styles.modal} ${styles.deleteModal}`}
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            <div
              className={
                styles.deleteIcon
              }
            >

              <Trash2 size={22} />

            </div>


            <h2>
              Delete this expense?
            </h2>


            <p>

              Are you sure you want to delete{" "}

              <strong>

                {deleteExpense.story ||
                  deleteExpense
                    .category
                    ?.name ||
                  "this expense"}

              </strong>

              ? This action cannot be undone.

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
                  setDeleteExpense(null)
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
                  handleDeleteExpense
                }
                disabled={deleting}
              >

                {deleting
                  ? "Deleting..."
                  : "Yes, Delete"}

              </button>

            </div>

          </div>

        </div>

      )}


      {/* =================================================
          ADD / EDIT CATEGORY MODAL
      ================================================= */}

      {showCategoryModal && (

        <div
          className={
            styles.modalOverlay
          }
          onMouseDown={() =>
            setShowCategoryModal(
              false
            )
          }
        >

          <div
            className={`${styles.modal} ${styles.categoryModal}`}
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

                <span
                  className={
                    styles.modalEyebrow
                  }
                >

                  {editingCategory
                    ? "UPDATE CATEGORY"
                    : "NEW CATEGORY"}

                </span>


                <h2>

                  {editingCategory
                    ? "Edit Category"
                    : "Add Category"}

                </h2>

              </div>


              <button
                type="button"
                className={
                  styles.closeButton
                }
                onClick={() =>
                  setShowCategoryModal(
                    false
                  )
                }
              >

                <X size={18} />

              </button>

            </div>


            <form
              className={
                styles.categoryForm
              }
              onSubmit={
                handleCategorySubmit
              }
            >

              <label>

                Category name

                <input
                  type="text"
                  placeholder="e.g. Subscriptions"
                  value={
                    categoryName
                  }
                  onChange={(event) =>
                    setCategoryName(
                      event.target.value
                    )
                  }
                  autoFocus
                  required
                />

              </label>


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
                    setShowCategoryModal(
                      false
                    )
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
                    savingCategory
                  }
                >

                  {savingCategory
                    ? "Saving..."
                    : editingCategory
                    ? "Save Changes"
                    : "Add Category"}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}


      {/* =================================================
          DELETE CATEGORY MODAL
      ================================================= */}

      {deleteCategory && (

        <div
          className={
            styles.modalOverlay
          }
          onMouseDown={() => {

            if (!deletingCategory) {

              setDeleteCategory(null);

              setCategoryDeleteError("");

            }

          }}
        >

          <div
            className={`${styles.modal} ${styles.deleteModal}`}
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >

            <div
              className={
                styles.deleteIcon
              }
            >

              <Trash2 size={22} />

            </div>


            <h2>

              {categoryDeleteError
                ? "Category can't be deleted"
                : "Delete category?"}

            </h2>


            {!categoryDeleteError && (

              <p>

                Are you sure you want to delete{" "}

                <strong>
                  {deleteCategory.name}
                </strong>

                ?

              </p>

            )}


            {!categoryDeleteError && (

              <p
                className={
                  styles.deleteWarning
                }
              >

                If this category is already
                being used by an expense,
                it cannot be deleted.

              </p>

            )}


            {categoryDeleteError && (

              <div
                className={
                  styles.categoryDeleteError
                }
              >

                <div
                  className={
                    styles.categoryDeleteErrorIcon
                  }
                >
                  !
                </div>


                <div>

                  <strong>
                    Category can't be deleted
                  </strong>

                  <p>
                    {categoryDeleteError}
                  </p>

                </div>

              </div>

            )}


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
                onClick={() => {

                  setDeleteCategory(
                    null
                  );

                  setCategoryDeleteError(
                    ""
                  );

                }}
              >

                {categoryDeleteError
                  ? "Close"
                  : "Cancel"}

              </button>


              {!categoryDeleteError && (

                <button
                  type="button"
                  className={
                    styles.deleteButton
                  }
                  onClick={
                    handleDeleteCategory
                  }
                  disabled={
                    deletingCategory
                  }
                >

                  {deletingCategory
                    ? "Deleting..."
                    : "Yes, Delete"}

                </button>

              )}

            </div>

          </div>

        </div>

      )}

      </div>

    </section>

  );

}


export default Expenses;