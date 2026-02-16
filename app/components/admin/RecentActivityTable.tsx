import { Eye, CheckCircle, XCircle } from 'lucide-react';

const recentActivities = [
    { id: 1, item: 'Vintage Leather Jacket', type: 'Listing', date: '2 mins ago', status: 'Pending', user: 'AlexRider' },
    { id: 2, item: 'Calculus Textbook', type: 'Report', date: '15 mins ago', status: 'Review', user: 'JennyP' },
    { id: 3, item: 'Gaming Monitor', type: 'Listing', date: '1 hour ago', status: 'Active', user: 'TechGuy' },
    { id: 4, item: 'Spam Account', type: 'User Report', date: '2 hours ago', status: 'Resolved', user: 'ModTeam' },
    { id: 5, item: 'Handmade Pottery', type: 'Listing', date: '3 hours ago', status: 'Pending', user: 'ArtisanClay' },
];

const RecentActivityTable = () => {
    return (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div className="p-6 border-b border-border flex justify-between items-center">
                <h3 className="text-lg font-semibold text-foreground">Recent Activity</h3>
                <button className="text-sm text-blue-500 hover:text-blue-400">View All</button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                        <tr>
                            <th className="px-6 py-3">Item / User</th>
                            <th className="px-6 py-3">Type</th>
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentActivities.map((activity) => (
                            <tr key={activity.id} className="border-b border-border hover:bg-accent/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-foreground">
                                    {activity.item}
                                    <div className="text-xs text-muted-foreground font-normal">{activity.user}</div>
                                </td>
                                <td className="px-6 py-4 text-muted-foreground">{activity.type}</td>
                                <td className="px-6 py-4 text-muted-foreground">{activity.date}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${activity.status === 'Active' ? 'bg-green-500/10 text-green-500' :
                                        activity.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500' :
                                            activity.status === 'Resolved' ? 'bg-blue-500/10 text-blue-500' :
                                                'bg-red-500/10 text-red-500'
                                        }`}>
                                        {activity.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-muted-foreground hover:text-foreground transition-colors">
                                        <Eye size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RecentActivityTable;
