"use client";

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell
} from "recharts";
import { useState } from "react";

const rawData = [
    { name: "Jan", sales: 15000 },
    { name: "Feb", sales: 8000 },
    { name: "Mar", sales: 20000 },
    { name: "Apr", sales: 6000 },
    { name: "May", sales: 30000 },
    { name: "Jun", sales: 45000 },
    { name: "Jul", sales: 10000 },
    { name: "Aug", sales: 22000 },
    { name: "Sep", sales: 35000 },
    { name: "Oct", sales: 7000 },
    { name: "Nov", sales: 32000 },
    { name: "Dec", sales: 28000 }
];

export function SalesRevenueChart() {
    const [activeIndex, setActiveIndex] = useState<number | null>(5); // Default focus on Jun

    return (
        <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm col-span-1 lg:col-span-2 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-bold font-heading">Sales Revenue</h2>
                <div className="flex items-center gap-2 text-[10px] font-bold">
                    <button className="px-2 py-1 rounded-md text-muted-foreground hover:bg-secondary transition-colors">1D</button>
                    <button className="px-2 py-1 rounded-md text-muted-foreground hover:bg-secondary transition-colors">1M</button>
                    <button className="px-2 py-1 rounded-md text-muted-foreground hover:bg-secondary transition-colors">3M</button>
                    <button className="px-2 py-1 rounded-md bg-primary text-primary-foreground shadow-sm">1Y</button>
                </div>
            </div>

            <div className="flex-1 min-h-[220px] w-full mt-2 text-muted-foreground">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={rawData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.5} />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: "currentColor" }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 10, fill: "currentColor" }}
                            tickFormatter={(val) => `₦${val / 1000}k`}
                        />
                        <Tooltip
                            cursor={{ fill: "transparent" }}
                            content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                    return (
                                        <div className="bg-popover text-popover-foreground border border-border text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl relative -top-3">
                                            ₦{(payload[0].value as number / 1000)}k
                                            <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 border-[5px] border-transparent border-t-border"></div>
                                            <div className="absolute -bottom-[4px] left-1/2 -translate-x-1/2 border-[4px] border-transparent border-t-popover"></div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar
                            dataKey="sales"
                            radius={[4, 4, 4, 4]}
                            barSize={16}
                            onMouseEnter={(_, index) => setActiveIndex(index)}
                            onMouseLeave={() => setActiveIndex(null)}
                        >
                            {rawData.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={activeIndex === index || activeIndex === null && index === 5 ? "var(--color-primary)" : "var(--color-primary)"}
                                    fillOpacity={activeIndex === index || activeIndex === null && index === 5 ? 1 : 0.5}
                                    className="transition-all duration-300 cursor-pointer"
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
