"use client";

import { useAuth } from "@/context/AuthContext";
import Login from "@/components/Login";
import UploadStats from "@/components/UploadStats";
import StatsCard from "@/components/StatsCard";
import { Users, Calendar } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const { user, loading } = useAuth();
  // We need to fetch the user's profile data to get the stats
  // Auth user object metadata might be stale or not contain the stats
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (data) setProfile(data);
      };
      fetchProfile();

      // Realtime subscription for instant updates after upload
      const channel = supabase
        .channel('schema-db-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`,
          },
          (payload) => {
            setProfile(payload.new);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-blue-900 mb-2">Skimore Challenge ⛷️</h1>
            <p className="text-gray-500">Konkurrer med venner og track sesongen din.</p>
          </div>
          <Login />
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto p-4 max-w-lg space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pt-4 pb-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Velkommen, {profile?.full_name?.split(' ')[0] || "Skier"}!
          </h1>
          <p className="text-slate-500 text-sm">Her er en oversikt over din statistikk.</p>
        </div>
        <Link href={`/profile/${user.id}`}>
          <img
            src={profile?.avatar_url || user.user_metadata.avatar_url}
            alt="Profile"
            className="w-12 h-12 rounded-full border-2 border-white shadow-sm"
          />
        </Link>
      </div>

      {/* Stats Card */}
      <StatsCard
        days={profile?.days || 0}
        trips={profile?.trips || 0}
        meters={profile?.meters || 0}
      />

      {/* Upload Card */}
      <UploadStats />

      {/* Quick Links / Info */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/leaderboard" className="bg-white p-4 rounded-2xl shadow-sm flex flex-col item-center justify-center text-center border border-gray-100 hover:border-blue-200 transition-colors">
          <div className="bg-blue-50 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 text-blue-500">
            <Users size={20} />
          </div>
          <span className="text-xs text-slate-400 font-medium uppercase">Lister</span>
          <span className="text-slate-800 font-bold">Se rangering</span>
        </Link>

        <div className="bg-white p-4 rounded-2xl shadow-sm flex flex-col item-center justify-center text-center border border-gray-100">
          <div className="bg-blue-50 w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 text-blue-500">
            <Calendar size={20} />
          </div>
          <span className="text-xs text-slate-400 font-medium uppercase">Sist oppdatert</span>
          <span className="text-slate-800 font-bold">
            {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : "Aldri"}
          </span>
        </div>
      </div>

    </main>
  );
}
