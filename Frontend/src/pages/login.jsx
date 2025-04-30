import React, { useState, useRef, useEffect } from 'react' // ✅ Added useEffect
import { Link, useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { handleSuccess, handleError, checkTokenValidity } from '../utils'
import 'react-toastify/ReactToastify.css'
import Navbar from '../components/Navbar'

const url = import.meta.env.VITE_API_LOGIN_URL

const Login = () => {
  const [loginInfo, setLoginInfo] = useState({
    email: '',
    password: '',
  })
  const passRef = useRef()
  const iconRef = useRef()
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  // ✅ Redirect to /quizzes if already logged in
  useEffect(() => {
    if (checkTokenValidity()) {
      navigate('/quizzes')
    }
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setLoginInfo((prev) => ({ ...prev, [name]: value }))
  }

  const showPassword = () => {
    passRef.current.type = passRef.current.type === 'password' ? 'text' : 'password'
    iconRef.current.src = iconRef.current.src.includes('/icons/hide.png')
      ? '/icons/eye.png'
      : '/icons/hide.png'
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    const { email, password } = loginInfo
    if (!email || !password) return handleError('Please fill all the fields')
    setIsLoading(true)

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginInfo),
      })

      const data = await response.json()
      const { success, message, jwtToken, email, error } = data
      setIsLoading(false)

      if (success) {
        handleSuccess('Login successful')
        localStorage.setItem('Token', jwtToken)
        localStorage.setItem('loggedInUser', email)
        setTimeout(() => navigate('/quizzes'), 2000)
      } else {
        handleError(error?.details?.[0]?.message || message)
      }
    } catch (err) {
      handleError(err.message)
    }
  }

  return (
    <div className="bg-[#0f0f0f] min-h-screen text-white">
      <Navbar />
      <div className="w-full flex justify-center items-center py-20">
        <div className="bg-[#1e1e1e] p-10 rounded-2xl shadow-2xl w-full max-w-md">
          <h1 className="text-3xl font-bold font-mono mb-8 text-center">Welcome Back</h1>
          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <div>
              <label htmlFor="email" className="block mb-1">Email</label>
              <input
                onChange={handleChange}
                type="email"
                name="email"
                value={loginInfo.email}
                placeholder="you@example.com"
                className="w-full p-3 rounded-md bg-[#2b2b2b] border border-[#444] focus:outline-none focus:ring-2 focus:ring-purple-600 placeholder:text-gray-400"
              />
            </div>
            <div className="relative">
              <label htmlFor="password" className="block mb-1">Password</label>
              <input
                onChange={handleChange}
                type="password"
                name="password"
                value={loginInfo.password}
                ref={passRef}
                placeholder="Enter your password"
                className="w-full p-3 rounded-md bg-[#2b2b2b] border border-[#444] focus:outline-none focus:ring-2 focus:ring-purple-600 placeholder:text-gray-400"
              />
              <span onClick={showPassword} className="absolute top-[2.8rem] right-3 cursor-pointer">
                <img
                  ref={iconRef}
                  width={24}
                  src="/icons/eye.png"
                  alt="Toggle password visibility"
                  className='invert'
                />
              </span>
            </div>
            <button
              type="submit"
              className="bg-purple-700 hover:bg-purple-600 text-white py-2 rounded-md font-medium transition-all"
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-5 w-5 mx-auto border-b-2 border-white rounded-full"
                  viewBox="0 0 24 24"
                ></svg>
              ) : (
                'Login'
              )}
            </button>
            <div className="text-center">
              <span>Don't have an account? </span>
              <Link to="/signup" className="text-purple-500 underline hover:text-purple-400">
                Sign Up
              </Link>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer position="top-center" autoClose={2000} theme="dark" />
    </div>
  )
}

export default Login
