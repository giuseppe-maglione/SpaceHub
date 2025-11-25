import { createContext, useContext, useState, useEffect } from "react";
import { apiGet, apiPost } from "../api";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);

    async function checkAuth() {
        const res = await apiGet("/api/me");
        if (res.loggedIn) setUser(res.user);
    }

    async function login(username, password) {
        const res = await apiPost("/auth/login", { username, password });
        if (res.userId) await checkAuth();
        return res;
    }

    async function logout() {
        await apiPost("/auth/logout");
        setUser(null);
    }

    async function register(username, password) {
        const res = await apiPost("/auth/register", { username, password });
        if (res.userId) await checkAuth();
        return res;
    }

    useEffect(() => {
        checkAuth();
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout, register }}>
            {children}
        </AuthContext.Provider>
    );
}
