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

// Load saved background on startup
document.addEventListener("DOMContentLoaded", () => {
  const savedBg = localStorage.getItem("bgImageUrl");
  if (savedBg) {
    setBackground(savedBg);
  }
});


// Background Image Upload
const uploadInput = document.getElementById("bgUpload");

document.getElementById("bgButton").addEventListener("click", () => {
  document.getElementById("bgUpload").click();
});


uploadInput.addEventListener("change", async () => {
  const file = uploadInput.files[0];
  if (!file) return;

  const newHash = getFileHash(file);
  const savedHash = localStorage.getItem("bgImageHash");
  const savedUrl = localStorage.getItem("bgImageUrl");

  // Same image → reuse
  if (newHash === savedHash && savedUrl) {
    setBackground(savedUrl);
    return;
  }

  // New image → upload
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch("/api/upload", {
    method: "POST",
    body: formData
  });

  const data = await res.json();

  localStorage.setItem("bgImageUrl", data.imageUrl);
  localStorage.setItem("bgImageHash", newHash);

  setBackground(data.imageUrl);
});


function getFileHash(file) {
  return `${file.name}_${file.size}_${file.lastModified}`;
}

function setBackground(url) {
  document.body.style.backgroundImage = `url(${url})`;
  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundPosition = "center";
}

