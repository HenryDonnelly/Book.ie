import axios from "axios";
import { useState } from "react";
import { useAuth } from "../utils/useAuth"; 
import { useNavigate } from "react-router-dom";

const RegisterForm = (props) => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [form, setForm] = useState({
        name: '',
        email: '',
        username: '',
        address: '',
        phone_number: '',
        password: '',
        c_password: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();

        axios.post('https://bookie.laravel.cloud/api/register', form)
            .then((response) => {
                console.log(response);

                localStorage.setItem('user', JSON.stringify(response.data.user));

                login(form.email, form.password)
                    .then(() => {
                        navigate('/'); 
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            })
            .catch((error) => {
                console.error(error);
            });
    };

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <form className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4 text-center">Register</h2>
                <input
                    onChange={handleChange}
                    value={form.name}
                    type="text"
                    name="name"
                    placeholder="Name"
                    className="w-full p-2 border rounded-lg mb-4"
                />
                
                <input
                    onChange={handleChange}
                    value={form.email}
                    type="email"
                    name="email"
                    placeholder="joe.bloggs@email.com"
                    className="w-full p-2 border rounded-lg mb-4"
                />
                <input
                    onChange={handleChange}
                    value={form.username}
                    type="text"
                    name="username"
                    placeholder="Username"
                    className="w-full p-2 border rounded-lg mb-4"
                />
                <input
                    onChange={handleChange}
                    value={form.address}
                    type="text"
                    name="address"
                    placeholder="Address"
                    className="w-full p-2 border rounded-lg mb-4"
                />
                <input
                    onChange={handleChange}
                    value={form.phone_number}
                    type="text"
                    name="phone_number"
                    placeholder="Phone Number"
                    className="w-full p-2 border rounded-lg mb-4"
                />
                <input
                    onChange={handleChange}
                    value={form.password}
                    type="password"
                    name="password"
                    placeholder="Password"
                    className="w-full p-2 border rounded-lg mb-4"
                />
                <input
                    onChange={handleChange}
                    value={form.c_password}
                    type="password"
                    name="c_password"
                    placeholder="Confirm Password"
                    className="w-full p-2 border rounded-lg mb-4"
                />
                <button
                    onClick={handleSubmit}
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                >
                    Submit
                </button>
            </form>
        </div>
    );
};

export default RegisterForm;
