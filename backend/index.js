const express = require('express');
const app = express();
const mysql = require('mysql2');
const cors = require('cors');
app.use(cors());
// Middleware to parse JSON data from requests
app.use(express.json());

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "arihant@9873",  // Replace with your actual password
  database: "test"
});

// Route to fetch all questions
app.get("/", (req, res) => {
    res.json("hello");
});

app.get("/questions", (req, res) => {
  const q = "SELECT * FROM quiz_questions";
  con.query(q, (err, data) => {
    if (err) {
      console.log(err);
      return res.json(err);
    }
    return res.json(data);
  });
});

// Route to add a new question
// Route to add a new question
app.post("/questions", (req, res) => {
    const { ques, op1, op2, op3, op4, ans } = req.body;
    const q = "INSERT INTO quiz_questions (ques, op1, op2, op3, op4, ans) VALUES (?, ?, ?, ?, ?, ?)";
    con.query(q, [ques, op1, op2, op3, op4, ans], (err, data) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: 'Failed to add question' });
      }
      return res.json({ message: "Question added successfully!", data });
    });
  });
  
  // Route to edit an existing question
  app.put("/questions/:id", (req, res) => {
    const { id } = req.params;
    const { ques, op1, op2, op3, op4, ans } = req.body;
    const q = "UPDATE quiz_questions SET ques = ?, op1 = ?, op2 = ?, op3 = ?, op4 = ?, ans = ? WHERE id = ?";
    con.query(q, [ques, op1, op2, op3, op4, ans, id], (err, data) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: 'Failed to update question' });
      }
      return res.json({ message: "Question updated successfully!", data });
    });
  });
  

// Route to delete a question
app.delete("/questions/:id", (req, res) => {
  const { id } = req.params;
  const q = "DELETE FROM quiz_questions WHERE id = ?";
  con.query(q, [id], (err, data) => {
    if (err) {
      console.log(err);
      return res.json(err);
    }
    return res.json({ message: "Question deleted successfully!", data });
  });
});

// Start the server
app.listen(8080, () => {
  console.log("Backend connected on port 8080");
});
// bhai sun tu offcampus dekh rha hai kya 