"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";
import {
    Calendar,
    RefreshCw,
    ArrowUp,
    UserPlus,
    UserMinus,
    ArrowLeft,
    MapPin,
    History
} from "lucide-react";

interface UserProfile {
    id: string;
    full_name: string;
    avatar_url: string;
    days: number;
    trips: number;
    meters: number;
    updated_at: string;
}

export default function ProfilePage() {
    const { id } = useParams();
    const router = useRouter();
    const { user: currentUser } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isFriend, setIsFriend] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!id || typeof id !== "string") return;

            try {
                const { data } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (data) {
                    setProfile(data);
                }
            } catch (error) {
                console.error("Error fetching profile:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [id]);

    useEffect(() => {
        const checkFriendStatus = async () => {
            if (!currentUser || !id || typeof id !== "string") return;

            const { data } = await supabase
                .from('friendships')
                .select('*')
                .eq('user_id', currentUser.id)
                .eq('friend_id', id)
                .single();

            if (data) setIsFriend(true);
        };

        if (currentUser && id && currentUser.id !== id) {
            checkFriendStatus();
        }
    }, [currentUser, id]);

    const toggleFriend = async () => {
        if (!currentUser || !id || typeof id !== "string") return;

        try {
            if (isFriend) {
                await supabase
                    .from('friendships')
                    .delete()
                    .eq('user_id', currentUser.id)
                    .eq('friend_id', id);
                setIsFriend(false);
            } else {
                await supabase
                    .from('friendships')
                    .insert({ user_id: currentUser.id, friend_id: id });
                setIsFriend(true);
            }
        } catch (error) {
            console.error("Error toggling friend:", error);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Laster profil...</div>;
    if (!profile) return <div className="p-8 text-center text-gray-500">Fant ikke bruker.</div>;

    const isOwnProfile = currentUser?.id === id;

    return (
        <main className="container mx-auto p-4 max-w-lg min-h-screen">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => router.back()} className="text-slate-800 p-1 hover:bg-gray-100 rounded-full">
                    <ArrowLeft size={24} />
                </button>
                <h1 className="text-xl font-bold text-slate-900">Brukerprofil</h1>
            </div>

            {/* Main Profile Card */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm mb-6 flex flex-col items-center text-center">
                <img
                    src={profile.avatar_url || "https://via.placeholder.com/150"}
                    alt={profile.full_name}
                    className="w-32 h-32 rounded-full border-4 border-gray-50 object-cover mb-4 shadow-inner"
                />

                <h2 className="text-2xl font-bold text-slate-900 mb-1">{profile.full_name}</h2>
                <div className="flex items-center gap-1 text-slate-400 text-sm mb-6">
                    <MapPin size={14} className="fill-current" />
                    <span>Skimore Bruker</span>
                </div>

                {!isOwnProfile && currentUser && (
                    <button
                        onClick={toggleFriend}
                        className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors ${isFriend
                                ? "bg-gray-100 text-slate-600 hover:bg-gray-200"
                                : "bg-[#009CEE] text-white hover:bg-[#008bd5] shadow-lg shadow-blue-100" // Custom Skimore Blueish
                            }`}
                    >
                        {isFriend ? <><UserMinus size={20} /> Fjern venn</> : <><UserPlus size={20} /> Legg til venn</>}
                    </button>
                )}
                {isOwnProfile && (
                    <button
                        onClick={() => supabase.auth.signOut()}
                        className="w-full py-3 rounded-xl font-bold bg-gray-100 text-slate-600 hover:bg-gray-200"
                    >
                        Logg ut
                    </button>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                {/* Dager */}
                <div className="bg-white p-4 rounded-3xl shadow-sm flex flex-col items-center justify-center aspect-square">
                    <Calendar size={24} className="text-[#009CEE] mb-2" />
                    <span className="text-2xl font-bold text-slate-900">{profile.days}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">DAGER</span>
                </div>

                {/* Turer */}
                <div className="bg-white p-4 rounded-3xl shadow-sm flex flex-col items-center justify-center aspect-square">
                    <RefreshCw size={24} className="text-[#009CEE] mb-2" />
                    <span className="text-2xl font-bold text-slate-900">{profile.trips}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TURER</span>
                </div>

                {/* Meter */}
                <div className="bg-white p-4 rounded-3xl shadow-sm flex flex-col items-center justify-center aspect-square">
                    <ArrowUp size={24} className="text-[#009CEE] mb-2" />
                    <span className="text-lg font-bold text-slate-900 whitespace-nowrap">
                        {profile.meters > 1000 ? `${(profile.meters / 1000).toFixed(0)} 000` : profile.meters}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">METER</span>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-[#EAF6FF] rounded-[2rem] p-6 shadow-sm mb-20">
                <div className="flex items-center gap-2 mb-4">
                    <History size={20} className="text-slate-700" />
                    <h3 className="text-lg font-bold text-slate-800">Nylig aktivitet</h3>
                </div>

                <div className="flex justify-between items-center text-sm">
                    <span className="text-[#009CEE]">Sist oppdatering</span>
                    <span className="font-bold text-slate-700">
                        {profile.updated_at
                            ? new Date(profile.updated_at).toLocaleDateString('no-NO')
                            : "Ingen dato"}
                    </span>
                </div>
            </div>

        </main>
    );
}
