const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const app = express();
const prisma = new PrismaClient();
app.use(cors());
app.use(express.json());
// Get all employees
app.get('/employees', async (req, res) => {
  try {
    const employees = await prisma.employees.findMany();
    res.json(employees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Add a new employee
app.post('/employees', async (req, res) => {
  const { first_name, last_name, email, birthdate, salary } = req.body;
  try {
    const newEmployee = await prisma.employees.create({
      data: {
        first_name,
        last_name,
        email,
        birthdate: birthdate ? new Date(birthdate) : null,
        salary: salary ? parseFloat(salary) : null
      },
    });
    res.json(newEmployee);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));