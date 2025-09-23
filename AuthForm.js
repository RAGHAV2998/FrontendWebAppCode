import React, { useState } from "react";
import axios from "axios";
import "./AuthForm.css";
import config from './config';
import { FiMail, FiLock } from 'react-icons/fi';

export default function AuthForm({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${config.API_BASE_URL}/login`, { email, password });
      setMessage(response.data.message);
      if (response.data.success) {
        const username = email.split("@")[0];
        onLoginSuccess(username);
      }
    } catch (error) {
      console.error("Login error:", error);
      setMessage(error.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage("");
    
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
    
    if (password.length < 6) {
      setMessage("Password must be at least 6 characters long");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${config.API_BASE_URL}/signup`, { email, password });
      setMessage(response.data.message);
      if (response.data.success) {
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setTimeout(() => setIsLogin(true), 1500); // Switch to login after successful signup
      }
    } catch (error) {
      console.error("Signup error:", error);
      setMessage(error.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-form-container">
        <div className="app-logo">
          <div className="logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1>Aavyooh</h1>
          <p>Supply Chain Intelligence Platform</p>
        </div>

        <div className="form-toggle">
          <button className={isLogin ? "active" : ""} onClick={() => setIsLogin(true)}>
            Login
          </button>
          <button className={!isLogin ? "active" : ""} onClick={() => setIsLogin(false)}>
            Sign Up
          </button>
        </div>

        {isLogin ? (
          <form className="form" onSubmit={handleLogin}>
            <h2>Login to Your Account</h2>
            <div className="input-group">
              <span className="input-icon"><FiMail /></span>
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="input-group">
              <span className="input-icon"><FiLock /></span>
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading && <span className="spinner"></span>}
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form className="form" onSubmit={handleSignup}>
            <h2>Create an Account</h2>
            <div className="input-group">
              <span className="input-icon"><FiMail /></span>
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="input-group">
              <span className="input-icon"><FiLock /></span>
              <input type="password" placeholder="Password (min. 6 characters)" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="input-group">
             <span className="input-icon"><FiLock /></span>
              <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>
            <button type="submit" className="submit-button" disabled={isLoading}>
              {isLoading && <span className="spinner"></span>}
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}
        
        {message && (
          <div className={`message ${message.includes("failed") || message.includes("match") || message.includes("6 characters") ? "error" : "success"}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}