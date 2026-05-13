import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import MainAdmin from "../layouts/MainAdmin";

export default function UserList() {
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
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

    const fetchUsers = async (page = 1) => {
        setLoading(true);
        setError("");
        try {
            const res = await api.get("/users", {
                params: {
                    search: search,
                    page: page,
                    per_page: 10,
                    sort_by: sortBy,
                    sort_order: sortOrder
                }
            });
            setUsers(res.data.content || []);
            setPagination(res.data.pagination || {
                current_page: 1,
                last_page: 1,
                per_page: 10,
                total: 0,
                from: 0,
                to: 0
            });
        } catch (err) {
            if (err.response?.status === 403) {
                setError("You are not the administrator");
            } else {
                setError("Failed to load user data");
            }
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;

        try {
            await api.delete(`/user/${id}`);
            fetchUsers(pagination.current_page);
            alert("User deleted successfully");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to delete user");
        }
    };

    useEffect(() => {
        fetchUsers(1);
    }, [search, sortBy, sortOrder]);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        fetchUsers(1);
    };

    const handleClearSearch = () => {
        setSearch("");
        fetchUsers(1);
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= pagination.last_page) {
            fetchUsers(page);
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
                    <td><div className="placeholder-glow"><span className="placeholder col-6"></span></div></td>
                    <td><div className="placeholder-glow"><span className="placeholder col-10"></span></div></td>
                    <td><div className="placeholder-glow"><span className="placeholder col-10"></span></div></td>
                    <td><div className="placeholder-glow"><span className="placeholder col-12"></span></div></td>
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
            <nav aria-label="User pagination">
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
                        <h3 className="mb-1">👥 User List</h3>
                        <p className="text-muted mb-0">
                            Total {pagination.total} users
                        </p>
                    </div>
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-primary"
                            onClick={() => navigate("/dashboard/admin")}
                        >
                            👑 Admin List
                        </button>
                        <button
                            className="btn btn-success"
                            onClick={() => navigate("/users/list")}
                        >
                            👥 User List
                        </button>
                    </div>
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
                                            placeholder="Search by username or division..."
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
                                        <option value="username-asc">Username A-Z</option>
                                        <option value="username-desc">Username Z-A</option>
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

                {/* Users Table */}
                <div className="card shadow-sm">
                    <div className="card-body p-0">
                        <div className="table-responsive">
                            <table className="table table-hover mb-0">
                                <thead className="table-primary">
                                    <tr>
                                        <th
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleSort('username')}
                                        >
                                            Username {getSortIcon('username')}
                                        </th>
                                        <th>Division</th>
                                        <th
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleSort('created_at')}
                                        >
                                            Created {getSortIcon('created_at')}
                                        </th>
                                        <th
                                            style={{ cursor: 'pointer' }}
                                            onClick={() => handleSort('updated_at')}
                                        >
                                            Updated {getSortIcon('updated_at')}
                                        </th>
                                        <th width="180">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <LoadingSkeleton />
                                    ) : users.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="text-center py-5">
                                                <div className="text-muted">
                                                    <h5>📭 No users found</h5>
                                                    <p className="mb-0">
                                                        {search
                                                            ? `No results for "${search}". Try different keywords.`
                                                            : "There are no users registered."}
                                                    </p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map((user, index) => (
                                            <tr key={user.id || index}>
                                                <td>
                                                    <span className="fw-bold">{user.username}</span>
                                                    <br />
                                                    <small className="text-muted">ID: {user.id}</small>
                                                </td>
                                                <td>
                                                    {user.division ? (
                                                        <span className="badge bg-success">
                                                            {user.division}
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted">-</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <small>
                                                        {new Date(user.created_at).toLocaleString('id-ID', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </small>
                                                </td>
                                                <td>
                                                    <small>
                                                        {new Date(user.updated_at).toLocaleString('id-ID', {
                                                            year: 'numeric',
                                                            month: 'short',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </small>
                                                </td>
                                                <td>
                                                    <div className="flex d-flex">
                                                        <button
                                                            className="btn btn-warning me-2 btn-sm"
                                                            onClick={() => navigate(`/user/list/edit/${user.id}`)}
                                                            title="Edit User"
                                                        >
                                                            ✏️ Edit
                                                        </button>
                                                        <button
                                                            className="btn btn-danger btn-sm"
                                                            onClick={() => handleDelete(user.id)}
                                                            title="Delete User"
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
                    {!loading && users.length > 0 && (
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