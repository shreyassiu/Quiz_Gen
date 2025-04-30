import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { checkTokenValidity } from "../utils";

const myQuizzes = () => {
    const [quizzes, setQuizzes] = useState([]);
    const navigate = useNavigate();
    const url = import.meta.env.VITE_API_UPLOAD_URL;

    useEffect(() => {
        if(!checkTokenValidity()){
            alert("Log in to see your quizzes.");
            navigate("/login");
            return;
        }
        const fetchQuizzes = async () => {
            const email = localStorage.getItem("loggedInUser");
            const token = localStorage.getItem("Token");
            
            const res = await fetch(url, {
                headers: {
                  Authorization: token,
                  Email: email,
                },
              })
            const data = await res.json();
            console.log(data);
            setQuizzes(data);
        };

        fetchQuizzes();
    }, []);

    return (
        <div>
            <Navbar/>
            <div className="bg-[#0f0f0f] min-h-screen text-white p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Your Quizzes</h1>
                    <button
                        onClick={() => navigate("/upload")}
                        className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded"
                    >
                        + Create New Quiz
                    </button>
                </div>

                {quizzes.length === 0 ? (
                    <p className="text-gray-400">No quizzes found. Create one now!</p>
                ) : (
                    <ul className="space-y-4">
                        {quizzes.map((quiz, idx) => (
                            <li
                                key={quiz._id}
                                className="bg-[#1e1e1e] p-4 rounded shadow border border-[#333]"
                            >
                                <h2 className="font-semibold">Quiz #{idx + 1} {quiz.quizTitle}</h2>
                                <p className="text-sm text-gray-400">
                                    Created: {new Date(quiz.createdAt).toLocaleString()}
                                </p>
                                <button
                                    onClick={() => navigate('/quiz', { state: { quiz: quiz } })}
                                    className="mt-2 underline text-purple-400 text-sm"
                                >
                                    View Quiz
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default myQuizzes;
