import React, { useEffect, useState } from "react";
import Main from "./layouts/Main";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Dashboard() {
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

  useEffect(() => {
    fetchPolls();
  }, []);

  return (
    <>
      <Main />

      <div className="container mt-4">
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
                      onClick={() => navigate(`/user/pool/${poll.id}`)}
                    >
                      Detail
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
