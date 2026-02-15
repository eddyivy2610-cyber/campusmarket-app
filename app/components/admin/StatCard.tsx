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
        <div className="bg-[#121212] p-6 rounded-xl border border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400 text-sm font-medium">{label}</span>
                {Icon && <Icon size={20} className="text-gray-500" />}
            </div>

            <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-white">{value}</span>

                {trend && (
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${trend.isPositive
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}>
                        {trend.value}
                    </span>
                )}
            </div>
        </div>
    );
};

export default StatCard;
