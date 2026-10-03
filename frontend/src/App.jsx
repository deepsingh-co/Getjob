import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Auth from './pages/Auth'
import PostJob from './pages/PostJob'
import CandidateProfile from './pages/CandidateProfile'
import { useEffect } from 'react'
import axios from 'axios'
import { useDispatch } from 'react-redux'
import { setUserData } from './redux/userSlice.js'

export const ServerUrl = "http://localhost:8000"

function App() {
  const dispatch = useDispatch()
  useEffect(() =>{
    const getUser = async ()=>{
      try {
        const result = await axios.get(ServerUrl + "/api/user/current-user" , {withCredentials: true})
        dispatch(setUserData(result.data))
      } catch (error) {
        console.error("Error fetching user data:", error)
        dispatch(setUserData(null)) 
      }
    }
    getUser()

  }, [dispatch])
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/post-job" element={<PostJob />} />
      <Route path="/profile" element={<CandidateProfile />} />
    </Routes>
  )
}

export default App