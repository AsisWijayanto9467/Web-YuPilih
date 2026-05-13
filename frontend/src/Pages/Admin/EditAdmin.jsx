import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import Main from "../layouts/Main";
import MainAdmin from "../layouts/MainAdmin";

export default function EditAdmin() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [divisions, setDivisions] = useState([]);
    const [errors, setErrors] = useState({});


    const [form, setForm] = useState({
        username: "",
        division_id: "",
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadAdmin = async () => {
            try {
                const res = await api.get(`/user/${id}`);

                setForm({
                    username: res.data.username,
                    division_id: res.data.division_id,
                });
            } catch (err) {
                alert(err.response?.data?.message || "Failed to load admin");
                navigate("/dashboard/admin");
            } finally {
                setLoading(false);
            }
        };

        const fetchDivisions = async () => {
            try {
                const res = await api.get("/divisions");
                setDivisions(res.data);
            } catch (err) {
                console.log(err);
                if (err.response?.status === 422) {
                    setErrors(err.response.data.errors);
                } else {
                    alert(err.response?.data?.message || "Error");
                }
            }
        };

        fetchDivisions();

        loadAdmin();
    }, [id, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await api.put(`/user/${id}`, form);
            alert("User updated");
            navigate("/dashboard/admin");
        } catch (err) {
            alert(err.response?.data?.message);
        }
    };

    if (loading) {
        return (
            <>
                <Main />
                <div className="container mt-4">Loading...</div>
            </>
        );
    }

    return (
        <>
        <MainAdmin />

        <div className="container mt-4">
            <h4>Edit User</h4>

            <form onSubmit={handleSubmit}>
            <input
                className="form-control mb-2"
                placeholder="Username"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
            />

            <select
                className={`form-control ${errors.division_id ? "is-invalid" : ""} mb-3`}
                name="division_id"
                value={form.division_id}
                onChange={(e) =>
                setForm({ ...form, division_id: e.target.value })
                }
            >
                <option value="">-- Select Division --</option>
                {divisions.map((div) => (
                    <option key={div.id} value={div.id}>
                        {div.name}
                    </option>
                ))}
            </select>
            {errors.division_id && (
                <div className="invalid-feedback">{errors.division_id[0]}</div>
            )}

            <button className="btn btn-primary">Update</button>
            </form>
        </div>
        </>
    );
}
