"use client";

import Link from "next/link";
import { Bell, Trophy, BookOpen } from "lucide-react";

interface Announcement {
    id: string;
    title: string;
    description: string;
    date: string;
    icon: React.ElementType;
    color: string;
    linkText: string;
}

const ANNOUNCEMENTS: Announcement[] = [
    {
        id: "1",
        title: "New Verification System Launching Next Week",
        description: "We're implementing an enhanced verification process to improve marketplace safety. All users will need to complete this one-time verification by November 1st.",
        date: "Oct 18, 2023",
        icon: Bell,
        color: "bg-blue-100 text-blue-600 border-l-4 border-blue-500",
        linkText: "Learn More"
    },
    {
        id: "2",
        title: "Fall Photography Contest: Campus Life",
        description: "Showcase your photography skills and win amazing prizes! Submit your best campus life photos by October 31st. The top three winners will receive Amazon gift cards.",
        date: "Oct 14, 2023",
        icon: Trophy,
        color: "bg-green-100 text-green-600 border-l-4 border-green-500",
        linkText: "Enter Contest"
    },
    {
        id: "3",
        title: "Textbook Exchange Week Coming Soon",
        description: "Mark your calendars for our special Textbook Exchange Week from November 5-12. Special promotions, zero listing fees, and organized meetup spots across campus.",
        date: "Oct 9, 2023",
        icon: BookOpen,
        color: "bg-amber-100 text-amber-600 border-l-4 border-amber-500",
        linkText: "Get Details"
    }
];

export function Announcements() {
    return (
        <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black flex items-center gap-2">
                    <span className="text-primary">📢</span> Announcements
                </h2>
                <Link href="#" className="font-bold text-sm text-primary hover:underline">
                    View All
                </Link>
            </div>

            <div className="space-y-4">
                {ANNOUNCEMENTS.map((announcement) => {
                    const Icon = announcement.icon;
                    return (
                        <div key={announcement.id} className={`p-6 rounded-xl ${announcement.color} bg-opacity-10 border border-opacity-10`}>
                            <div className="flex items-start gap-4">
                                <div className={`p-2 rounded-full bg-white bg-opacity-80 shrink-0 ${announcement.color.split(" ")[1]}`}>
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg mb-1">{announcement.title}</h3>
                                    <p className="text-sm opacity-80 mb-3 leading-relaxed">
                                        {announcement.description}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-semibold opacity-60">Posted on {announcement.date}</span>
                                        <Link href="#" className="text-sm font-bold hover:underline">
                                            {announcement.linkText}
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
