import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import MainAdmin from "../layouts/MainAdmin";

export default function CreatePoli() {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        title: "",
        description: "",
        choices: [{ choice: "" }, { choice: "" }],
    });

    const handleChoiceChange = (index, value) => {
        const updated = [...form.choices];
        updated[index].choice = value;
        setForm({ ...form, choices: updated });
    };

    const addChoice = () => {
        setForm({
            ...form,
            choices: [...form.choices, { choice: "" }],
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await api.post("/pool", form);
            alert("Polling created");
            navigate("/pool");
        } catch (err) {
            alert(err.response?.data?.message);
        }
    };

    return (
        <>
            <MainAdmin />

            <div className="container mt-4">
                <h4>Create Polling</h4>

                <form onSubmit={handleSubmit}>
                    <input
                        className="form-control mb-2"
                        placeholder="Title"
                        value={form.title}
                        onChange={(e) =>
                            setForm({ ...form, title: e.target.value })
                        }
                    />

                    <textarea
                        className="form-control mb-3"
                        placeholder="Description"
                        value={form.description}
                        onChange={(e) =>
                            setForm({
                                ...form,
                                description: e.target.value,
                            })
                        }
                    />

                    <h6>Choices</h6>
                    {form.choices.map((c, i) => (
                        <input
                            key={i}
                            className="form-control mb-2"
                            placeholder={`Choice ${i + 1}`}
                            value={c.choice}
                            onChange={(e) =>
                                handleChoiceChange(i, e.target.value)
                            }
                        />
                    ))}

                    <button
                        type="button"
                        className="btn btn-outline-primary btn-sm mb-3"
                        onClick={addChoice}
                    >
                        + Add Choice
                    </button>

                    <br />

                    <button className="btn btn-success">
                        Save Polling
                    </button>
                </form>
            </div>
        </>
    );
}
