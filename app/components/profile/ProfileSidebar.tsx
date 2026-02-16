"use client";

import Image from "next/image";
import { MapPin, Link as LinkIcon, Mail } from "lucide-react";

export function ProfileSidebar() {
    return (
        <div className="flex flex-col gap-6">
            {/* Profile Image */}
            <div className="relative w-full aspect-square rounded-2xl overflow-hidden shadow-sm border border-border/50">
                <Image
                    src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=800"
                    alt="Lucky John"
                    fill
                    className="object-cover"
                />
            </div>

            {/* Work / School Info */}
            <div className="space-y-4">
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1">Studying</h3>
                    <p className="text-foreground font-medium">Computer Science</p>
                    <p className="text-sm text-muted-foreground">400 Level, Unilag</p>
                </div>

                <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-1">Skills</h3>
                    <div className="flex flex-wrap gap-2">
                        {["UI/UX Design", "React", "Frontend", "Branding"].map((skill) => (
                            <span key={skill} className="px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md font-medium">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="h-px bg-border/50 my-2" />

            {/* Contact Info */}
            <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-foreground/80">
                    <Mail className="w-4 h-4 text-primary" />
                    <span>lucky.j@student.unilag.edu.ng</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-foreground/80">
                    <LinkIcon className="w-4 h-4 text-primary" />
                    <a href="#" className="hover:underline">portfolio.luckyjohn.com</a>
                </div>
                <div className="flex items-center gap-3 text-sm text-foreground/80">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>Dangote Hall, Unilag</span>
                </div>
            </div>
        </div>
    );
}
