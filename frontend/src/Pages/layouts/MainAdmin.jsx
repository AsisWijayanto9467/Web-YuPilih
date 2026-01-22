import React from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function MainAdmin() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
        await api.post("/auth/logout");
        } catch (err) {
        console.log("Logout error:", err);
        } finally {
        localStorage.clear();
        navigate("/", { replace: true });
        }
    };

    return (
        <>
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
            <div className="container-fluid">
            <span className="navbar-brand">LKS</span>

            <div className="ms-auto d-flex align-items-center text-white">
                <span className="me-3">My Web</span>
                <button
                className="btn btn-outline-light btn-sm"
                onClick={handleLogout}
                >
                Logout
                </button>
            </div>
            </div>
        </nav>

        <div className="container mt-4">
            <h4 className="mb-3">Admin Dashboard</h4>

            <div className="d-flex gap-3">
                <button
                    className="btn btn-success"
                    onClick={() => navigate("/user/list/create")}
                >
                    Create User
                </button>

                <button
                    className="btn btn-warning"
                    onClick={() => navigate("/pool")}
                >
                    Pooling List
            </button>
            </div>
        </div>
        </>
    );
}
