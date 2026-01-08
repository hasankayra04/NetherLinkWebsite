import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, provider, signInWithPopup } from "../js/Firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { useAuth } from "../AuthContext";
import Navbar from "../Navbar";
import { FaEnvelope, FaGoogle, FaUser, FaLock, FaRocket } from "react-icons/fa";

function Login() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleAuth = async (authFn) => {
    try {
      const result = await authFn(auth, email, password);
      if (isRegistering) {
        await updateProfile(result.user, { displayName: name.trim() });
      }

      const token = await result.user.getIdToken();
      setUser(result.user);

      await fetch("https://backend.netherlink.net/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: result.user.uid,
          email: result.user.email,
          name: result.user.displayName || name.trim(),
        }),
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Auth failed:", error.message);
      alert(error.message);
    }
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();

      const userData = {
        id: result.user.uid,
        name: result.user.displayName || name.trim(),
        email: result.user.email,
        token: await result.user.getIdToken(),
      };

      setUser(userData);

      const res = await fetch("https://backend.netherlink.net/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: userData.id,
          email: userData.email,
          name: userData.name,
        }),
      });

      if (!res.ok && res.status !== 409) {
        const err = await res.json();
        throw new Error(err.error || "Unknown error");
      }

      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error.message);
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-gray-200 font-sans">
      <Navbar />
      
      <div className="relative">
        <div className="absolute top-20 left-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        
        <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-6 py-12">
          <div className="w-full max-w-md">
            <div className="relative bg-slate-900/50 backdrop-blur-xl border border-cyan-500/30 p-8 rounded-2xl shadow-2xl shadow-cyan-500/10 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500 shadow-lg shadow-cyan-500/50"></div>
              
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-xl"></div>
                  <div className="relative rounded-full bg-cyan-500/10 p-4 border border-cyan-500/30">
                    <FaRocket className="w-8 h-8 text-cyan-400" />
                  </div>
                </div>
              </div>

              <h1 className="text-2xl font-bold text-center mb-2">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-cyan-500">
                  {isRegistering ? "Create Account" : "Welcome Back"}
                </span>
              </h1>
              
              <p className="text-center text-gray-400 text-sm mb-8">
                {isRegistering ? "Join the NetherLink community" : "Log in to access your dashboard"}
              </p>

              {!user && (
                <form className="space-y-5">
                  {isRegistering && (
                    <div>
                      <label className="block text-gray-300 text-sm font-semibold mb-2">Username</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FaUser className="text-cyan-400" />
                        </div>
                        <input
                          type="text"
                          placeholder="Enter your username"
                          className="w-full bg-slate-800/50 backdrop-blur-xl border border-cyan-500/30 rounded-xl py-3 px-4 pl-12 text-white placeholder-gray-500 focus:outline-none focus: ring-2 focus:ring-cyan-500/50 focus: border-cyan-500/50 transition-all duration-300"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          autoComplete="name"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-gray-300 text-sm font-semibold mb-2">Email</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaEnvelope className="text-cyan-400" />
                      </div>
                      <input
                        type="email"
                        placeholder="Enter your email"
                        className="w-full bg-slate-800/50 backdrop-blur-xl border border-cyan-500/30 rounded-xl py-3 px-4 pl-12 text-white placeholder-gray-500 focus:outline-none focus: ring-2 focus:ring-cyan-500/50 focus: border-cyan-500/50 transition-all duration-300"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-gray-300 text-sm font-semibold mb-2">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaLock className="text-cyan-400" />
                      </div>
                      <input
                        type="password"
                        placeholder="Enter your password"
                        className="w-full bg-slate-800/50 backdrop-blur-xl border border-cyan-500/30 rounded-xl py-3 px-4 pl-12 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all duration-300"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete={
                          isRegistering ? "new-password" : "current-password"
                        }
                      />
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-3 pt-4">
                    <button
                      type="button"
                      onClick={() =>
                        handleAuth(
                          isRegistering
                            ? createUserWithEmailAndPassword
                            : signInWithEmailAndPassword
                        )
                      }
                      className="w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover: from-cyan-400 hover:to-blue-400 text-white font-bold rounded-xl transition-all duration-300 shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 gaming-button flex items-center justify-center gap-2 hover:scale-105"
                    >
                      <FaEnvelope />
                      {isRegistering ? "Create Account" : "Log in with Email"}
                    </button>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-slate-700"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-slate-900/50 text-gray-500 font-medium">OR</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={loginWithGoogle}
                      className="w-full py-3 px-4 bg-slate-800/50 backdrop-blur-xl hover:bg-slate-700/50 text-white font-semibold rounded-xl transition-all duration-300 border border-cyan-500/30 hover:border-cyan-500/50 gaming-button flex items-center justify-center gap-2 hover:scale-105"
                    >
                      <FaGoogle />
                      Log in with Google
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsRegistering(!isRegistering)}
                      className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors mt-4 font-medium"
                    >
                      {isRegistering
                        ? "Already have an account? Log in"
                        : "Don't have an account? Create one"}
                    </button>
                  </div>
                </form>
              )}

              {user && (
                <div className="text-center py-6">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-gray-300 text-lg">
                      You're logged in! 
                    </p>
                    <p className="text-gray-500 text-sm mt-1">
                      Access your dashboard now
                    </p>
                  </div>
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold rounded-xl transition-all duration-300 shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-105"
                  >
                    Go to Dashboard
                  </button>
                </div>
              )}
              
              <div className="absolute bottom-0 right-0 w-20 h-20 border-r-2 border-b-2 border-cyan-500/20 rounded-br-2xl"></div>
              <div className="absolute top-0 left-0 w-20 h-20 border-l-2 border-t-2 border-cyan-500/20 rounded-tl-2xl"></div>
            </div>

            <p className="text-center text-gray-500 text-xs mt-6">
              Your data is encrypted and secure. We never share your information. 
            </p>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .gaming-button {
          position: relative;
          overflow: hidden;
        }
        .gaming-button::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.3), transparent);
          transition: 0.5s;
        }
        .gaming-button:hover::after {
          left: 100%;
        }
      `}</style>
    </div>
  );
}

export default Login;