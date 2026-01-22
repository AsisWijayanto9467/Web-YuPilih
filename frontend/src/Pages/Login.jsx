import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Login() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setMessage("");

        try {
            const res = await api.post("/auth/login", {
                username,
                password
            });

            const { accessToken, role } = res.data.user;

            localStorage.setItem("token", accessToken);
            localStorage.setItem("user", JSON.stringify(res.data.user));

            if (role === "admin") {
                navigate("/dashboard/admin", { replace: true });
            } else {
                navigate("/dashboard", { replace: true });
            }

        } catch (err) {
            const data = err.response?.data;
            const status = err.response?.status;

            if (status === 422) {
                setErrors(data.errors);
            } 
            else if (status === 401) {
                setMessage(data.message);
            }

            
            else if (status === 403) {
                localStorage.setItem("token", data["use this token"]);
                navigate("/change-password", { replace: true });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="card shadow p-4" style={{ minWidth: 300, maxWidth: 400, width: "100%" }}>
                <h4 className="text-center mb-3">Login</h4>

                {message && (
                    <div className="alert alert-danger">
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Username</label>
                        <input
                            className={`form-control ${errors.username ? "is-invalid" : ""}`}
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        {errors.username && (
                            <div className="invalid-feedback">
                                {errors.username[0]}
                            </div>
                        )}
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className={`form-control ${errors.password ? "is-invalid" : ""}`}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {errors.password && (
                            <div className="invalid-feedback">
                                {errors.password[0]}
                            </div>
                        )}
                    </div>

                    <button
                        className="btn btn-primary w-100"
                        disabled={loading}
                    >
                        {loading ? "Loading..." : "Login"}
                    </button>
                </form>
            </div>
        </div>
    );
}
