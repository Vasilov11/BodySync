import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

function Navbar() {
    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <img src={logo} alt="Fitness Tracker Logo" className="navbar-logo" />
            </div>

            <div className="nav-links">
                <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
                    Home
                </NavLink>

                <NavLink to="/plans" className={({ isActive }) => (isActive ? "active" : "")}>
                    Plans
                </NavLink>

                <NavLink to="/workouts" className={({ isActive }) => (isActive ? "active" : "")}>
                    Workouts
                </NavLink>

                <NavLink to="/progress" className={({ isActive }) => (isActive ? "active" : "")}>
                    Progress
                </NavLink>

                <NavLink to="/profile" className={({ isActive }) => (isActive ? "active" : "")}>
                    Profile
                </NavLink>

                {!token ? (
                    <>
                        <NavLink to="/login" className={({ isActive }) => (isActive ? "active" : "")}>
                            Login
                        </NavLink>

                        <NavLink to="/register" className={({ isActive }) => (isActive ? "active" : "")}>
                            Register
                        </NavLink>
                    </>
                ) : (
                    <button className="logout-btn" onClick={handleLogout}>
                        Logout
                    </button>
                )}
            </div>
        </nav>
    );
}

export default Navbar;