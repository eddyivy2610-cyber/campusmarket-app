"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const data = [
    { name: "Disputed", value: 0 },
    { name: "Successful", value: 100 }
];

const COLORS = ["#ef4444", "#3b82f6"]; // Red for disputes, Blue for successful

export function DisputesChart() {
    return (
        <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm flex flex-col items-center justify-between h-full relative">
            <h2 className="w-full text-sm font-bold font-heading text-left mb-4">Disputes Statistics</h2>

            <div className="relative w-full aspect-square max-h-[160px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius="75%"
                            outerRadius="100%"
                            startAngle={90}
                            endAngle={-270}
                            dataKey="value"
                            stroke="transparent"
                            cornerRadius={40}
                        >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold font-heading">0%</span>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest text-center">Total<br />Disputes</span>
                </div>
            </div>

            <div className="w-full flex items-center justify-center gap-6 mt-4 pt-4 border-t border-border/40">
                <div className="text-center">
                    <div className="flex items-center gap-1.5 justify-center mb-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Successful</span>
                    </div>
                    <span className="text-sm font-bold">14,500</span>
                </div>
                <div className="text-center">
                    <div className="flex items-center gap-1.5 justify-center mb-1">
                        <span className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Disputes</span>
                    </div>
                    <span className="text-sm font-bold">0</span>
                </div>
            </div>

            <p className="w-full text-center text-[8px] text-muted-foreground mt-4 leading-tight opacity-70">
                * disputes / transactions. 0% if none is calculated after successfully marked transactions.
            </p>
        </div>
    );
}
