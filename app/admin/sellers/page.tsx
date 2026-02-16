'use client';

import { Check, X, Eye, FileText } from 'lucide-react';
import StatusBadge from '@/components/admin/StatusBadge';

const applicants = [
    { id: 1, name: 'Sarah Connor', status: 'Pending', department: 'Computer Science', date: '2023-10-27' },
    { id: 2, name: 'John Wick', status: 'Pending', department: 'Architecture', date: '2023-10-26' },
    { id: 3, name: 'Ellen Ripley', status: 'Approved', department: 'Engineering', date: '2023-10-25' },
    { id: 4, name: 'Marty McFly', status: 'Rejected', department: 'History', date: '2023-10-24' },
];

export default function SellerApprovalsPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Seller Approvals</h1>
                    <p className="text-muted-foreground text-sm">Review student verification requests for seller accounts.</p>
                </div>
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                            <tr>
                                <th className="px-6 py-4">Applicant Name</th>
                                <th className="px-6 py-4">Student Status</th>
                                <th className="px-6 py-4">Department</th>
                                <th className="px-6 py-4">Date Applied</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {applicants.map((applicant) => (
                                <tr key={applicant.id} className="border-b border-border hover:bg-accent/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-foreground">{applicant.name}</td>
                                    <td className="px-6 py-4 text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <FileText size={14} className="text-blue-500" />
                                            Verified ID
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-muted-foreground">{applicant.department}</td>
                                    <td className="px-6 py-4 text-muted-foreground">{applicant.date}</td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={applicant.status} />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-accent rounded transition-colors" title="Review">
                                                <Eye size={16} />
                                            </button>
                                            {applicant.status === 'Pending' && (
                                                <>
                                                    <button className="p-1.5 text-muted-foreground hover:text-green-500 hover:bg-green-500/10 rounded transition-colors" title="Approve">
                                                        <Check size={16} />
                                                    </button>
                                                    <button className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded transition-colors" title="Reject">
                                                        <X size={16} />
                                                    </button>
                                                </>
                                            )}
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
