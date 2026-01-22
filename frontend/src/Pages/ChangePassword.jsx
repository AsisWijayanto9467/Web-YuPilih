import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function ChangePassword() {
    const navigate = useNavigate();

    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");
        setLoading(true);

        try {
            await api.post("/auth/change-password", {
                old_password: oldPassword,
                new_password: newPassword
            });

            alert("Password berhasil diubah, silakan login ulang");
            localStorage.clear();
            navigate("/");

        } catch (err) {
            setError(err.response?.data?.message || "Gagal mengubah password");
        } finally {
            setLoading(false)
        }
    };

    return (
        <div className="container d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="card shadow p-4" style={{ minWidth: 300, maxWidth: 400, width: "100%" }}>
                <h4 className="text-center mb-3">Change Password</h4>

                {error && <div className="alert alert-danger">{error}</div>}
                {message && <div className="alert alert-success">{message}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Old Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">New Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button className="btn btn-primary w-100" disabled={loading}>
                        {loading ? "Change Password..." : "Change Password"}
                    </button>
                </form>
            </div>
        </div>
    );
}
