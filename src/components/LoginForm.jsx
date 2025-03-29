import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/useAuth"; // Import useAuth

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Destructure login from useAuth

  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    login(form.email, form.password)
      .then(() => {
        navigate("/"); // Redirect to dashboard after successful login
      })
      .catch((error) => {
        console.error("Login Error: ", error);
      });
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
          value={form.email}
          className="w-full p-2 border rounded-lg mb-4"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
          value={form.password}
          className="w-full p-2 border rounded-lg mb-4"
        />
        <button type="submit" className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition">
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginForm;