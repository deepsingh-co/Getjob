import react from 'react'
import { FaRobot } from "react-icons/fa";
import { AiFillOpenAI } from "react-icons/ai";
import { motion } from "motion/react"
import { FcGoogle } from "react-icons/fc";
import {signInWithPopup} from "firebase/auth"
import { auth, provider } from '../utils/firebase';
import axios from 'axios';
import { ServerUrl } from '../App';
import { useDispatch } from 'react-redux';
import { setUserData } from '../redux/userSlice.js';

function Auth() {
    const dispatch = useDispatch()

    const handleGoogleAuth = async () =>{
        try{
            const response = await signInWithPopup(auth, provider);
            let User = response.user
            let name = User.displayName
            let email = User.email
            const result = await axios.post(ServerUrl + "/api/auth/google",
                 { name, email }, { withCredentials: true })
                 dispatch(setUserData(result.data))
                 
        }catch(err){
            console.error(err);
            dispatch(setUserData(null))
        }
    }

  return (
    <div className = "w-full min-h-screen BG-[#f5f5f5] flex items-center justify-center justify-center px-6 py-20">
        <div className = "w-full max-w-md p-8 bg-white rounded-3xl shadow-2xl border border-gray-200">
            <div className = "flex items-center justify-center mb-6 gap-3">
                <div className = "bg-black text-white p-2 rounded-lg">
                    <FaRobot />
                </div>
        <h2 className = "font-semibold text-lg">Interview.hai</h2>
    </div>
    <h1 className = "text-2xl  md:text-3xl text-center leading-snug font-semibold mb-4">Continue With
        <span className = "bg-green-100 text-green-600 px-3 py-1 rounded-full inline-flex items-center gap-2">
            <AiFillOpenAI />
            AI Smart Interview
            
        </span>
    </h1>
    <p className = "text-center text-sm text-gray-500 md:text-base leading-relaxed mb-8">Get your dream job with AI Smart Interview , and unlock your full potential.
    </p>

    <motion.button
    onClick={handleGoogleAuth}
    whileHover={{ opacity:0.8,scale: 1.05 }}
    whileTap={{ opacity:1,scale: 0.95 }} 
    className = "w-full flex items-center justify-center gap-3 py-3 bg-black text-white rounded-full shadow-md">
        <FcGoogle size={24} />
        Continue with Google Account
        
    </motion.button>
    </div>

    </div>
  )
}

export default Auth