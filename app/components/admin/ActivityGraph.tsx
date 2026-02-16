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

const data = [
    { name: 'Mon', listings: 40, reports: 24, amt: 2400 },
    { name: 'Tue', listings: 30, reports: 13, amt: 2210 },
    { name: 'Wed', listings: 20, reports: 58, amt: 2290 },
    { name: 'Thu', listings: 27, reports: 39, amt: 2000 },
    { name: 'Fri', listings: 18, reports: 48, amt: 2181 },
    { name: 'Sat', listings: 23, reports: 38, amt: 2500 },
    { name: 'Sun', listings: 34, reports: 43, amt: 2100 },
];

const ActivityGraph = () => {
    return (
        <div className="bg-card p-6 rounded-xl border border-border h-[400px]">
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground">Platform Activity</h3>
                <p className="text-sm text-muted-foreground">Listings vs Reports trend over the last 7 days</p>
            </div>

            <div className="w-full h-[85%] text-muted-foreground">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={data}
                        margin={{
                            top: 10,
                            right: 30,
                            left: 0,
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
                            tick={{ fill: 'currentColor', fontSize: 12 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            stroke="currentColor"
                            tick={{ fill: 'currentColor', fontSize: 12 }}
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
