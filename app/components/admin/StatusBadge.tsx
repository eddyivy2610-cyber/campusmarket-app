interface StatusBadgeProps {
    status: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
    const getStatusStyles = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
            case 'approved':
            case 'resolved':
                return 'bg-green-500/10 text-green-400 border-green-500/20';
            case 'pending':
            case 'under review':
                return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
            case 'removed':
            case 'suspended':
            case 'rejected':
            case 'hidden':
                return 'bg-red-500/10 text-red-400 border-red-500/20';
            default:
                return 'bg-accent/10 text-accent border-accent/30';
        }
    };

    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyles(status)}`}>
            {status}
        </span>
    );
};

export default StatusBadge;
