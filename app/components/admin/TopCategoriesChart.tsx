'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
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
    return (
        <div className="bg-card p-5 rounded-xl border border-border h-[340px]">
            <h3 className="text-lg font-bold text-foreground mb-4">Top Categories</h3>
            <div className="h-[230px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={CATEGORIES.map((category) => ({
                                name: category.name,
                                value: PRODUCTS.filter((product) => product.category === category.name).length,
                            }))}
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
                        <Legend
                            verticalAlign="bottom"
                            height={44}
                            iconType="circle"
                            wrapperStyle={{ fontSize: "10px" }}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default TopCategoriesChart;
