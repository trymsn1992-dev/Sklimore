"use client";

import { useState } from "react";
import Tesseract from "tesseract.js";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { CloudUpload, Camera } from "lucide-react";

export default function UploadStats() {
    const { user } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<{ days: number, trips: number, meters: number } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setError(null);
        setResult(null);

        try {
            const worker = await Tesseract.createWorker("nor");

            const ret = await worker.recognize(file);
            const text = ret.data.text;
            await worker.terminate();

            console.log("OCR Text:", text);

            // Parse text
            const daysMatch = text.match(/(\d+)\s*dager/i);
            const tripsMatch = text.match(/(\d+)\s*turer/i);
            const metersMatch = text.match(/([\d\s]+)\s*meter/i);

            if (daysMatch && tripsMatch && metersMatch) {
                const days = parseInt(daysMatch[1], 10);
                const trips = parseInt(tripsMatch[1], 10);
                const metersString = metersMatch[1].replace(/\s/g, "");
                const meters = parseInt(metersString, 10);

                const newStats = { days, trips, meters };
                setResult(newStats);

                // Update Supabase
                if (user) {
                    const { error } = await supabase
                        .from('profiles')
                        .update({
                            days: days,
                            trips: trips,
                            meters: meters,
                            updated_at: new Date()
                        })
                        .eq('id', user.id);

                    if (error) {
                        console.error("Error updating stats:", error);
                        setError("Failed to save stats to database.");
                    }
                }
            } else {
                setError("Could not find stats. Ensure image has 'dager', 'turer', 'meter'.");
            }

        } catch (err) {
            console.error(err);
            setError("Failed to process image.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-slate-800 mb-2">Oppdater statistikk</h3>
            <p className="text-sm text-slate-500 mb-6">
                Last opp et skjermbilde fra Skimore-appen for å oppdatere tallene dine automatisk.
            </p>

            <div className="relative">
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />

                <div className="border-2 border-dashed border-blue-200 rounded-xl p-8 flex flex-col items-center justify-center bg-blue-50 text-center transition-colors hover:bg-blue-100 hover:border-blue-300">
                    {uploading ? (
                        <div className="animate-pulse flex flex-col items-center">
                            <div className="h-10 w-10 bg-blue-400 rounded-full mb-2"></div>
                            <span className="text-blue-600 font-medium">Analyserer bilde...</span>
                        </div>
                    ) : result ? (
                        <div className="flex flex-col items-center">
                            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-2 text-green-600">
                                <CloudUpload size={24} />
                            </div>
                            <span className="text-green-700 font-bold mb-1">Oppdatert!</span>
                            <span className="text-xs text-green-600">
                                {result.days}d • {result.trips}t • {result.meters}m
                            </span>
                        </div>
                    ) : (
                        <>
                            <div className="bg-blue-500 text-white p-3 rounded-full mb-3 shadow-md shadow-blue-200">
                                <CloudUpload size={24} />
                            </div>
                            <h4 className="font-bold text-slate-700 mb-1">Velg skjermbilde</h4>
                            <p className="text-xs text-slate-400">PNG, JPG opptil 10MB</p>
                        </>
                    )}
                </div>
            </div>

            {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                    {error}
                </div>
            )}
        </div>
    );
}
