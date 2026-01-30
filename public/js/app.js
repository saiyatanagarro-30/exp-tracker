const form = document.getElementById("expenseForm");
const list = document.getElementById("expenseList");

let editingId = null;

// Load expenses
async function loadExpenses() {
  const res = await fetch("/api/expenses");
  const data = await res.json();
  list.innerHTML = "";

  data.forEach(exp => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span>
        <strong>${exp.Title}</strong> - ₹${exp.Amount}
        <em>(${exp.Status})</em>
      </span>
      <div>
        <button onclick="editExpense(${exp.Id}, '${exp.Title}', ${exp.Amount}, '${exp.Status}')">Edit</button>
        <button class="delete" onclick="deleteExpense(${exp.Id})">Delete</button>
      </div>
    `;
    list.appendChild(li);
  });
}

// Add / Update expense
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const title = document.getElementById("title").value;
  const amount = document.getElementById("amount").value;
  const status = document.getElementById("status").value;

  const payload = { title, amount, status };

  if (editingId) {
    await fetch(`/api/expenses/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    editingId = null;
  } else {
    await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  }

  form.reset();
  loadExpenses();
});

// Edit
function editExpense(id, title, amount, status) {
  editingId = id;
  document.getElementById("title").value = title;
  document.getElementById("amount").value = amount;
  document.getElementById("status").value = status;
}

// Delete
async function deleteExpense(id) {
  await fetch(`/api/expenses/${id}`, { method: "DELETE" });
  loadExpenses();
}

loadExpenses();



// Background Image Upload
const uploadInput = document.getElementById("bgUpload");

document.getElementById("bgButton").addEventListener("click", () => {
  document.getElementById("bgUpload").click();
});


uploadInput.addEventListener("change", async () => {
  const file = uploadInput.files[0];
  if (!file) return;


  // New image → upload
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData
  });

  const data = await res.json();


  setBackground(data.imageUrl);
});



function setBackground(url) {
  document.body.style.backgroundImage = `url(${url})`;
  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundPosition = "center";
}


document.getElementById('processBtn').addEventListener('click', async () => {
    const resultEl = document.getElementById('result');
    resultEl.textContent = 'Processing...';

    try {
        // const res = await fetch('http://localhost:7071/api/processOrders'); // Local URL for testing
        const res = await fetch("https://fa-app-dev-et-eehvhmasayakfefa.centralindia-01.azurewebsites.net/api/processOrders");
        const data = await res.json();

        resultEl.textContent = data.message;
    } catch (err) {
        resultEl.textContent = 'Failed to process orders';
        console.error(err);
    }
});

const LOGIC_APP_URL = "https://prod-28.centralindia.logic.azure.com:443/workflows/38d7078f4a1b4e73a4fe52e19fdb2c30/triggers/When_an_HTTP_request_is_received/paths/invoke?api-version=2016-10-01&sp=%2Ftriggers%2FWhen_an_HTTP_request_is_received%2Frun&sv=1.0&sig=k_61wEUKbmx4w46n7_uoB54fe9w_e995FP0bUujf9SE";

document.getElementById("sendLogicBtn").addEventListener("click", async () => {
  const message = document.getElementById("logicMessage").value;
  const statusEl = document.getElementById("logicStatus");

  if (!message) {
    statusEl.innerText = "Message cannot be empty";
    return;
  }

  try {
    const response = await fetch(LOGIC_APP_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ message })
    });

    const data = await response.json();

    statusEl.innerText = data.status === "success"
      ? "Email sent successfully"
      : "Failed to send email to Logic App";

  } catch (err) {
    console.error(err);
    statusEl.innerText = "Error calling Logic App";
  }
});

