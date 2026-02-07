"use client";

import { Info } from "lucide-react";

interface StatsCardProps {
    days: number;
    trips: number;
    meters: number;
}

export default function StatsCard({ days, trips, meters }: StatsCardProps) {
    // Simple bar chart visualization
    // Max height reference (meters is usually the largest number but we scale bars relatively)
    // Let's just make it look good visually with approximate heights for the concept

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm mb-4">
            <div className="flex justify-between items-start mb-6">
                <h3 className="text-lg font-bold text-slate-800">Et overblikk</h3>
                <Info className="text-blue-400" size={20} />
            </div>

            <div className="flex items-end justify-between">
                <div className="space-y-4">
                    <div>
                        <span className="text-3xl font-bold text-slate-800">{days}</span>
                        <span className="text-sm text-slate-500 ml-2">dager</span>
                    </div>
                    <div>
                        <span className="text-3xl font-bold text-slate-800">{trips}</span>
                        <span className="text-sm text-slate-500 ml-2">turer</span>
                    </div>
                    <div>
                        <span className="text-3xl font-bold text-slate-800">{meters.toLocaleString()}</span>
                        <span className="text-sm text-slate-500 ml-2">meter</span>
                    </div>
                </div>

                {/* Visual Bar Chart */}
                <div className="flex items-end gap-2 h-32 ml-4">
                    {/* Days Bar */}
                    <div className="w-8 bg-blue-200 rounded-t-sm h-[40%]"></div>
                    {/* Trips Bar */}
                    <div className="w-12 bg-blue-900 rounded-t-md h-[80%]"></div>
                    {/* Meters Bar (Generic visual representation) */}
                    <div className="w-8 bg-blue-200 rounded-t-sm h-[30%]"></div>
                </div>
            </div>
        </div>
    );
}
