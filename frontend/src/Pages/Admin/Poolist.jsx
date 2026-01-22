import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import MainAdmin from "../layouts/MainAdmin";

export default function Poolist() {
    const navigate = useNavigate();
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPolls = async () => {
        try {
            const res = await api.get("/pool");
            setPolls(res.data.contents);
        } catch (err) {
            alert(err.response?.data?.message || "Failed load pooling");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this polling?")) return;

        try {
            await api.delete(`/pool/${id}`);
            fetchPolls();
        } catch (err) {
            alert(err.response?.data?.message);
        }
    };

    useEffect(() => {
        fetchPolls();
    }, []);

    return (
        <>
            <MainAdmin />

            <div className="container mt-4">
                <div className="d-flex justify-content-between mb-3">
                    <h4>Polling List</h4>
                    <button
                        className="btn btn-success"
                        onClick={() => navigate("/pool/create")}
                    >
                        + Create Pooling
                    </button>
                </div>

                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <table className="table table-bordered">
                        <thead className="table-primary">
                            <tr>
                                <th>Title</th>
                                <th>Description</th>
                                <th width="180">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {polls.map((poll, index) => (
                                <tr key={index}>
                                    <td>{poll.title}</td>
                                    <td>{poll.description}</td>
                                    <td>
                                        <button
                                            className="btn btn-info btn-sm me-2"
                                            onClick={() =>
                                                navigate(`/pool/${poll.id}`)
                                            }
                                        >
                                            Detail
                                        </button>

                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() =>
                                                handleDelete(poll.id)
                                            }
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
