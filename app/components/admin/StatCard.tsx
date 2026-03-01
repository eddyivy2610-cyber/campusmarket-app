import { LucideIcon } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string | number;
    icon?: LucideIcon;
    trend?: {
        value: string;
        isPositive: boolean;
    };
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon: Icon, trend }) => {
    return (
        <div className="bg-card p-4 rounded-xl border border-border flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground text-[10px] font-semibold uppercase tracking-widest">{label}</span>
                {Icon && <Icon size={16} className="text-muted-foreground" />}
            </div>

            <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-foreground">{value}</span>

                {trend && (
                    <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${trend.isPositive
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-red-500/10 text-red-500'
                        }`}>
                        {trend.value}
                    </span>
                )}
            </div>
        </div>
    );
};

export default StatCard;
