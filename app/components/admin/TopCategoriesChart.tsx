'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CATEGORIES, PRODUCTS } from '@/data/products';

const COLORS = [
    '#3b82f6',
    '#10b981',
    '#f59e0b',
    '#ef4444',
    '#8b5cf6',
    '#14b8a6',
    '#f97316',
    '#22c55e',
    '#0ea5e9',
    '#a855f7',
    '#eab308',
    '#ec4899',
];

const TopCategoriesChart = () => {
    const chartData = CATEGORIES.map((category) => ({
        name: category.name,
        value: PRODUCTS.filter((product) => product.category === category.name).length,
    }));

    const legendItems = chartData.slice().sort((a, b) => b.value - a.value).slice(0, 4);

    return (
        <div className="bg-card p-5 rounded-xl border border-border flex flex-col">
            <h3 className="text-lg font-bold text-foreground mb-4">Top Categories</h3>
            <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={48}
                            outerRadius={68}
                            fill="#8884d8"
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {CATEGORIES.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                            ))}
                        </Pie>
                        <Tooltip
                            contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '0.5rem', color: 'hsl(var(--popover-foreground))' }}
                            itemStyle={{ color: 'hsl(var(--popover-foreground))' }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-4 pt-4 border-t border-border/40 grid grid-cols-2 gap-3">
                {legendItems.map((item, index) => (
                    <div key={item.name} className="text-center">
                        <div className="flex items-center gap-1.5 justify-center mb-1">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.16em] leading-tight break-words">
                                {item.name}
                            </span>
                        </div>
                        <span className="text-[12px] font-bold">{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TopCategoriesChart;
