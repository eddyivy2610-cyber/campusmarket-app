'use client';

import { Award, Settings, Search, Filter, Plus, Trophy, Star, Shield, Zap, MoreHorizontal, Users, Edit3, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useState } from 'react';

const badges = [
    { id: 1, name: 'Top Seller', icon: Trophy, color: 'text-yellow-600 bg-yellow-500/10', description: 'Awarded to sellers with >50 successful sales and 4.5+ rating.', earners: 124, type: 'Achievement' },
    { id: 2, name: 'Verified Student', icon: Shield, color: 'text-blue-600 bg-blue-500/10', description: 'Automatically given to users with verified university email.', earners: 4202, type: 'System' },
    { id: 3, name: 'Early Adopter', icon: Zap, color: 'text-purple-600 bg-purple-500/10', description: 'Joined during the beta phase of Campus Market.', earners: 850, type: 'Legacy' },
    { id: 4, name: 'Trusted Buyer', icon: Star, color: 'text-green-600 bg-green-500/10', description: 'Awarded to buyers with >10 reviews and 0 disputes.', earners: 312, type: 'Achievement' },
];

export default function BadgesPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight text-foreground uppercase">Badge Management</h1>
                    <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-[9px]">Gamification & Recognition System</p>
                </div>

                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20">
                        <Plus size={14} />
                        Create Badge
                    </button>
                </div>
            </div>

            {/* Badge Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {badges.map((badge) => (
                    <div key={badge.id} className="bg-card border border-border/50 rounded-[24px] p-6 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="flex items-start justify-between">
                                <div className={cn("p-3 rounded-xl", badge.color)}>
                                    <badge.icon size={24} />
                                </div>
                                <div className="text-right">
                                    <span className="block text-[8px] font-bold uppercase tracking-widest opacity-30">Type</span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{badge.type}</span>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-bold tracking-tight text-foreground uppercase">{badge.name}</h3>
                                <p className="text-xs font-semibold text-muted-foreground/70 mt-1.5 leading-relaxed">
                                    {badge.description}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6 pt-5 border-t border-border/30 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Users size={14} className="text-muted-foreground/50" />
                                <span className="text-xs font-bold text-foreground">{badge.earners} <span className="text-muted-foreground/50 font-medium">holders</span></span>
                            </div>
                            <div className="flex items-center gap-1">
                                <button className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all">
                                    <Edit3 size={14} />
                                </button>
                                <button className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Manual Awarding Section Intro */}
            <div className="bg-primary/5 border border-primary/10 rounded-[24px] p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">
                <div className="p-4 bg-primary/20 rounded-full text-primary">
                    <Award size={32} />
                </div>
                <div className="flex-1 text-center md:text-left">
                    <h2 className="text-xl font-bold tracking-tight text-foreground uppercase">Manual Badge Recognition</h2>
                    <p className="text-sm font-semibold text-muted-foreground/70 mt-1.5">
                        Want to recognize a specific community member? You can manually award achievement badges or create special one-time recognition badges for contest winners.
                    </p>
                </div>
                <button className="px-6 py-3 bg-primary text-primary-foreground rounded-xl text-[10px] font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-primary/20 whitespace-nowrap">
                    Start Awarding
                </button>
            </div>
        </div>
    );
}
