import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    birthdate: '',
    salary: ''
  });

  useEffect(() => {
    async function fetchEmployees() {
      try {
        const res = await axios.get('http://localhost:4000/employees');
        setEmployees(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchEmployees();
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      // Normalize payload types before sending
      const payload = {
        first_name: form.first_name || null,
        last_name: form.last_name || null,
        email: form.email || null,
        birthdate: form.birthdate || null,
        salary: form.salary === '' ? null : Number(form.salary)
      };

      const postRes = await axios.post('http://localhost:4000/employees', payload);

      // If backend returns the created employee object, append it to state for immediate UI update.
      if (postRes && postRes.data && typeof postRes.data === 'object' && !Array.isArray(postRes.data)) {
        // Append the created employee to the bottom of the table (end of array)
        setEmployees(prev => [...prev, postRes.data]);
      } else {
        // Fallback: refetch full list and sort ascending by id so table is ordered bottom-up
        const res = await axios.get('http://localhost:4000/employees');
        const sorted = Array.isArray(res.data)
          ? res.data.slice().sort((a, b) => (a.employee_id ?? a.id ?? 0) - (b.employee_id ?? b.id ?? 0))
          : res.data;
        setEmployees(sorted);
      }

      setForm({ first_name: '', last_name: '', email: '', birthdate: '', salary: '' });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ margin: '20px' }}>
      <h1>Employees</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <input name="first_name" value={form.first_name} onChange={handleChange} placeholder="First Name" />
        <input name="last_name" value={form.last_name} onChange={handleChange} placeholder="Last Name" />
        <input name="email" value={form.email} onChange={handleChange} placeholder="Email" />
        <input name="birthdate" type="date" value={form.birthdate} onChange={handleChange} placeholder="Birthdate" />
        <input name="salary" type="number" step="0.01" value={form.salary} onChange={handleChange} placeholder="Salary" />
        <button type="submit">Add Employee</button>
      </form>

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>ID</th><th>First Name</th><th>Last Name</th><th>Email</th><th>Birthdate</th><th>Salary</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp, idx) => {
            // defensive mappings: backend may use different field names or return strings
            const id = emp?.employee_id ?? emp?.id ?? idx;
            const first = emp?.first_name ?? emp?.firstName ?? '-';
            const last = emp?.last_name ?? emp?.lastName ?? '-';
            const email = emp?.email ?? '-';
            const birthRaw = emp?.birthdate ?? emp?.birthDate ?? null;
            const birth = birthRaw ? new Date(birthRaw).toLocaleDateString() : '-';

            // Ensure salary is a finite number before calling toFixed
            let salaryVal = Number.NaN;
            if (typeof emp?.salary === 'number') {
              salaryVal = emp.salary;
            } else if (typeof emp?.salary === 'string' && emp.salary !== '') {
              const parsed = Number(emp.salary);
              salaryVal = Number.isFinite(parsed) ? parsed : Number.NaN;
            }
            const salary = Number.isFinite(salaryVal) ? salaryVal.toFixed(2) : '-';

            return (
              <tr key={id}>
                <td>{id}</td>
                <td>{first}</td>
                <td>{last}</td>
                <td>{email}</td>
                <td>{birth}</td>
                <td>{salary}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default App;
