import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import MainAdmin from "../layouts/MainAdmin";

export default function DetailPool() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [poll, setPoll] = useState(null);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [detailRes, resultRes] = await Promise.all([
                    api.get(`/pool/${id}`),
                    api.get(`/pool/${id}/result`)
                ]);

                setPoll(detailRes.data);
                setResults(resultRes.data.result);
            } catch (err) {
                alert(err.response?.data?.message || "Poll not found");
                navigate("/pool");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, navigate]);

    if (loading) return <p className="text-center mt-4">Loading...</p>;
    if (!poll) return null;

    return (
        <>
            <MainAdmin />

            <div className="container mt-4">
                <button
                    className="btn btn-secondary mb-3"
                    onClick={() => navigate("/pool")}
                >
                    ← Back
                </button>

                {/* DETAIL POLLING */}
                <div className="card mb-4 shadow-sm">
                    <div className="card-body">
                        <h4 className="card-title">{poll.title}</h4>
                        <p className="card-text text-muted">
                            {poll.description}
                        </p>

                        <h6 className="mt-4">Choices</h6>
                        <ul className="list-group">
                            {poll.choice.map((c) => (
                                <li key={c.id} className="list-group-item">
                                    {c.choice}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* RESULT POLLING */}
                <div className="card shadow-sm">
                    <div className="card-body">
                        <h5 className="mb-3">📊 Polling Result</h5>

                        {results.length === 0 ? (
                            <p className="text-muted">
                                No votes yet.
                            </p>
                        ) : (
                            results.map((r) => (
                                <div key={r.id} className="mb-3">
                                    <div className="d-flex justify-content-between">
                                        <strong>{r.choice}</strong>
                                        <span>{r.percentage}%</span>
                                    </div>

                                    <div className="progress">
                                        <div
                                            className="progress-bar bg-success"
                                            role="progressbar"
                                            style={{ width: `${r.percentage}%` }}
                                            aria-valuenow={r.percentage}
                                            aria-valuemin="0"
                                            aria-valuemax="100"
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
