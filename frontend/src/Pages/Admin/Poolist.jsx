import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import MainAdmin from "../layouts/MainAdmin";

export default function Poolist() {
    const navigate = useNavigate();
    const [polls, setPolls] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
        from: 0,
        to: 0
    });
    const [sortBy, setSortBy] = useState("created_at");
    const [sortOrder, setSortOrder] = useState("desc");

    const fetchPolls = async (page = 1) => {
        setLoading(true);
        setError("");
        try {
            const res = await api.get("/pool", {
                params: {
                    search: search,
                    page: page,
                    per_page: 10,
                    sort_by: sortBy,
                    sort_order: sortOrder
                }
            });
            setPolls(res.data.contents || []);
            setPagination(res.data.pagination || {
                current_page: 1,
                last_page: 1,
                per_page: 10,
                total: 0,
                from: 0,
                to: 0
            });
        } catch (err) {
            console.error("Error fetching polls:", err);
            setError("Failed to load polling data");
            setPolls([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this polling?")) return;

        try {
            await api.delete(`/pool/${id}`);
            fetchPolls(pagination.current_page);
            alert("Polling deleted successfully");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete polling");
        }
    };

    useEffect(() => {
        fetchPolls(1);
    }, [search, sortBy, sortOrder]);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchPolls(1);
    };

    const handleClearSearch = () => {
        setSearch("");
        fetchPolls(1);
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= pagination.last_page) {
            fetchPolls(page);
        }
    };

    const handleSort = (field) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortBy(field);
            setSortOrder("asc");
        }
    };

    const getSortIcon = (field) => {
        if (sortBy !== field) return "↕️";
        return sortOrder === "asc" ? "↑" : "↓";
    };

    // Loading skeleton
    const LoadingSkeleton = () => (
        <>
            {[1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                    <td><div className="placeholder-glow"><span className="placeholder col-8"></span></div></td>
                    <td><div className="placeholder-glow"><span className="placeholder col-12"></span></div></td>
                    <td><div className="placeholder-glow"><span className="placeholder col-6"></span></div></td>
                </tr>
            ))}
        </>
    );

    // Pagination component
    const Pagination = () => {
        if (pagination.last_page <= 1) return null;

        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, pagination.current_page - Math.floor(maxVisible / 2));
        let end = Math.min(pagination.last_page, start + maxVisible - 1);

        if (end - start + 1 < maxVisible) {
            start = Math.max(1, end - maxVisible + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        return (
            <nav aria-label="Poll pagination">
                <ul className="pagination justify-content-center mb-0">
                    <li className={`page-item ${pagination.current_page === 1 ? 'disabled' : ''}`}>
                        <button
                            className="page-link"
                            onClick={() => handlePageChange(pagination.current_page - 1)}
                            disabled={pagination.current_page === 1}
                        >
                            Previous
                        </button>
                    </li>
                    
                    {start > 1 && (
                        <>
                            <li className="page-item">
                                <button className="page-link" onClick={() => handlePageChange(1)}>1</button>
                            </li>
                            {start > 2 && <li className="page-item disabled"><span className="page-link">...</span></li>}
                        </>
                    )}
                    
                    {pages.map(page => (
                        <li
                            key={page}
                            className={`page-item ${page === pagination.current_page ? 'active' : ''}`}
                        >
                            <button
                                className="page-link"
                                onClick={() => handlePageChange(page)}
                            >
                                {page}
                            </button>
                        </li>
                    ))}
                    
                    {end < pagination.last_page && (
                        <>
                            {end < pagination.last_page - 1 && (
                                <li className="page-item disabled"><span className="page-link">...</span></li>
                            )}
                            <li className="page-item">
                                <button
                                    className="page-link"
                                    onClick={() => handlePageChange(pagination.last_page)}
                                >
                                    {pagination.last_page}
                                </button>
                            </li>
                        </>
                    )}
                    
                    <li className={`page-item ${pagination.current_page === pagination.last_page ? 'disabled' : ''}`}>
                        <button
                            className="page-link"
                            onClick={() => handlePageChange(pagination.current_page + 1)}
                            disabled={pagination.current_page === pagination.last_page}
                        >
                            Next
                        </button>
                    </li>
                </ul>
            </nav>
        );
    };

    return (
        <>
            <MainAdmin />

            <div className="container mt-4">
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h3 className="mb-1">📊 Polling List</h3>
                        <p className="text-muted mb-0">
                            Total {pagination.total} polls available
                        </p>
                    </div>
                    <button
                        className="btn btn-success"
                        onClick={() => navigate("/pool/create")}
                    >
                        ➕ Create Polling
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="card shadow-sm mb-4">
                    <div className="card-body">
                        <form onSubmit={handleSearchSubmit}>
                            <div className="row g-3">
                                <div className="col-md-8">
                                    <div className="input-group">
                                        <span className="input-group-text bg-white">
                                            🔍
                                        </span>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Search by title or description..."
                                            value={search}
                                            onChange={handleSearchChange}
                                        />
                                        {search && (
                                            <button
                                                type="button"
                                                className="btn btn-outline-secondary"
                                                onClick={handleClearSearch}
                                            >
                                                ✕ Clear
                                            </button>
                                        )}
                                        <button type="submit" className="btn btn-primary">
                                            Search
                                        </button>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <select
                                        className="form-select"
                                        value={`${sortBy}-${sortOrder}`}
                                        onChange={(e) => {
                                            const [field, order] = e.target.value.split('-');
                                            setSortBy(field);
                                            setSortOrder(order);
                                        }}
                                    >
                                        <option value="created_at-desc">Newest First</option>
                                        <option value="created_at-asc">Oldest First</option>
                                        <option value="title-asc">Title A-Z</option>
                                        <option value="title-desc">Title Z-A</option>
                                    </select>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                        {error}
                        <button
                            type="button"
                            className="btn-close"
                            onClick={() => setError("")}
                        ></button>
                    </div>
                )}

                {/* Polls Table */}
                <div className="card shadow-sm">
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-primary">
                                    <tr>
                                        <th
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleSort('title')}
                                        >
                                            Title {getSortIcon('title')}
                                        </th>
                                        <th>Description</th>
                                        <th
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleSort('created_at')}
                                            width="180"
                                        >
                                            Created {getSortIcon('created_at')}
                                        </th>
                                        <th width="200">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <LoadingSkeleton />
                                    ) : polls.length === 0 ? (
                                        <tr>
                                            <td colSpan="4" className="text-center py-5">
                                                <div className="text-muted">
                                                    <h5>📭 No polls found</h5>
                                                    <p className="mb-0">
                                                        {search
                                                            ? `No results for "${search}". Try different keywords.`
                                                            : "There are no polls available. Create a new one!"}
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        polls.map((poll, index) => (
                                            <tr key={poll.id || index}>
                                                <td>
                                                    <span className="fw-bold">{poll.title}</span>
                                                    <br />
                                                    <small className="text-muted">ID: {poll.id}</small>
                                                </td>
                                                <td>
                                                    <small className="text-muted">
                                                        {poll.description?.length > 100
                                                            ? `${poll.description.substring(0, 100)}...`
                                                            : poll.description}
                                                    </small>
                                                </td>
                                                <td>
                                                    <small>
                                                        {poll.created_at
                                                            ? new Date(poll.created_at).toLocaleString('id-ID', {
                                                                year: 'numeric',
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })
                                                            : '-'}
                                                    </small>
                                                </td>
                                                <td>
                                                    <div className="btn-group btn-group-sm">
                                                        <button
                                                            className="btn btn-info me-2"
                                                            onClick={() =>
                                                                navigate(`/pool/${poll.id}`)
                                                            }
                                                            title="View Details"
                                                        >
                                                            👁️ Detail
                                                        </button>
                                                        <button
                                                            className="btn btn-danger"
                                                            onClick={() =>
                                                                handleDelete(poll.id)
                                                            }
                                                            title="Delete Poll"
                                                        >
                                                            🗑️ Delete
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    {/* Pagination Footer */}
                    {!loading && polls.length > 0 && (
                        <div className="card-footer bg-white">
                            <div className="d-flex justify-content-between align-items-center">
                                <small className="text-muted">
                                    Showing {pagination.from} to {pagination.to} of {pagination.total} results
                                </small>
                                <Pagination />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}