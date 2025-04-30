import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import { ToastContainer } from 'react-toastify'
import { handleSuccess, handleError } from '../utils'
import { useNavigate } from 'react-router-dom'
import 'react-toastify/dist/ReactToastify.css'

const Upload = () => {
  const url = import.meta.env.VITE_API_UPLOAD_URL
  const navigate = useNavigate()
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [uploadInfo, setUploadInfo] = useState({
    file: null,
    topics: '',
    description: '',
    difficulty: 'easy',
    numQuestions: 5,
  })
  const [errors, setErrors] = useState({
    file: false,
    numQuestions: false
  })

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileName(file?.name || '');
    setUploadInfo(prev => ({ ...prev, file }));
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUploadInfo(prev => ({ ...prev, [name]: value }));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { file, numQuestions } = uploadInfo;
    let newErrors = {};

    if (!file) newErrors.file = "Please upload a file";
    if (!numQuestions) {
      newErrors.numQuestions = "Please enter number of questions";
    } else if (numQuestions < 1 || numQuestions > 50) {
      newErrors.numQuestions = "Number of questions should be between 1 and 50";
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('file', uploadInfo.file);
      formData.append('topics', uploadInfo.topics);
      formData.append('description', uploadInfo.description);
      formData.append('difficulty', uploadInfo.difficulty);
      formData.append('numQuestions', uploadInfo.numQuestions);

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          "Authorization": localStorage.getItem("Token"),
        },
        body: formData,
      });

      const data = await response.json();
      navigate('/quiz', { state: { quiz: data.quiz } });
      handleSuccess('Quiz generated successfully!');
    } catch (error) {
      console.error(error);
      handleError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-[#0f0f0f] min-h-screen text-white">
      <Navbar />
      <div className="w-full flex justify-center items-center py-20">
        <form className="bg-[#1e1e1e] p-10 rounded-2xl shadow-2xl w-full max-w-xl flex flex-col gap-6" onSubmit={handleSubmit}>
          <h1 className="text-3xl font-bold font-mono mb-4 text-center">Upload Notes to Generate Quiz</h1>

          <div>
            <label className="block mb-1">Upload File (PDF, DOCX, TXT) <span className="text-red-500">*</span></label>
            <input
              type="file"
              name="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
              className="w-full p-2 rounded-md bg-[#2b2b2b] border border-[#444] text-gray-200"
            />
            {fileName && (
              <p className="text-sm mt-1 text-gray-400">Selected: {fileName}</p>
            )}
            {errors.file && (
              <p className="text-red-400 text-sm mt-1">{errors.file}</p>
            )}
          </div>

          <div>
            <label className="block mb-1">Difficulty <span className="text-red-500">*</span></label>
            <select
              name="difficulty"
              onChange={handleChange}
              value={uploadInfo.difficulty}
              className="w-full p-3 rounded-md bg-[#2b2b2b] border border-[#444] text-gray-300"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block mb-1">Number of Questions <span className="text-red-500">*</span></label>
            <input
              type="number"
              name="numQuestions"
              min={1}
              max={50}
              onChange={handleChange}
              value={uploadInfo.numQuestions}
              className="w-full p-3 rounded-md bg-[#2b2b2b] border border-[#444] text-gray-200"
            />
            {errors.numQuestions && (
              <p className="text-red-400 text-sm mt-1">{errors.numQuestions}</p>
            )}
          </div>

          <div>
            <label className="block mb-1">Topics / Keywords</label>
            <input
              type="text"
              name="topics"
              onChange={handleChange}
              value={uploadInfo.topics}
              placeholder="e.g. Photosynthesis, Newton's Laws"
              className="w-full p-3 rounded-md bg-[#2b2b2b] border border-[#444] placeholder:text-gray-400"
            />
          </div>

          <div>
            <label className="block mb-1">Description (For more accurate generation)</label>
            <input
              type="text"
              name="description"
              onChange={handleChange}
              value={uploadInfo.description}
              placeholder="e.g. Theory based questions, Solving problems"
              className="w-full p-3 rounded-md bg-[#2b2b2b] border border-[#444] placeholder:text-gray-400"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`bg-purple-700 hover:bg-purple-600 text-white py-2 rounded-md font-medium transition-all flex justify-center items-center gap-2 ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Generating...
              </>
            ) : (
              'Generate Quiz'
            )}
          </button>
        </form>
      </div>
      <ToastContainer position="top-center" autoClose={2000} theme="dark" />
    </div>
  )
}

export default Upload;
