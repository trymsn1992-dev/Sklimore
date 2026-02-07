"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function BottomNav() {
    const pathname = usePathname();
    const { user } = useAuth();

    if (!user) return null;

    const isActive = (path: string) => pathname === path;

    return (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 py-3 pb-safe-area shadow-lg z-50">
            <div className="flex justify-around items-center max-w-md mx-auto">
                <Link href="/" className="flex flex-col items-center gap-1 w-16">
                    <Home
                        size={24}
                        className={isActive("/") ? "text-blue-500" : "text-gray-400"}
                    />
                    <span
                        className={`text-xs font-medium ${isActive("/") ? "text-blue-500" : "text-gray-400"
                            }`}
                    >
                        Hjem
                    </span>
                </Link>

                <Link href="/leaderboard" className="flex flex-col items-center gap-1 w-16">
                    <Trophy
                        size={24}
                        className={isActive("/leaderboard") ? "text-blue-500" : "text-gray-400"}
                    />
                    <span
                        className={`text-xs font-medium ${isActive("/leaderboard") ? "text-blue-500" : "text-gray-400"
                            }`}
                    >
                        Lister
                    </span>
                </Link>

                <Link href={`/profile/${user.id}`} className="flex flex-col items-center gap-1 w-16">
                    <User
                        size={24}
                        className={
                            isActive(`/profile/${user.id}`) ? "text-blue-500" : "text-gray-400"
                        }
                    />
                    <span
                        className={`text-xs font-medium ${isActive(`/profile/${user.id}`) ? "text-blue-500" : "text-gray-400"
                            }`}
                    >
                        Profil
                    </span>
                </Link>
            </div>
        </div>
    );
}
