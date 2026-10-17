import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from 'react-router-dom';
import { AuthShell, Field, FormError } from "../Components/AuthShell";
import { Spinner } from "../Components/ui";

const errorMessage = (data) => data?.msg || data?.error || data?.err;

const RetroSigninPage = () => {
  const navigate = useNavigate();

  const [userdetails, setuserdetails] = useState({ username: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setuserdetails((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_PORT}/new/user/signin`, userdetails);

      if (response.data.success === false) {
        setError(errorMessage(response.data) || "Sign in failed");
      } else {
        localStorage.setItem('token', `bearer ${response.data.jwt_token}`);
        navigate('/home');
      }
    } catch (err) {
      console.error("Error during sign in:", err);
      setError(errorMessage(err.response?.data) || err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Sign in"
      subtitle="Welcome back. Pick up where you left off."
      footer={<>New to CodeArcade? <Link to="/user/register" className="focus-ring rounded font-medium text-accent hover:underline">Create an account</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          id="username"
          label="Email"
          type="email"
          value={userdetails.username}
          onChange={handleOnChange}
          placeholder="you@example.com"
          autoComplete="email"
          autoFocus
          required
        />
        <Field
          id="password"
          label="Password"
          type="password"
          value={userdetails.password}
          onChange={handleOnChange}
          placeholder="Your password"
          autoComplete="current-password"
          required
        />

        <FormError message={error} />

        <button type="submit" disabled={isLoading} className="btn btn-primary btn-lg mt-2 w-full">
          {isLoading ? <><Spinner /> Signing in…</> : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
};

export default RetroSigninPage;
