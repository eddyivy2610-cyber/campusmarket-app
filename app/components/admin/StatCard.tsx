import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string | number;
    trend?: {
        value: string;
        isPositive: boolean;
    };
    variant?: 'blue' | 'gray';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, trend }) => {
    return (
        <div className="p-4 rounded-xl flex flex-col justify-center min-h-[90px] transition-all duration-300 border border-border/40 bg-transparent hover:bg-secondary/5 group">
            <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60 mb-1.5">{label}</span>
            
            <div className="flex items-center gap-2.5">
                <span className="text-2xl font-bold tracking-tight text-foreground">{value}</span>
                
                {trend && (
                    <div className="flex items-center gap-1">
                        <span className={`text-[11px] font-bold ${
                            trend.isPositive ? 'text-emerald-500' : 'text-rose-500'
                        }`}>
                            {trend.value}
                        </span>
                        {trend.isPositive ? (
                            <TrendingUp size={12} className="text-emerald-500/70" />
                        ) : (
                            <TrendingDown size={12} className="text-rose-500/70" />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatCard;
