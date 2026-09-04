import {
  AlertTriangle,
  CheckCircle2,
  CircleDollarSign,
  Lightbulb,
  Target,
  WalletCards,
} from "lucide-react";


/* =========================================================
   CURRENCY
========================================================= */

export const formatCurrency = (value) => {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};


/* =========================================================
   DATE
========================================================= */

const getDate = (value) => {
  if (!value) {
    return new Date();
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? new Date()
    : date;
};


const getTimeLabel = (dateValue) => {
  const date = getDate(dateValue);

  const now = new Date();

  const diff =
    now.getTime() - date.getTime();

  const minutes =
    Math.floor(diff / 60000);

  const hours =
    Math.floor(diff / 3600000);

  const days =
    Math.floor(diff / 86400000);


  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} min ago`;
  }

  if (hours < 24) {
    return `${hours} hr ago`;
  }

  if (days === 1) {
    return "Yesterday";
  }

  if (days < 7) {
    return `${days} days ago`;
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
    }
  );
};


/* =========================================================
   UNIQUE ID
========================================================= */

const makeId = (
  prefix,
  value
) => {
  return `${prefix}-${String(value)}`;
};


/* =========================================================
   BUILD NOTIFICATIONS
========================================================= */

export const buildNotifications = (
  expenses = [],
  budgets = [],
  goals = []
) => {
  const notifications = [];

  const now = new Date();

  const currentMonth =
    now.getMonth() + 1;

  const currentYear =
    now.getFullYear();


  /* =====================================================
     CURRENT MONTH EXPENSES
  ===================================================== */

  const currentMonthExpenses =
    expenses.filter((expense) => {
      if (!expense?.date) {
        return false;
      }

      const date =
        getDate(expense.date);

      return (
        date.getMonth() + 1 ===
          currentMonth &&
        date.getFullYear() ===
          currentYear
      );
    });


  const totalSpending =
    currentMonthExpenses.reduce(
      (sum, expense) =>
        sum +
        Number(
          expense?.amount || 0
        ),
      0
    );


  /* =====================================================
     BUDGET SIGNALS
  ===================================================== */

  budgets
    .filter(
      (budget) =>
        Number(budget?.month) ===
          currentMonth &&
        Number(budget?.year) ===
          currentYear
    )
    .forEach((budget) => {

      const amount =
        Number(budget?.amount || 0);

      const spent =
        Number(budget?.spent || 0);

      if (amount <= 0) {
        return;
      }

      const percentage =
        (spent / amount) * 100;

      const category =
        budget?.category?.name ||
        "your category";


      if (percentage >= 100) {

        notifications.push({
          id: makeId(
            "budget-over",
            budget.id
          ),

          type: "alert",

          title:
            `${category} budget reached`,

          message:
            `You've used ${formatCurrency(
              spent
            )} of your ${formatCurrency(
              amount
            )} budget.`,

          detail:
            "Consider slowing down spending",

          time: "This month",

          icon: AlertTriangle,
        });

        return;
      }


      if (percentage >= 80) {

        notifications.push({
          id: makeId(
            "budget-warning",
            budget.id
          ),

          type: "warning",

          title:
            `${category} budget is getting close`,

          message:
            `You've used ${percentage.toFixed(
              0
            )}% of this month's budget.`,

          detail:
            `${formatCurrency(
              Math.max(
                amount - spent,
                0
              )
            )} remaining`,

          time: "This month",

          icon: WalletCards,
        });
      }
    });


  /* =====================================================
     RECENT HIGH EXPENSE
  ===================================================== */

  const sortedExpenses =
    [...expenses]
      .filter(
        (expense) =>
          expense?.date
      )
      .sort(
        (a, b) =>
          getDate(b.date) -
          getDate(a.date)
      );


  const latestExpense =
    sortedExpenses[0];


  if (latestExpense) {

    const amount =
      Number(
        latestExpense.amount || 0
      );

    const category =
      latestExpense.category?.name ||
      "Other";


    if (amount >= 5000) {

      notifications.push({
        id: makeId(
          "expense",
          latestExpense.id
        ),

        type: "warning",

        title:
          "A bigger expense was recorded",

        message:
          `${formatCurrency(
            amount
          )} was added under ${category}.`,

        detail:
          latestExpense.story ||
          "Keep an eye on larger purchases",

        time:
          getTimeLabel(
            latestExpense.date
          ),

        icon: CircleDollarSign,
      });
    }
  }


  /* =====================================================
     GOAL SIGNALS
  ===================================================== */

  goals.forEach((goal) => {

    const target =
      Number(
        goal?.target_amount || 0
      );

    const current =
      Number(
        goal?.current_amount || 0
      );


    if (target <= 0) {
      return;
    }


    const progress =
      Math.min(
        100,
        (current / target) * 100
      );


    if (progress >= 100) {

      notifications.push({
        id: makeId(
          "goal-complete",
          goal.id
        ),

        type: "positive",

        title:
          `${goal.name || "Goal"} completed`,

        message:
          `You've reached your ${formatCurrency(
            target
          )} target.`,

        detail:
          "That's a great money milestone",

        time: "Goal progress",

        icon: CheckCircle2,
      });

      return;
    }


    if (progress >= 50) {

      notifications.push({
        id: makeId(
          "goal-progress",
          goal.id
        ),

        type: "positive",

        title:
          `${goal.name || "Your goal"} is making progress`,

        message:
          `You're ${progress.toFixed(
            0
          )}% of the way there.`,

        detail:
          `${formatCurrency(
            Math.max(
              target - current,
              0
            )
          )} remaining`,

        time: "Goal progress",

        icon: Target,
      });
    }
  });


  /* =====================================================
     MONTHLY SPENDING INSIGHT
  ===================================================== */

  if (
    currentMonthExpenses.length > 0 &&
    totalSpending > 0
  ) {

    const categoryTotals = {};


    currentMonthExpenses.forEach(
      (expense) => {

        const category =
          expense?.category?.name ||
          "Other";

        categoryTotals[category] =
          (categoryTotals[category] || 0) +
          Number(
            expense?.amount || 0
          );
      }
    );


    const topCategory =
      Object.entries(
        categoryTotals
      ).sort(
        (a, b) =>
          b[1] - a[1]
      )[0];


    if (topCategory) {

      notifications.push({
        id:
          `insight-${currentYear}-${currentMonth}-${topCategory[0]}`,

        type: "insight",

        title:
          `${topCategory[0]} is your biggest spending area`,

        message:
          `${formatCurrency(
            topCategory[1]
          )} of your spending is going toward ${topCategory[0]}.`,

        detail:
          "A useful pattern to keep an eye on",

        time: "Monthly insight",

        icon: Lightbulb,
      });
    }
  }


  /* =====================================================
     SORT
  ===================================================== */

  return notifications.sort(
    (a, b) => {

      const priority = {
        alert: 1,
        warning: 2,
        positive: 3,
        insight: 4,
        default: 5,
      };

      return (
        (priority[a.type] || 5) -
        (priority[b.type] || 5)
      );
    }
  );
};