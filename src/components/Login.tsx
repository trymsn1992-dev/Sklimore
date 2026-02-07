"use client";

import { useAuth } from "@/context/AuthContext";

export default function Login() {
    const { signInWithGoogle } = useAuth();

    return (
        <div className="flex flex-col items-center justify-center gap-4">
            <div className="text-center">
                <button
                    onClick={signInWithGoogle}
                    className="btn btn-primary text-lg px-8 py-3 w-full shadow-lg shadow-blue-200"
                >
                    Logg inn med Google
                </button>
            </div>
        </div>
    );
}
