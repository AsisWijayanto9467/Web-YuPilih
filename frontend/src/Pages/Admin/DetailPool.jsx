import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import MainAdmin from "../layouts/MainAdmin";

export default function DetailPool() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [poll, setPoll] = useState(null);
    const [results, setResults] = useState([]);
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("results");
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [detailRes, resultRes, reportRes] = await Promise.all([
                    api.get(`/pool/${id}`),
                    api.get(`/pool/${id}/result`),
                    api.get(`/pool/${id}/report`)
                ]);

                setPoll(detailRes.data);
                setResults(resultRes.data.result);
                setReport(reportRes.data);
            } catch (err) {
                alert(err.response?.data?.message || "Poll not found");
                navigate("/pool");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, navigate]);

    const handleDownloadCSV = async () => {
        try {
            setDownloading(true);
            const response = await api.get(`/pool/${id}/report/csv`, {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `poll-report-${id}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.log(err);
            alert("Failed to download CSV");
        } finally {
            setDownloading(false);
        }
    };

    const handleDownloadPDF = async () => {
        try {
            setDownloading(true);
            const response = await api.get(`/pool/${id}/report/pdf`, {
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `poll-report-${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            alert("Failed to download PDF. Make sure PDF package is installed.");
            console.log(err);
        } finally {
            setDownloading(false);
        }
    };

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

                {/* POLL DETAIL */}
                <div className="card mb-4 shadow-sm">
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start">
                            <div>
                                <h4 className="card-title">{poll.title}</h4>
                                <p className="card-text text-muted">
                                    {poll.description}
                                </p>
                            </div>
                            <div className="btn-group">
                                <button 
                                    className="btn btn-outline-success btn-sm"
                                    onClick={handleDownloadCSV}
                                    disabled={downloading}
                                >
                                    📥 CSV
                                </button>
                                <button 
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={handleDownloadPDF}
                                    disabled={downloading}
                                >
                                    📥 PDF
                                </button>
                            </div>
                        </div>

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

                {/* TABS */}
                <ul className="nav nav-tabs mb-3">
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === "results" ? "active" : ""}`}
                            onClick={() => setActiveTab("results")}
                        >
                            📊 Results
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === "voters" ? "active" : ""}`}
                            onClick={() => setActiveTab("voters")}
                        >
                            👥 Voters List
                        </button>
                    </li>
                    <li className="nav-item">
                        <button
                            className={`nav-link ${activeTab === "summary" ? "active" : ""}`}
                            onClick={() => setActiveTab("summary")}
                        >
                            📈 Summary
                        </button>
                    </li>
                </ul>

                {/* RESULTS TAB */}
                {activeTab === "results" && (
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h5 className="mb-3">📊 Polling Results</h5>

                            {results.length === 0 ? (
                                <p className="text-muted">No votes yet.</p>
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
                )}

                {/* VOTERS TAB */}
                {activeTab === "voters" && report && (
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h5 className="mb-3">👥 Voters List</h5>
                            
                            {report.voters.length === 0 ? (
                                <p className="text-muted">No voters yet.</p>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-bordered table-hover">
                                        <thead className="table-primary">
                                            <tr>
                                                <th>#</th>
                                                <th>Username</th>
                                                <th>Division</th>
                                                <th>Choice</th>
                                                <th>Voted At</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {report.voters.map((voter, index) => (
                                                <tr key={voter.vote_id}>
                                                    <td>{index + 1}</td>
                                                    <td>{voter.username}</td>
                                                    <td>{voter.division}</td>
                                                    <td>
                                                        <span className="badge bg-info">
                                                            {voter.choice}
                                                        </span>
                                                    </td>
                                                    <td>{new Date(voter.voted_at).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* SUMMARY TAB */}
                {activeTab === "summary" && report && (
                    <div className="card shadow-sm">
                        <div className="card-body">
                            <h5 className="mb-3">📈 Summary</h5>
                            
                            <div className="row mb-4">
                                <div className="col-md-4">
                                    <div className="card bg-primary text-white">
                                        <div className="card-body text-center">
                                            <h6>Total Voters</h6>
                                            <h2>{report.summary.total_voters}</h2>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="card bg-success text-white">
                                        <div className="card-body text-center">
                                            <h6>Total Choices</h6>
                                            <h2>{report.summary.total_choices}</h2>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="card bg-info text-white">
                                        <div className="card-body text-center">
                                            <h6>Divisions Participated</h6>
                                            <h2>{report.summary.total_divisions}</h2>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Votes per Division */}
                            {report.votes_per_division.length > 0 && (
                                <>
                                    <h6>Votes by Division</h6>
                                    <table className="table table-bordered">
                                        <thead className="table-primary">
                                            <tr>
                                                <th>Division</th>
                                                <th>Total Votes</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {report.votes_per_division.map((div, index) => (
                                                <tr key={index}>
                                                    <td>{div.division_name}</td>
                                                    <td>{div.total_votes}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}