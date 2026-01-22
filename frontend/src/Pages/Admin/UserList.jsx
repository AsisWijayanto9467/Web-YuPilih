import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import Main from "../layouts/Main";
import MainAdmin from "../layouts/MainAdmin";

export default function UserList() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const fetchUsers = async () => {
        try {
            const res = await api.get("/users");
            setUsers(res.data.content);
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
            fetchUsers();
        } catch (err) {
            alert(err.response?.data?.message);
        }
    };

    useEffect(() => {
        fetchUsers();
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

                <h4>User List</h4>

                {error && <div className="alert alert-danger">{error}</div>}

                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <table className="table table-bordered">
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
                            {users.map((user, index) => (
                                <tr key={index}>
                                    <td>{user.username}</td>
                                    <td>{user.division ?? "-"}</td>
                                    <td>{user.created_at}</td>
                                    <td>{user.updated_at}</td>
                                    <td>
                                        <button
                                            className="btn btn-warning btn-sm me-2"
                                            onClick={() => navigate(`/user/list/edit/${user.id}`)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => handleDelete(user.id)}
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
