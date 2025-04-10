const API = "http://localhost:3001";

export async function encrypt(message: string, e: string, n: string) {
  const token = localStorage.getItem("token");
  const res = await fetch("http://localhost:3001/api/crypto/encrypt", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, 
    },
    body: JSON.stringify({ message, e, n }),
  });
  return await res.json();
}

export async function decrypt(ciphertext: string, d: string, n: string) {
  const token = localStorage.getItem("token");
  const res = await fetch("http://localhost:3001/api/crypto/decrypt", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ ciphertext, d, n }),
  });
  return await res.json();
}

export async function register(username: string, password: string) {
  const res = await fetch(`${API}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return await res.json();
}

export async function login(username: string, password: string) {
  const res = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (data.token) localStorage.setItem("token", data.token);
  return data;
}

export async function getHistory() {
  const token = localStorage.getItem("token");
  const res = await fetch("http://localhost:3001/api/history", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return await res.json();
}

