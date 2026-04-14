import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {
    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        password: "",
        age: "",
        gender: "",
        height: "",
        weight: "",
        goal: "",
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        try {
            const response = await axios.post("http://localhost:5000/api/auth/register", formData);

            setMessage(response.data.message);

            localStorage.setItem("token", response.data.token);
            localStorage.setItem("user", JSON.stringify(response.data.user));

            setFormData({
                fullName: "",
                email: "",
                password: "",
                age: "",
                gender: "",
                height: "",
                weight: "",
                goal: "",
            });
        } catch (err) {
            navigate("/profile");
            setError(err.response?.data?.message || "Registration failed");
        }

    };

    return (
        <div className="page auth-page">
            <div className="auth-card">
                <h1>Create Account</h1>
                <p>Register your account and set your fitness profile.</p>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="fullName"
                        placeholder="Full Name"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="number"
                        name="age"
                        placeholder="Age"
                        value={formData.age}
                        onChange={handleChange}
                    />

                    <select name="gender" value={formData.gender} onChange={handleChange}>
                        <option value="">Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                    </select>

                    <input
                        type="number"
                        name="height"
                        placeholder="Height (cm)"
                        value={formData.height}
                        onChange={handleChange}
                    />

                    <input
                        type="number"
                        name="weight"
                        placeholder="Weight (kg)"
                        value={formData.weight}
                        onChange={handleChange}
                    />

                    <select name="goal" value={formData.goal} onChange={handleChange}>
                        <option value="">Select Goal</option>
                        <option value="lose weight">Lose Weight</option>
                        <option value="build muscle">Build Muscle</option>
                        <option value="stay fit">Stay Fit</option>
                    </select>

                    <button type="submit">Register</button>
                </form>

                {message && <p className="success-message">{message}</p>}
                {error && <p className="error-message">{error}</p>}
            </div>
        </div>
    );
}

export default Register;