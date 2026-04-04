'use client';

import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const data: any[] = [];

const ActivityGraph = () => {
    return (
        <div className="bg-card p-4 md:p-6 rounded-xl border border-border">
            <div className="mb-4 md:mb-6">
                <h3 className="text-base md:text-lg font-semibold text-foreground">Platform Activity</h3>
                <p className="text-[11px] md:text-sm text-muted-foreground">Listings vs Reports trend over the last 7 days</p>
            </div>

            <div className="w-full h-[220px] sm:h-[260px] md:h-[320px] text-muted-foreground">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{
                            top: 10,
                            right: 10,
                            left: -10,
                            bottom: 0,
                        }}
                    >
                        <defs>
                            <linearGradient id="colorListings" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" vertical={false} className="opacity-20" />
                        <XAxis
                            dataKey="name"
                            stroke="currentColor"
                            tick={{ fill: 'currentColor', fontSize: 10 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            stroke="currentColor"
                            tick={{ fill: 'currentColor', fontSize: 10 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--popover-foreground))' }}
                            itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="listings"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorListings)"
                        />
                        <Area
                            type="monotone"
                            dataKey="reports"
                            stroke="#ef4444"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorReports)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ActivityGraph;
