let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
let expenseChart = null;

document.addEventListener("DOMContentLoaded", () => {
    // Force resetting fields on initial page load to destroy cache retention
    document.getElementById("expenseName").value = "";
    document.getElementById("expenseAmount").value = "";
    document.getElementById("expenseCategory").value = "";
    document.getElementById("expenseDate").valueAsDate = new Date();
    
    gsap.from(".container", { opacity: 0, y: 30, duration: 0.8, ease: "power2.out" });
    gsap.from(".card", { opacity: 0, scale: 0.9, duration: 0.6, stagger: 0.15, ease: "back.out(1.5)" });
    
    displayExpenses();
    
    // Clear validation error rings dynamically when user updates contents
    const inputs = ["expenseName", "expenseAmount", "expenseDate", "expenseCategory"];
    inputs.forEach(id => {
        document.getElementById(id).addEventListener("input", () => {
            document.getElementById(id).classList.remove("input-error");
        });
    });
});

function addExpense() {
    const nameInput = document.getElementById("expenseName");
    const amountInput = document.getElementById("expenseAmount");
    const dateInput = document.getElementById("expenseDate");
    const categoryInput = document.getElementById("expenseCategory");

    const name = nameInput.value.trim();
    const amount = amountInput.value.trim();
    const date = dateInput.value;
    const category = categoryInput.value;

    let hasErrors = false;

    // Field-by-field validation checks
    if (!name) {
        nameInput.classList.add("input-error");
        hasErrors = true;
    }
    if (!amount || parseFloat(amount) <= 0) {
        amountInput.classList.add("input-error");
        hasErrors = true;
    }
    if (!date) {
        dateInput.classList.add("input-error");
        hasErrors = true;
    }
    if (!category) {
        categoryInput.classList.add("input-error");
        hasErrors = true;
    }

    // UI Feedback Sequence for validation errors
    if (hasErrors) {
        gsap.to(".input-box", { x: -10, repeat: 3, yoyo: true, duration: 0.07, clearProps: "x" });
        return;
    }

    const expense = {
        id: Date.now(),
        name,
        amount: parseFloat(amount),
        date,
        category
    };

    expenses.push(expense);
    saveAndRefresh();

    // Standard structural reset execution workflow
    nameInput.value = "";
    amountInput.value = "";
    categoryInput.value = ""; // Forces option back to 'Select Category'
    dateInput.valueAsDate = new Date();
}

function displayExpenses() {
    const list = document.getElementById("expenseList");
    list.innerHTML = "";

    [...expenses].reverse().forEach((expense) => {
        const globalIndex = expenses.findIndex(item => item.id === expense.id);
        
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${expense.name}</td>
            <td><span class="category-badge badge-${expense.category}">${expense.category}</span></td>
            <td style="font-weight: 600; color: #fff;">₹${expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</td>
            <td>${formatDate(expense.date)}</td>
            <td>
                <button class="delete-btn" onclick="deleteExpense(${globalIndex}, this.parentNode.parentNode)">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </td>
        `;
        list.appendChild(row);
    });

    calculateTotals();
    updateChart();
}

function deleteExpense(index, rowElement) {
    gsap.to(rowElement, {
        opacity: 0,
        x: 50,
        duration: 0.3,
        onComplete: () => {
            expenses.splice(index, 1);
            saveAndRefresh();
        }
    });
}

function calculateTotals() {
    const today = new Date();
    let daily = 0, weekly = 0, monthly = 0;

    expenses.forEach(expense => {
        const expenseDate = new Date(expense.date);
        
        // Calculate dynamic real day boundary offsets ignoring hours
        const d1 = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
        const d2 = Date.UTC(expenseDate.getFullYear(), expenseDate.getMonth(), expenseDate.getDate());
        const daysDiff = Math.floor((d1 - d2) / (1000 * 60 * 60 * 24));

        if (expenseDate.toDateString() === today.toDateString()) {
            daily += expense.amount;
        }
        if (daysDiff >= 0 && daysDiff < 7) {
            weekly += expense.amount;
        }
        if (expenseDate.getMonth() === today.getMonth() && expenseDate.getFullYear() === today.getFullYear()) {
            monthly += expense.amount;
        }
    });

    document.getElementById("dailyTotal").textContent = `₹${daily.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    document.getElementById("weeklyTotal").textContent = `₹${weekly.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    document.getElementById("monthlyTotal").textContent = `₹${monthly.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

function updateChart() {
    const canvas = document.getElementById('expenseChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const categories = ['Food', 'Bills', 'Shopping', 'Entertainment', 'Travel', 'Other'];
    const dataValues = categories.map(cat => {
        return expenses
            .filter(exp => exp.category === cat)
            .reduce((sum, exp) => sum + exp.amount, 0);
    });

    if (expenseChart) {
        expenseChart.destroy();
    }

    expenseChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categories,
            datasets: [{
                data: dataValues,
                backgroundColor: [
                    '#ff0080', // Food
                    '#00ffff', // Bills
                    '#ff7b00', // Shopping
                    '#d8006c', // Entertainment
                    '#00b3b3', // Travel
                    '#b35600'  // Other
                ],
                borderWidth: 0,
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Expense Breakdown by Category Name',
                    color: '#e2e8f0',
                    font: { family: 'Plus Jakarta Sans', size: 14, weight: '600' },
                    padding: { bottom: 10 }
                },
                legend: {
                    position: 'right',
                    labels: {
                        color: '#94a3b8',
                        font: { family: 'Plus Jakarta Sans', size: 11 },
                        padding: 12
                    }
                },
                tooltip: {
                    backgroundColor: '#110f24',
                    titleFont: { family: 'Plus Jakarta Sans', size: 13 },
                    bodyFont: { family: 'Plus Jakarta Sans', size: 13 },
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) { label += ': '; }
                            if (context.parsed !== null) {
                                label += '₹' + context.parsed.toLocaleString('en-IN');
                            }
                            return label;
                        }
                    }
                }
            },
            cutout: '65%'
        }
    });
}

function saveAndRefresh() {
    localStorage.setItem("expenses", JSON.stringify(expenses));
    displayExpenses();
}

function formatDate(dateString) {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}
