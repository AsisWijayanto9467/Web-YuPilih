import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";

export default function EditTrue() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [divisions, setDivisions] = useState([]);
    const [loadingData, setLoadingData] = useState(true);

    const [form, setForm] = useState({
        username: "",
        division_id: "",
    });

    const handleChange = (e) => {
        setForm({
        ...form,
        [e.target.name]: e.target.value,
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, divRes] = await Promise.all([
                    api.get(`/user/${id}`),
                    api.get("/divisions"),
                ]);

                setForm({
                    username: userRes.data.username,
                    division_id: userRes.data.division_id,
                });

                setDivisions(divRes.data.divisions);
            } catch (err) {
                console.log(err);
                alert("Gagal mengambil data user");
                navigate("/user/list");
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, [id, navigate]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        try {
            await api.put(`/user/${id}`, form);
            alert("User successfully updated");
            navigate("/user/list");
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data.errors);
            } else {
                alert(err.response?.data?.message || "Terjadi kesalahan");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <MainAdmin />
            <div className="container">
                <h4 className="text-center">Edit User</h4>

                {loadingData ? (
                    <p>Loading data...</p>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {/* Username */}
                        <div className="mb-3">
                            <label className="form-label">Username</label>
                            <input
                            name="username"
                            className={`form-control ${errors.username ? "is-invalid" : ""}`}
                            type="text"
                            value={form.username}
                            onChange={handleChange}
                            required
                            />
                            {errors.username && (
                            <div className="invalid-feedback">{errors.username[0]}</div>
                            )}
                        </div>

                        {/* Division */}
                        <div className="mb-3">
                            <label className="form-label">Division</label>
                            <select
                            className={`form-control ${errors.division_id ? "is-invalid" : ""}`}
                            name="division_id"
                            value={form.division_id}
                            onChange={handleChange}
                            required
                            >
                            <option value="">-- Pilih Division --</option>
                            {divisions.map((div) => (
                                <option key={div.id} value={div.id}>
                                {div.name}
                                </option>
                            ))}
                            </select>
                            {errors.division_id && (
                            <div className="invalid-feedback">{errors.division_id[0]}</div>
                            )}
                        </div>

                        <div>
                            <button className="btn btn-primary me-3" disabled={loading}>
                            {loading ? "Updating..." : "Update"}
                            </button>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => navigate("/user/list")}
                            >
                                Kembali
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </>
    );
}
