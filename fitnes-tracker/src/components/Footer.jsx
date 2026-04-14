import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-container">

                <div className="footer-left">
                    <img src={logo} alt="BodySync logo" className="footer-logo" />
                    <p>Track your fitness. Stay consistent. Build better habits.</p>
                </div>

                <div className="footer-center">
                    <h4>Navigation</h4>
                    <Link to="/">Home</Link>
                    <Link to="/plans">Plans</Link>
                    <Link to="/workouts">Workouts</Link>
                    <Link to="/progress">Progress</Link>
                </div>

                <div className="footer-right">
                    <h4>Contact</h4>
                    <p>Email: bodysync.app@gmail.com</p>
                    <p>GitHub: Vasilov11</p>
                </div>

            </div>

            <div className="footer-bottom">
                © {new Date().getFullYear()} BodySync. All rights reserved.
            </div>
        </footer>
    );
}

export default Footer;