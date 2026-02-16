'use client';

import { MoreHorizontal, ShieldOff, User } from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';

const startUsers = [
    { id: 1, name: 'Alice Wonderland', email: 'alice@example.com', date: '2023-09-15', status: 'Active', role: 'Buyer' },
    { id: 2, name: 'Bob Builder', email: 'bob@example.com', date: '2023-08-20', status: 'Suspended', role: 'Seller' },
    { id: 3, name: 'Charlie Chocolate', email: 'charlie@example.com', date: '2023-10-01', status: 'Active', role: 'Seller' },
    { id: 4, name: 'Dave Diver', email: 'dave@example.com', date: '2023-01-10', status: 'Active', role: 'Buyer' },
];

export default function UsersPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">User Management</h1>
                    <p className="text-muted-foreground text-sm">Manage all platform users and their account status.</p>
                </div>
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                            <tr>
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4">Join Date</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {startUsers.map((user) => (
                                <tr key={user.id} className="border-b border-border hover:bg-accent/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-foreground">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                                                {user.name.charAt(0)}
                                            </div>
                                            {user.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{user.role}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{user.date}</td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={user.status} />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors" title="View Profile">
                                                <User size={16} />
                                            </button>
                                            <button className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded transition-colors" title="Suspend User">
                                                <ShieldOff size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
