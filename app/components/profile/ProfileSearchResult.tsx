"use client";

import Link from "next/link";
import { User, Shield, Star, MapPin } from "lucide-react";
import type { Profile } from "../../data/profiles";

export function ProfileSearchResult({ profile }: { profile: Profile }) {
    return (
        <Link 
            href={`/profile/${profile.handle}`}
            className="group flex items-center gap-4 p-4 bg-card border border-border/50 rounded-2xl hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/5"
        >
            <div className="relative w-16 h-16 shrink-0">
                <div className="w-full h-full rounded-2xl border border-border overflow-hidden bg-secondary/10 flex items-center justify-center">
                    {profile.avatar ? (
                        <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                        <User className="w-8 h-8 text-muted-foreground/30" />
                    )}
                </div>
                {profile.isVerified && (
                    <div className="absolute -top-1 -right-1 bg-primary text-white p-1 rounded-full shadow-sm border-2 border-background">
                        <Shield className="w-3 h-3 fill-current" />
                    </div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="text-sm font-bold text-foreground truncate">{profile.name}</h3>
                    <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 shrink-0">
                        {profile.type === 'vendor' ? 'Pro' : 'User'}
                    </span>
                </div>
                
                <p className="text-[11px] text-muted-foreground line-clamp-1 mb-1.5">{profile.bio}</p>
                
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[10px] font-bold text-orange-500">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{profile.rating.toFixed(1)}</span>
                    </div>
                    {profile.location && (
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate max-w-[100px]">{profile.location}</span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
