import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import Main from "../layouts/Main";

export default function UserVotePool() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [poll, setPoll] = useState(null);
    const [results, setResults] = useState([]);
    const [selected, setSelected] = useState("");
    const [loading, setLoading] = useState(true);
    const [voting, setVoting] = useState(false);
    const [hasVoted, setHasVoted] = useState(false);


    const fetchData = useCallback(async () => {
        try {
            const [detail, result, check] = await Promise.all([
                api.get(`/pool/${id}`),
                api.get(`/pool/${id}/result`),
                api.get(`/pool/${id}/check-vote`)
            ]);

            setPoll(detail.data);
            setResults(result.data.result);
            setHasVoted(check.data.hasVoted);
        } catch {
            alert("Poll not found");
            navigate("/pool");
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);



    useEffect(() => {
        fetchData();
    }, [fetchData]);


    const handleVote = async () => {
        if (!selected) {
            alert("Please select a choice");
            return;
        }

        try {
            setVoting(true);
            await api.post(`/pool/${id}/vote`, { id: selected });
            alert("Vote submitted");
            fetchData(); 
        } catch (err) {
            alert(err.response?.data?.message || "Vote failed");
        } finally {
            setVoting(false);
        }
    };

    if (loading) return <p className="text-center mt-4">Loading...</p>;
    if (!poll) return null;

    return (
        <>
            <Main />
            <div className="container mt-4">
                <button
                    className="btn btn-secondary mb-3"
                    onClick={() => navigate("/pool")}
                >
                    ← Back
                </button>

                {/* DETAIL */}
                <div className="card shadow-sm mb-4">
                    <div className="card-body">
                        <h4>{poll.title}</h4>
                        <p className="text-muted">{poll.description}</p>

                        <h6 className="mt-3">Choose one:</h6>
                        {poll.choice.map(c => (
                            <div className="form-check" key={c.id}>
                                <input
                                    className="form-check-input"
                                    type="radio"
                                    name="choice"
                                    value={c.id}
                                    disabled={hasVoted}
                                    onChange={() => setSelected(c.id)}
                                />
                                <label className="form-check-label">
                                    {c.choice}
                                </label>
                            </div>
                        ))}

                        <button
                            className="btn btn-success mt-3"
                            disabled={voting || hasVoted}
                            onClick={handleVote}
                        >
                            {hasVoted ? "You have already voted"
                                : voting
                                ? "Submitting..."
                                : "Submit Vote"}
                        </button>
                    </div>
                </div>

                {/* RESULT */}
                <div className="card shadow-sm">
                    <div className="card-body">
                        <h5 className="mb-3">📊 Polling Result</h5>

                        {results.map(r => (
                            <div key={r.id} className="mb-3">
                                <div className="d-flex justify-content-between">
                                    <strong>{r.choice}</strong>
                                    <span>{r.percentage}%</span>
                                </div>
                                <div className="progress">
                                    <div
                                        className="progress-bar bg-success"
                                        style={{ width: `${r.percentage}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}
