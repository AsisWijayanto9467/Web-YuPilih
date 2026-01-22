import { useEffect, useState } from "react";
import api from "../../services/api";
import MainAdmin from "../layouts/MainAdmin";
import { useNavigate } from "react-router-dom";

export default function AdminList() {
    const navigate = useNavigate();
    const [admins, setAdmins] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchAdmins = async () => {
        try {
            const res = await api.get("/admins"); 
            setAdmins(res.data.content);
        } catch (err) {
            if (err.response?.status === 403) {
                setError("You are not the administrator");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this user?")) return;

        try {
            await api.delete(`/user/${id}`);
            fetchAdmins();
        } catch (err) {
            alert(err.response?.data?.message);
        }
    };

    useEffect(() => {
        fetchAdmins();
    }, []);

    return (
        <>
            <MainAdmin />

            <div className="container mt-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex gap-3">
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate("/dashboard/admin")}
                        >
                            Admin List
                        </button>

                        <button
                            className="btn btn-success"
                            onClick={() => navigate("/users/list")}
                        >
                            User List
                        </button>
                    </div>
                </div>
                <h4>Admin List</h4>

                {error && (
                    <div className="alert alert-danger">{error}</div>
                )}

                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <table className="table table-bordered mt-3">
                        <thead className="table-primary">
                            <tr>
                                <th>Username</th>
                                <th>Division</th>
                                <th>Created</th>
                                <th>Updated</th>
                                <th width="150">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {admins.map((admin, index) => (
                                <tr key={index}>
                                    <td>{admin.username}</td>
                                    <td>{admin.division ?? "-"}</td>
                                    <td>{admin.created_at}</td>
                                    <td>{admin.updated_at}</td>
                                    <td>
                                        <button
                                            className="btn btn-warning btn-sm me-2"
                                            onClick={() => navigate(`/user/list/edit/admin/${admin.id}`)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleDelete(admin.id)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </>
    );
}
