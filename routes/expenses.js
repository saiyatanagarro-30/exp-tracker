// const express = require("express");
// const router = express.Router();

// // Temporary in-memory DB (replace with SQL later)
// let expenses = [];
// let idCounter = 1;

// // GET all expenses
// router.get("/", (req, res) => {
//   res.json(expenses);
// });

// // CREATE expense
// router.post("/", (req, res) => {
//   const { title, amount, status } = req.body;

//   const expense = {
//     id: idCounter++,
//     title,
//     amount,
//     status
//   };

//   expenses.push(expense);
//   res.status(201).json(expense);
// });

// // UPDATE expense
// router.put("/:id", (req, res) => {
//   const id = parseInt(req.params.id);
//   const { title, amount, status } = req.body;

//   const expense = expenses.find(e => e.id === id);
//   if (!expense) return res.status(404).json({ message: "Not found" });

//   expense.title = title;
//   expense.amount = amount;
//   expense.status = status;

//   res.json(expense);
// });

// // DELETE expense
// router.delete("/:id", (req, res) => {
//   const id = parseInt(req.params.id);
//   expenses = expenses.filter(e => e.id !== id);
//   res.json({ message: "Deleted" });
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const { poolPromise, sql } = require("../db");

// GET all expenses
router.get("/", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(
      "SELECT * FROM Expenses ORDER BY CreatedAt DESC"
    );
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE expense
router.post("/", async (req, res) => {
  const { title, amount, status } = req.body;

  try {
    const pool = await poolPromise;
    await pool.request()
      .input("Title", sql.NVarChar, title)
      .input("Amount", sql.Decimal(10, 2), amount)
      .input("Status", sql.NVarChar, status)
      .query(`
        INSERT INTO Expenses (Title, Amount, Status)
        VALUES (@Title, @Amount, @Status)
      `);

    res.status(201).json({ message: "Expense added" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE expense
router.put("/:id", async (req, res) => {
  const { title, amount, status } = req.body;
  const id = req.params.id;

  try {
    const pool = await poolPromise;
    await pool.request()
      .input("Id", sql.Int, id)
      .input("Title", sql.NVarChar, title)
      .input("Amount", sql.Decimal(10, 2), amount)
      .input("Status", sql.NVarChar, status)
      .query(`
        UPDATE Expenses
        SET Title=@Title, Amount=@Amount, Status=@Status
        WHERE Id=@Id
      `);

    res.json({ message: "Expense updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE expense
router.delete("/:id", async (req, res) => {
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("Id", sql.Int, req.params.id)
      .query("DELETE FROM Expenses WHERE Id=@Id");

    res.json({ message: "Expense deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
