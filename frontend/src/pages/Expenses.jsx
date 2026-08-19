import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownUp,
  ChevronDown,
  Filter,
  Search,
  TrendingDown,
  Wallet,
} from "lucide-react";

import api from "../services/api";
import styles from "./Expenses.module.css";

const categories = [
  "All",
  "Food",
  "Transport",
  "Shopping",
  "Bills & Utilities",
  "Health & Fitness",
  "Entertainment",
  "Education",
  "Other",
];

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

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/expenses/");

      setExpenses(response.data);
    } catch (err) {
      console.error("Expenses Error:", err);
      setError("Unable to load your expenses.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const filteredExpenses = useMemo(() => {
    let result = [...expenses];

    // Category filter
    if (category !== "All") {
      result = result.filter(
        (expense) => expense.category?.name === category
      );
    }

    // Search
    if (search.trim()) {
      const query = search.toLowerCase();

      result = result.filter(
        (expense) =>
          expense.story?.toLowerCase().includes(query) ||
          expense.category?.name?.toLowerCase().includes(query) ||
          expense.payment_method?.toLowerCase().includes(query)
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.date) - new Date(a.date);
      }

      if (sortBy === "oldest") {
        return new Date(a.date) - new Date(b.date);
      }

      if (sortBy === "highest") {
        return Number(b.amount) - Number(a.amount);
      }

      if (sortBy === "lowest") {
        return Number(a.amount) - Number(b.amount);
      }

      return 0;
    });

    return result;
  }, [expenses, category, sortBy, search]);

  const totalVisible = filteredExpenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );

  return (
    <section className={styles.page}>
      {/* Header */}
      <div className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>
            EVERY RUPEE HAS A STORY
          </p>

          <h1>My Expenses</h1>

          <p className={styles.subtitle}>
            Understand where your money goes, one story at a time.
          </p>
        </div>

        <div className={styles.walletCard}>
          <Wallet size={20} />

          <div>
            <span>Showing</span>
            <strong>₹{totalVisible.toFixed(2)}</strong>
          </div>
        </div>
      </div>

      {/* Search + Sort */}
      <div className={styles.filterCard}>
        <div className={styles.searchBox}>
          <Search size={18} />

          <input
            type="text"
            placeholder="Search your expenses..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className={styles.sortBox}>
          <ArrowDownUp size={17} />

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="highest">Highest amount</option>
            <option value="lowest">Lowest amount</option>
          </select>

          <ChevronDown size={16} />
        </div>
      </div>

      {/* Category Filters */}
      <div className={styles.categorySection}>
        <div className={styles.sectionLabel}>
          <Filter size={16} />
          <span>Filter by category</span>
        </div>

        <div className={styles.categoryList}>
          {categories.map((item) => (
            <button
              key={item}
              className={`${styles.categoryChip} ${
                category === item ? styles.activeChip : ""
              }`}
              onClick={() => setCategory(item)}
            >
              {item !== "All" && categoryIcons[item]}
              {item}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className={styles.resultHeader}>
        <div>
          <h2>Transactions</h2>

          <span>
            {filteredExpenses.length}{" "}
            {filteredExpenses.length === 1
              ? "expense"
              : "expenses"}
          </span>
        </div>

        {category !== "All" && (
          <button
            className={styles.clearButton}
            onClick={() => setCategory("All")}
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className={styles.emptyState}>
          Loading your expenses...
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className={styles.emptyState}>
          <strong>Something went wrong</strong>

          <p>{error}</p>

          <button onClick={fetchExpenses}>
            Try again
          </button>
        </div>
      )}

      {/* Empty */}
      {!loading &&
        !error &&
        filteredExpenses.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🪙</div>

            <h3>No expenses found</h3>

            <p>
              {search || category !== "All"
                ? "Try changing your filters or search."
                : "Your expense stories will appear here."}
            </p>
          </div>
        )}

      {/* Expense List */}
      {!loading &&
        !error &&
        filteredExpenses.length > 0 && (
          <div className={styles.expenseList}>
            {filteredExpenses.map((expense) => {
              const categoryName =
                expense.category?.name || "Other";

              return (
                <article
                  className={styles.expenseCard}
                  key={expense.id}
                >
                  <div className={styles.expenseIcon}>
                    {categoryIcons[categoryName] || "💰"}
                  </div>

                  <div className={styles.expenseInfo}>
                    <h3>
                      {expense.story || categoryName}
                    </h3>

                    <p>
                      {categoryName} ·{" "}
                      {expense.payment_method}
                    </p>

                    <span>
                      {new Date(
                        expense.date
                      ).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <div className={styles.expenseAmount}>
                    <strong>
                      -₹{Number(expense.amount).toFixed(2)}
                    </strong>

                    <small>
                      {expense.expense_type === "Want"
                        ? "Want"
                        : "Need"}
                    </small>
                  </div>
                </article>
              );
            })}
          </div>
        )}

      {/* Spending Quest */}
      {!loading &&
        !error &&
        filteredExpenses.length > 0 && (
          <div className={styles.questCard}>
            <div className={styles.questIcon}>
              <TrendingDown size={22} />
            </div>

            <div>
              <strong>Spending Quest 🎯</strong>

              <p>
                You've reviewed{" "}
                {filteredExpenses.length}{" "}
                {filteredExpenses.length === 1
                  ? "expense"
                  : "expenses"}{" "}
                in this view.
              </p>
            </div>
          </div>
        )}
    </section>
  );
}

export default Expenses;