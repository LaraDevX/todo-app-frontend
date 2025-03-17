import React, { useState, useEffect } from "react";
import axios from "axios";
import "./ToDo.css"; 

const API_URL = "http://127.0.0.1:8000/api/todos";

function TodoApp() {
  const [todos, setTodos] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", start_date: "", due_date: "" });
  const [editingId, setEditingId] = useState(null);
  const [selectedTodo, setSelectedTodo] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    axios.get(API_URL)
      .then((res) => setTodos(res.data.data))
      .catch((err) => console.error("Error fetching todos:", err));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      let res;
      if (editingId) {
        res = await axios.put(`${API_URL}/${editingId}`, form);
        setTodos(todos.map(todo => (todo.id === editingId ? { ...todo, ...res.data.data } : todo)));
        setEditingId(null);
      } else {
        res = await axios.post(API_URL, form);
        setTodos([...todos, res.data.data]);
      }
      
      if (res.data.message) {
        setSuccessMessage(res.data.message); 
      }

      setForm({ title: "", description: "", start_date: "", due_date: "" });

      
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Xatolik yuz berdi, qayta urinib ko‘ring!");
      }
    }
  };

  const handleEdit = (todo) => {
    setForm(todo);
    setEditingId(todo.id);
    setError("");
    setSuccessMessage("");
  };

  const handleDelete = async (id) => {
    setError("");
    setSuccessMessage("");
    try {
      const res = await axios.delete(`${API_URL}/${id}`);
      setTodos(todos.filter(todo => todo.id !== id));

      if (res.data.message) {
        setSuccessMessage(res.data.message);
      }

      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Xatolik yuz berdi, qayta urinib ko‘ring!");
      }
    }
  };

  const handleShow = async (id) => {
    try {
      const res = await axios.get(`${API_URL}/${id}`);
      setSelectedTodo(res.data.data);
    } catch (err) {
      console.error("Error fetching todo:", err);
    }
  };

  return (
    <div className="container">
      <h2>Todo List</h2>

      {error && <div className="error-message">{error}</div>}
      {successMessage && <div className="success-message">{successMessage}</div>}

      <form onSubmit={handleSubmit}>
        <input type="text" name="title" placeholder="Title" value={form.title} onChange={handleChange} required />
        <input type="text" name="description" placeholder="Description" value={form.description} onChange={handleChange} required />
        <input type="date" name="start_date" value={form.start_date} onChange={handleChange} required />
        <input type="date" name="due_date" value={form.due_date} onChange={handleChange} required />
        <button className='btn-add' type="submit">{editingId ? "Update" : "Add"}</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Description</th>
            <th>Start Date</th>
            <th>Due Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {todos.map((todo) => (
            <tr key={todo.id}>
              <td>{todo.title}</td>
              <td>{todo.description}</td>
              <td>{todo.start_date}</td>
              <td>{todo.due_date}</td>
              <td>
                <div className='btn-group'>
                  <button className='btn-edit' onClick={() => handleEdit(todo)}>Edit</button>
                  <button className='btn-delete' onClick={() => handleDelete(todo.id)}>Delete</button>	
                  <button className='btn-show' onClick={() => handleShow(todo.id)}>Show</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedTodo && (
        <div className="modal">
          <h3>{selectedTodo.title}</h3>
          <p>{selectedTodo.description}</p>
          <p>Start: {selectedTodo.start_date}</p>
          <p>Due: {selectedTodo.due_date}</p>
          <button className='btn-close' onClick={() => setSelectedTodo(null)}>Close</button>
        </div>
      )}
    </div>
  );
}

export default TodoApp;
