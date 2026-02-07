"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import { Trophy, Medal } from "lucide-react";

interface UserProfile {
    id: string;
    full_name: string;
    avatar_url: string;
    days: number;
    trips: number;
    meters: number;
}

export default function LeaderboardPage() {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [sortBy, setSortBy] = useState<"days" | "trips" | "meters">("meters");
    const [filter, setFilter] = useState<"all" | "friends">("all");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                let data: UserProfile[] = [];

                if (filter === "friends" && currentUser) {
                    // Fetch friends
                    const { data: friendships } = await supabase
                        .from('friendships')
                        .select('friend_id')
                        .eq('user_id', currentUser.id);

                    const friendIds = friendships?.map(f => f.friend_id) || [];
                    friendIds.push(currentUser.id); // Include self

                    if (friendIds.length > 0) {
                        const { data: friendsData } = await supabase
                            .from('profiles')
                            .select('*')
                            .in('id', friendIds)
                            .order(sortBy, { ascending: false });

                        if (friendsData) data = friendsData;
                    }

                } else {
                    // Fetch all
                    const { data: allData } = await supabase
                        .from('profiles')
                        .select('*')
                        .order(sortBy, { ascending: false })
                        .limit(50);

                    if (allData) data = allData;
                }

                setUsers(data);
            } catch (error) {
                console.error("Error fetching leaderboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [sortBy, filter, currentUser]);

    return (
        <main className="container mx-auto p-4 max-w-lg min-h-screen">
            <h1 className="text-2xl font-bold text-slate-800 mb-6">Ledertavle</h1>

            {/* Main Filter (Tabs) */}
            <div className="bg-gray-200 p-1 rounded-xl flex mb-6">
                <button
                    onClick={() => setFilter("all")}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${filter === "all"
                            ? "bg-white text-slate-800 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                >
                    Alle brukere
                </button>
                <button
                    onClick={() => setFilter("friends")}
                    className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${filter === "friends"
                            ? "bg-white text-slate-800 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                    disabled={!currentUser}
                >
                    Venner
                </button>
            </div>

            {/* Sort Chips */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                <button
                    onClick={() => setSortBy("meters")}
                    className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${sortBy === "meters"
                            ? "bg-blue-500 text-white shadow-md shadow-blue-200"
                            : "bg-white text-slate-600 border border-gray-100"
                        }`}
                >
                    ↕ Høydemeter
                </button>
                <button
                    onClick={() => setSortBy("days")}
                    className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${sortBy === "days"
                            ? "bg-blue-500 text-white shadow-md shadow-blue-200"
                            : "bg-white text-slate-600 border border-gray-100"
                        }`}
                >
                    📅 Dager
                </button>
                <button
                    onClick={() => setSortBy("trips")}
                    className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${sortBy === "trips"
                            ? "bg-blue-500 text-white shadow-md shadow-blue-200"
                            : "bg-white text-slate-600 border border-gray-100"
                        }`}
                >
                    🔄 Turer
                </button>
            </div>

            {/* List */}
            {loading ? (
                <div className="text-center py-10 text-gray-400">Laster lister...</div>
            ) : (
                <div className="space-y-3 pb-20">
                    {users.map((user, index) => {
                        let rankIcon = null;
                        if (index === 0) rankIcon = <Medal className="text-yellow-400" size={24} />;
                        else if (index === 1) rankIcon = <Medal className="text-gray-300" size={24} />;
                        else if (index === 2) rankIcon = <Medal className="text-amber-600" size={24} />;
                        else rankIcon = <span className="text-slate-400 font-bold w-6 text-center">{index + 1}</span>;

                        return (
                            <Link href={`/profile/${user.id}`} key={user.id}>
                                <div className="bg-white p-4 rounded-2xl flex items-center gap-4 shadow-sm border border-gray-50 hover:border-blue-100 transition-colors">
                                    <div className="w-8 flex justify-center">
                                        {rankIcon}
                                    </div>
                                    <img
                                        src={user.avatar_url || "https://via.placeholder.com/40"}
                                        alt={user.full_name}
                                        className="w-12 h-12 rounded-full object-cover bg-slate-100"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-bold text-slate-800 truncate">{user.full_name}</div>
                                        <div className="text-xs text-slate-400 flex gap-2">
                                            <span>📅 {user.days || 0}</span>
                                            <span>🔄 {user.trips || 0}</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-blue-600 text-lg">
                                            {sortBy === "meters" && `${(user.meters || 0).toLocaleString()}m`}
                                            {sortBy === "trips" && `${user.trips || 0}`}
                                            {sortBy === "days" && `${user.days || 0}`}
                                        </div>
                                        <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                                            {sortBy === "meters" ? "Totalt Fallhøyde" : sortBy === "trips" ? "Totalt Turer" : "Dager Aktivitet"}
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}

                    {users.length === 0 && (
                        <div className="text-center py-10 text-gray-400">
                            Ingen skiløpere funnet.
                        </div>
                    )}
                </div>
            )}
        </main>
    );
}
