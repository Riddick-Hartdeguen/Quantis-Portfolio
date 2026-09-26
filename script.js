
// ===== Commun =====

// --- Montants ---
// Stockés en centimes entiers pour éviter les erreurs d'arrondi des nombres à virgule

function formatAmount(cents) {
    return (cents / 100).toFixed(2).replace(".", ",");
}

const toCents = (amount) => {
    return Math.round(Number(amount) * 100);
};

// --- Ligne de liste (charges et opérations) ---

const createListRow = (name, date, amount, list, emptyMessage, onDelete, type, onEdit) => {
    const row = document.createElement("li");
    row.classList.add("list-row");

    const nameSpan = document.createElement("span");
    nameSpan.textContent = name;
    row.appendChild(nameSpan);

    const dateSpan = document.createElement("span");
    dateSpan.textContent = date;
    row.appendChild(dateSpan);

    const amountSpan = document.createElement("span");
    if (type === "income") {
        amountSpan.classList.add("income-amount");
        amountSpan.textContent = `+ ${formatAmount(amount)} €`;
    } else if (type === "expense") {
        amountSpan.classList.add("expense-amount");
        amountSpan.textContent = `- ${formatAmount(amount)} €`;
    } else {
        amountSpan.textContent = `${formatAmount(amount)} €`;
    }
    row.appendChild(amountSpan);

    const editButton = document.createElement("button");
    editButton.textContent = "✏️";
    row.appendChild(editButton);

    editButton.addEventListener("click", function () {
        onEdit();
    });

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "🗑️";
    row.appendChild(deleteButton);

    deleteButton.addEventListener("click", function () {
        row.remove();
        onDelete();
        if (list.children.length === 0) {
            emptyMessage.style.display = "block";
        }
        calculateBalance();
    });
    list.appendChild(row);
    emptyMessage.style.display = "none";
    calculateBalance();
};

// --- Solde et tableau de bord ---

const balanceDisplay = document.getElementById("current-balance");
const totalIncomeDisplay = document.getElementById("total-income");
const totalExpensesDisplay = document.getElementById("total-expenses");
const progressFill = document.getElementById("progress-fill");
const budgetPercentageDisplay = document.getElementById("budget-percentage");
let balance = 0;

const calculateBalance = () => {
    totalExpensesDisplay.textContent = `${formatAmount(totalFixedExpenses + totalOtherExpenses)} €`;
    totalIncomeDisplay.textContent = `${formatAmount(salary + totalOtherIncome)} €`;
    balance = (salary + totalOtherIncome) - (totalFixedExpenses + totalOtherExpenses);
    balanceDisplay.textContent = balance < 0 ? `- ${formatAmount(balance * -1)} €` : `${formatAmount(balance)} €`;
    if (balance > 0) {
        balanceDisplay.style.color = "green";
    } else if (balance < 0) {
        balanceDisplay.style.color = "red";
    } else {
        balanceDisplay.style.color = "white";
    }

    // Part du salaire entamée : 0 % tant que le solde dépasse le salaire
    const budgetPercentage = salary > 0 ? Math.max(0, Math.min(100, (salary - balance) / salary * 100)) : 0;
    progressFill.style.width = `${budgetPercentage}%`;
    budgetPercentageDisplay.textContent = `${Math.round(budgetPercentage)} %`;

    localStorage.setItem("salary", JSON.stringify(salary));
    localStorage.setItem("fixedExpenses", JSON.stringify(fixedExpenses));
    localStorage.setItem("transactions", JSON.stringify(transactions));
};

// --- Hauteur des listes ---

const fixedExpensesCard = document.getElementById("fixed-expenses-card");
const recentTransactionsCard = document.getElementById("recent-transactions-card");

// Marges en rem, variables selon l'écran : on lit les valeurs réelles
const getMarginsBelowCard = (card) => {
    return parseFloat(getComputedStyle(card).marginBottom) + parseFloat(getComputedStyle(document.querySelector("main")).marginBottom);
};

const adjustListHeight = (list, card) => {
    const rect = list.getBoundingClientRect();
    const cardStyle = getComputedStyle(card);
    const spaceBelowList = parseFloat(cardStyle.paddingBottom) + parseFloat(cardStyle.borderBottomWidth) + getMarginsBelowCard(card);
    const availableSpace = window.innerHeight - rect.top - spaceBelowList;
    list.style.maxHeight = Math.max(40, availableSpace) + "px";
};

const adjustCardHeight = (card) => {
    const rect = card.getBoundingClientRect();
    const availableSpace = window.innerHeight - rect.top - getMarginsBelowCard(card);
    card.style.maxHeight = Math.max(80, availableSpace) + "px";
};

// Même condition que la media query « une seule colonne » de style.css
const singleColumnLayout = "(max-width: 1600px), (hover: none) and (pointer: coarse)";

const adjustHeights = () => {
    // Une colonne : la page défile, la hauteur des listes est fixée en CSS
    if (window.matchMedia(singleColumnLayout).matches) {
        [fixedExpensesList, transactionsList, fixedExpensesCard, recentTransactionsCard].forEach(element => element.style.maxHeight = "");
        return;
    }
    adjustListHeight(fixedExpensesList, fixedExpensesCard);
    adjustListHeight(transactionsList, recentTransactionsCard);
    adjustCardHeight(fixedExpensesCard);
    adjustCardHeight(recentTransactionsCard);
};

window.addEventListener("resize", adjustHeights);

// ===== Salaire =====

const salaryForm = document.getElementById("salary-form");
const salaryInput = document.getElementById("salary-input");
const salaryDisplay = document.getElementById("salary-display");
let salary = 0;

salaryForm.addEventListener("submit", function (event) {
    event.preventDefault();

    salary = toCents(salaryInput.value);
    salaryDisplay.textContent = `${formatAmount(salary)} €`;
    salaryInput.value = "";

    calculateBalance();
});

// ===== Charges fixes =====

const fixedExpenseForm = document.getElementById("fixed-expense-form");
const fixedExpenseNameInput = document.getElementById("fixed-expense-name");
const fixedExpenseAmountInput = document.getElementById("fixed-expense-amount");
const fixedExpenseDateInput = document.getElementById("fixed-expense-date");
const fixedExpensesEmptyMessage = document.getElementById("fixed-expenses-empty");
const fixedExpensesList = document.getElementById("fixed-expenses-list");
const fixedExpensesTotalDisplay = document.getElementById("fixed-expenses-total");
let totalFixedExpenses = 0;
let editedFixedExpenseId = null; // null = ajout, sinon id de la charge en cours de modification
let fixedExpenses = [];

const renderFixedExpenses = () => {
    fixedExpensesList.innerHTML = "";
    totalFixedExpenses = fixedExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    fixedExpensesTotalDisplay.textContent = `${formatAmount(totalFixedExpenses)} €`;
    fixedExpenses.forEach(expense => {
        createListRow(expense.name, expense.date, expense.amount, fixedExpensesList, fixedExpensesEmptyMessage, function () {
            fixedExpenses = fixedExpenses.filter(item => item.id !== expense.id);
            renderFixedExpenses();
        }, null, function () {
            editedFixedExpenseId = expense.id;
            const expenseToEdit = fixedExpenses.find(item => item.id === editedFixedExpenseId);
            fixedExpenseNameInput.value = expenseToEdit.name;
            fixedExpenseAmountInput.value = expenseToEdit.amount / 100;
            fixedExpenseDateInput.value = expenseToEdit.date;
        });
    });
    adjustHeights();
};

fixedExpenseForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const name = fixedExpenseNameInput.value;
    const amount = toCents(fixedExpenseAmountInput.value);
    const date = fixedExpenseDateInput.value;
    if (editedFixedExpenseId === null) {
        const newExpense = {
            id: Date.now(),
            name: name,
            amount: amount,
            date: date
        };
        fixedExpenses.push(newExpense);
    } else {
        const expenseToEdit = fixedExpenses.find(
            expense => expense.id === editedFixedExpenseId
        );
        expenseToEdit.name = name;
        expenseToEdit.amount = amount;
        expenseToEdit.date = date;
    };

    editedFixedExpenseId = null;
    fixedExpenseForm.reset();
    renderFixedExpenses();
});

// ===== Opérations =====

const categoryIcons = {
    "food": "🍎",
    "transport": "🚗",
    "leisure": "🎨",
    "other": "❓"
};

const transactionForm = document.getElementById("transaction-form");
const transactionNameInput = document.getElementById("transaction-name");
const transactionAmountInput = document.getElementById("transaction-amount");
const transactionTypeSelect = document.getElementById("transaction-type");
const transactionCategorySelect = document.getElementById("transaction-category");
const transactionDateInput = document.getElementById("transaction-date");
const transactionsEmptyMessage = document.getElementById("transactions-empty");
const transactionsList = document.getElementById("transactions-list");
const otherExpensesDisplay = document.getElementById("other-expenses");
let totalOtherExpenses = 0;
let totalOtherIncome = 0;
let transactions = [];
let editedTransactionId = null;

const renderTransactions = () => {
    transactionsList.innerHTML = "";
    totalOtherIncome = transactions.reduce((sum, transaction) => {
        return transaction.type === "income" ? sum + transaction.amount : sum;
    }, 0);
    totalOtherExpenses = transactions.reduce((sum, transaction) => {
        return transaction.type === "expense" ? sum + transaction.amount : sum;
    }, 0);
    otherExpensesDisplay.textContent = `${formatAmount(totalOtherExpenses)} €`;
    transactions.forEach(transaction => {
        createListRow(`${categoryIcons[transaction.category]} ${transaction.name}`, transaction.date, transaction.amount, transactionsList, transactionsEmptyMessage, function () {
            transactions = transactions.filter(item => item.id !== transaction.id);
            renderTransactions();
        }, transaction.type, function () {
            editedTransactionId = transaction.id;
            const transactionToEdit = transactions.find(item => item.id === editedTransactionId);
            transactionNameInput.value = transactionToEdit.name;
            transactionAmountInput.value = transactionToEdit.amount / 100;
            transactionTypeSelect.value = transactionToEdit.type;
            transactionCategorySelect.value = transactionToEdit.category;
            transactionDateInput.value = transactionToEdit.date;
        });
    });
    adjustHeights();
};

transactionForm.addEventListener("submit", function (event) {
    event.preventDefault();
    const name = transactionNameInput.value;
    const amount = toCents(transactionAmountInput.value);
    const type = transactionTypeSelect.value;
    const category = transactionCategorySelect.value;
    const date = transactionDateInput.value;
    if (editedTransactionId === null) {
        const newTransaction = {
            id: Date.now(),
            name: name,
            amount: amount,
            type: type,
            category: category,
            date: date,
        };
        transactions.push(newTransaction);
    } else {
        const transactionToEdit = transactions.find(transaction => transaction.id === editedTransactionId);
        transactionToEdit.name = name;
        transactionToEdit.amount = amount;
        transactionToEdit.type = type;
        transactionToEdit.category = category;
        transactionToEdit.date = date;
    };
    editedTransactionId = null;
    transactionForm.reset();
    renderTransactions();
});

// ===== Initialisation =====
// En dernier : le premier affichage utilise les variables de toutes les sections

fixedExpenses = JSON.parse(localStorage.getItem("fixedExpenses")) || [];
transactions = JSON.parse(localStorage.getItem("transactions")) || [];
salary = JSON.parse(localStorage.getItem("salary")) || 0;

salaryDisplay.textContent = `${formatAmount(salary)} €`;
renderFixedExpenses();
renderTransactions();
calculateBalance();
