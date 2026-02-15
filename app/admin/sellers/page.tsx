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
                    <h1 className="text-2xl font-bold text-white">Seller Approvals</h1>
                    <p className="text-gray-400 text-sm">Review student verification requests for seller accounts.</p>
                </div>
            </div>

            <div className="bg-[#121212] rounded-xl border border-white/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-400 uppercase bg-white/5">
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
                                <tr key={applicant.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 font-medium text-white">{applicant.name}</td>
                                    <td className="px-6 py-4 text-gray-400">
                                        <div className="flex items-center gap-2">
                                            <FileText size={14} className="text-blue-400" />
                                            Verified ID
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-400">{applicant.department}</td>
                                    <td className="px-6 py-4 text-gray-400">{applicant.date}</td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={applicant.status} />
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition-colors" title="Review">
                                                <Eye size={16} />
                                            </button>
                                            {applicant.status === 'Pending' && (
                                                <>
                                                    <button className="p-1.5 text-gray-400 hover:text-green-400 hover:bg-green-500/10 rounded transition-colors" title="Approve">
                                                        <Check size={16} />
                                                    </button>
                                                    <button className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors" title="Reject">
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
}
