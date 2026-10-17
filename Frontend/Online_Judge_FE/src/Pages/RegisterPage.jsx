import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthShell, Field, FormError } from "../Components/AuthShell";
import { Spinner } from "../Components/ui";

const errorMessage = (data) => data?.msg || data?.error || data?.err;

const RegisterPage = () => {
  const navigate = useNavigate();

  const [userDetails, setUserDetails] = useState({
    username: "",
    password: "",
    firstname: "",
    lastName: "",
    dob: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // generic change handler for every input
  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_PORT}/new/user/register`, userDetails);

      if (response.data.success === false) {
        setError(errorMessage(response.data) || "Registration failed");
      } else {
        localStorage.setItem('token', `bearer: ${response.data.jwt_token}`);
        navigate('/home');
      }
    } catch (err) {
      console.error("Error during register:", err);
      setError(errorMessage(err.response?.data) || err.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Save your solutions and track your progress."
      footer={<>Already have an account? <Link to="/user/signin" className="focus-ring rounded font-medium text-accent hover:underline">Sign in</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Field
            id="firstname"
            label="First name"
            type="text"
            value={userDetails.firstname}
            onChange={handleOnChange}
            autoComplete="given-name"
            autoFocus
            required
          />
          <Field
            id="lastName"
            label="Last name"
            type="text"
            value={userDetails.lastName}
            onChange={handleOnChange}
            autoComplete="family-name"
          />
        </div>
        <Field
          id="dob"
          label="Date of birth"
          type="date"
          value={userDetails.dob}
          onChange={handleOnChange}
          autoComplete="bday"
          required
        />
        <Field
          id="username"
          label="Email"
          type="email"
          value={userDetails.username}
          onChange={handleOnChange}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
        <Field
          id="password"
          label="Password"
          type="password"
          value={userDetails.password}
          onChange={handleOnChange}
          placeholder="Create a password"
          autoComplete="new-password"
          required
        />

        <FormError message={error} />

        <button type="submit" disabled={isLoading} className="btn btn-primary btn-lg mt-2 w-full">
          {isLoading ? <><Spinner /> Creating account…</> : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
};

export default RegisterPage;
