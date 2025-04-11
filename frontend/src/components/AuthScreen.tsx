import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { register, login } from "../utils/api";

interface AuthScreenProps {
  onAuthenticated: (user: { username: string }) => void;
}

export default function AuthScreen({ onAuthenticated }: AuthScreenProps) {
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [signupData, setSignupData] = useState({ username: "", password: "" });
  const [loginData, setLoginData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    setLoading(true);
    try {
      const result = await register(signupData.username, signupData.password);
      if (result.message === "User registered") {
        toast({
          title: "Registration Successful",
          description: `Welcome, ${signupData.username}!`,
        });
        onAuthenticated({ username: signupData.username });
      } else {
        setError(result.message || "Registration failed.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(loginData.username, loginData.password);
      if (result.token) {
        toast({
          title: "Login Successful",
          description: `Welcome back, ${loginData.username}!`,
        });
        onAuthenticated({ username: loginData.username });
      } else {
        setError("Invalid username or password.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    type: string,
    placeholder: string,
    value: string,
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  ) => (
    <Input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
    />
  );

  return (
    <div className="max-w-md mx-auto mt-20 px-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          CipherScribe
        </h1>
        <p className="text-gray-600 text-sm mt-1 italic">
          RSA encryption/decryption made easy
        </p>
      </div>

      <div className="p-6 bg-white rounded-xl shadow-md">
        <h2 className="text-2xl font-bold mb-4 text-center">
          {mode === "signup" ? "Sign Up" : "Log In"}
        </h2>
        <form
          onSubmit={mode === "signup" ? handleSignupSubmit : handleLoginSubmit}
          className="space-y-4"
        >
          {renderInput(
            "text",
            "Username",
            mode === "signup" ? signupData.username : loginData.username,
            (e) =>
              mode === "signup"
                ? setSignupData({ ...signupData, username: e.target.value })
                : setLoginData({ ...loginData, username: e.target.value })
          )}
          {renderInput(
            "password",
            "Password (at least 6 characters long)",
            mode === "signup" ? signupData.password : loginData.password,
            (e) =>
              mode === "signup"
                ? setSignupData({ ...signupData, password: e.target.value })
                : setLoginData({ ...loginData, password: e.target.value })
          )}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading
              ? "Processing..."
              : mode === "signup"
              ? "Sign Up"
              : "Log In"}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <button
            onClick={() => {
              setMode(mode === "signup" ? "login" : "signup");
              setError("");
              setSignupData({ username: "", password: "" });
              setLoginData({ username: "", password: "" });
            }}
            className="text-sm text-blue-500 hover:underline"
            aria-label={
              mode === "signup" ? "Switch to login" : "Switch to signup"
            }
          >
            {mode === "signup"
              ? "Already have an account? Log in"
              : "Don't have an account? Sign up"}
          </button>
          <p className="text-sm text-gray-700 mt-2">
            <strong>Note:</strong> Your account is securely stored on our
            servers. You can now log in from any device.
          </p>
        </div>
      </div>
    </div>
  );
}