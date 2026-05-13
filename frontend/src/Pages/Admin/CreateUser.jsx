import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import MainAdmin from "../layouts/MainAdmin";

export default function CreateUser() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: "",
        password: "",
        division_id: "",
        role: "user"
    });

    const [divisions, setDivisions] = useState([]);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchDivisions = async () => {
            try {
                const res = await api.get("/divisions");
                setDivisions(res.data);
            } catch (err) {
                console.log(err);
            }
        };

        fetchDivisions();
    }, []);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        try {
            await api.post("/users", form);
            alert("User created successfully");
            navigate("/dashboard/admin");
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors);
            } else {
                alert(err.response?.data?.message || "Error");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <MainAdmin />

            <div className="container mt-4">
                <h4>Create User</h4>

                <form onSubmit={handleSubmit}>
                    <input
                        className={`form-control mb-2 ${errors.username ? "is-invalid" : ""}`}
                        placeholder="Username"
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                    />
                    {errors.username && (
                        <div className="invalid-feedback mb-2">
                            {errors.username[0]}
                        </div>
                    )}

                    <input
                        type="password"
                        className={`form-control mb-2 ${errors.password ? "is-invalid" : ""}`}
                        placeholder="Password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                    />
                    {errors.password && (
                        <div className="invalid-feedback mb-2">
                            {errors.password[0]}
                        </div>
                    )}
                    <small className="text-muted d-block mb-3">
                        Min 8 chars, uppercase, lowercase, number
                    </small>

                    <select
                        className={`form-control mb-2 ${errors.division_id ? "is-invalid" : ""}`}
                        name="division_id"
                        value={form.division_id}
                        onChange={handleChange}
                    >
                        <option value="">-- Select Division --</option>
                        {divisions.map((div) => (
                            <option key={div.id} value={div.id}>
                                {div.name}
                            </option>
                        ))}
                    </select>
                    {errors.division_id && (
                        <div className="invalid-feedback mb-2">
                            {errors.division_id[0]}
                        </div>
                    )}

                    <select
                        className="form-control mb-3"
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                    >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>

                    <button 
                        className="btn btn-success" 
                        disabled={loading}
                    >
                        {loading ? "Saving..." : "Save User"}
                    </button>
                    <button 
                        type="button"
                        className="btn btn-secondary ms-2" 
                        onClick={() => navigate("/dashboard/admin")}
                    >
                        Back
                    </button>
                </form>
            </div>
        </>
    );
}