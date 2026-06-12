let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

displayExpenses();

function addExpense(){

    let name = document.getElementById("expenseName").value;
    let amount = document.getElementById("expenseAmount").value;
    let date = document.getElementById("expenseDate").value;

    if(name === "" || amount === "" || date === ""){
        alert("Please fill all fields");
        return;
    }

    let expense = {
        name,
        amount: Number(amount),
        date
    };

    expenses.push(expense);

    localStorage.setItem(
        "expenses",
        JSON.stringify(expenses)
    );

    document.getElementById("expenseName").value="";
    document.getElementById("expenseAmount").value="";
    document.getElementById("expenseDate").value="";

    displayExpenses();
}

function displayExpenses(){

    let list = document.getElementById("expenseList");

    list.innerHTML = "";

    expenses.forEach((expense,index)=>{

        list.innerHTML += `
        <tr>
            <td>${expense.name}</td>
            <td>₹${expense.amount}</td>
            <td>${expense.date}</td>
            <td>
                <button class="delete-btn"
                onclick="deleteExpense(${index})">
                Delete
                </button>
            </td>
        </tr>
        `;
    });

    calculateTotals();
}

function deleteExpense(index){

    expenses.splice(index,1);

    localStorage.setItem(
        "expenses",
        JSON.stringify(expenses)
    );

    displayExpenses();
}

function calculateTotals(){

    let today = new Date();

    let daily = 0;
    let weekly = 0;
    let monthly = 0;

    expenses.forEach(expense=>{

        let expenseDate = new Date(expense.date);

        let diff =
        (today - expenseDate) /
        (1000*60*60*24);

        if(diff < 1){
            daily += expense.amount;
        }

        if(diff <= 7){
            weekly += expense.amount;
        }

        if(
            expenseDate.getMonth() === today.getMonth() &&
            expenseDate.getFullYear() === today.getFullYear()
        ){
            monthly += expense.amount;
        }

    });

    document.getElementById("dailyTotal").textContent =
    `₹${daily}`;

    document.getElementById("weeklyTotal").textContent =
    `₹${weekly}`;

    document.getElementById("monthlyTotal").textContent =
    `₹${monthly}`;
}

