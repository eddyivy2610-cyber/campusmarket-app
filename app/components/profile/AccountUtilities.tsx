"use client";

import { Wallet, Bell, Shield, LogOut, ChevronRight, Zap, CreditCard, History, UserPlus } from "lucide-react";

export function AccountUtilities() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* Wallet Panel */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-secondary rounded-[2rem] p-8 border border-foreground/10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 -skew-x-12 translate-x-1/3 -translate-y-1/3 pointer-events-none group-hover:scale-110 transition-transform duration-1000"></div>

                    <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-10">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                                    <Wallet className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-foreground uppercase tracking-tighter">Campus Wallet</h3>
                                    <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Fast & Secure Payments</p>
                                </div>
                            </div>

                            <div className="space-y-0.5">
                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Available Balance</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-sans font-black text-foreground tracking-tighter">₦142,500</span>
                                    <span className="text-base font-black text-primary italic">.50</span>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-3">
                                <button className="bg-foreground text-background px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 transition-all shadow-lg active:scale-95 flex items-center gap-2">
                                    <CreditCard className="w-3.5 h-3.5" />
                                    <span>Withdraw</span>
                                </button>
                                <button className="bg-primary hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2">
                                    <Zap className="w-3.5 h-3.5" />
                                    <span>Add Funds</span>
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 max-w-sm bg-secondary/30 rounded-3xl p-6 border border-foreground/10 space-y-6">
                            <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
                                <h4 className="text-[10px] font-black text-foreground uppercase tracking-widest">Recent Activity</h4>
                                <History className="w-4 h-4 text-gray-600" />
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between group/row cursor-pointer">
                                    <div className="flex items-center gap-3 text-left">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover/row:scale-110 transition-transform">+</div>
                                        <div>
                                            <p className="text-[10px] font-black text-foreground uppercase tracking-tight">Earned: iPhone Sale</p>
                                            <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">Today, 11:24 AM</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-black text-emerald-400">+₦450k</span>
                                </div>
                                <div className="flex items-center justify-between group/row cursor-pointer">
                                    <div className="flex items-center gap-3 text-left">
                                        <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 group-hover/row:scale-110 transition-transform">−</div>
                                        <div>
                                            <p className="text-[10px] font-black text-foreground uppercase tracking-tight">Withdrawal</p>
                                            <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">Yesterday, 04:15 PM</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-black text-gray-400">−₦50k</span>
                                </div>
                            </div>
                            <button className="w-full py-3 bg-foreground/5 hover:bg-foreground/10 text-gray-500 font-black text-[9px] uppercase tracking-widest rounded-xl transition-all">View All Transactions</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Settings Sidebar */}
            <div className="space-y-6">
                <div className="bg-secondary/50 rounded-[2rem] p-8 border border-foreground/10 space-y-6 shadow-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                        <h3 className="text-lg font-black text-foreground uppercase tracking-tight">Quick Actions</h3>
                    </div>

                    <div className="space-y-2">
                        {[
                            { icon: Bell, label: "Notifications", sub: "3 new alerts" },
                            { icon: Shield, label: "Security & privacy", sub: "Account protected" },
                            { icon: UserPlus, label: "Invite Friends", sub: "Earn ₦500 per invite" },
                        ].map((item, i) => (
                            <button key={i} className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-primary/10 transition-all group border border-transparent hover:border-foreground/10 text-left">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                        <item.icon className="w-4 h-4 text-gray-400 group-hover:text-primary transition-colors" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black text-foreground uppercase tracking-tight">{item.label}</p>
                                        <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">{item.sub}</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-4 h-4 text-gray-700 group-hover:translate-x-1 transition-transform" />
                            </button>
                        ))}
                    </div>

                    <button className="w-full flex items-center justify-center gap-3 py-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all border border-red-500/20 shadow-lg active:scale-95 group">
                        <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        <span>Sign out of account</span>
                    </button>
                </div>
            </div>

        </div>
    );
}
