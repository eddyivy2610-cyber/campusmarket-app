"use client";

import React from "react";
import { Smartphone, Monitor } from "lucide-react";
import { cn } from "../../../lib/utils";

interface DeviceProps {
    name: string;
    lastUsed: string;
    type: "mobile" | "desktop";
}

function DeviceRow({ name, lastUsed, type }: DeviceProps) {
    return (
        <div className="flex items-center justify-between py-4 group">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground">
                    {type === "mobile" ? <Smartphone className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
                </div>
                <div className="space-y-0.5">
                    <h4 className="text-sm font-medium">{name}</h4>
                    <p className="text-xs text-muted-foreground">Last used {lastUsed}</p>
                </div>
            </div>
            <button className="text-xs font-semibold hover:text-red-500 transition-colors">
                Remove
            </button>
        </div>
    );
}

interface ConnectionProps {
    name: string;
    description: string;
    icon: string;
}

function ConnectionRow({ name, description, icon }: ConnectionProps) {
    return (
        <div className="flex items-center justify-between py-4 group">
            <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center overflow-hidden">
                    <img src={icon} alt={name} className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                    <h4 className="text-sm font-medium">{name}</h4>
                    <p className="text-xs text-muted-foreground">{description}</p>
                </div>
            </div>
            <button className="text-xs font-semibold hover:opacity-70 transition-opacity">
                Disconnect
            </button>
        </div>
    );
}

export function SecuritySettings() {
    return (
        <div className="max-w-4xl space-y-12 pb-12">
            {/* Two-Factor Authentication Section */}
            <div className="space-y-6">
                <div className="pb-4 border-b border-border/40">
                    <h2 className="text-base font-semibold">Two-Factor Authentication</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Two-factor authentication adds an extra layer of security to your account by requiring more than just a password to log in.
                        </p>
                        <div className="flex gap-2">
                            <button className="px-6 py-2.5 bg-primary text-white rounded-2xl text-xs font-bold shadow-lg shadow-primary/10">
                                Enable 2FA
                            </button>
                            <button className="px-6 py-2.5 bg-muted/40 border border-border/10 rounded-2xl text-xs font-bold hover:bg-muted/60 transition-colors">
                                Learn More
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Side-by-Side Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Connected Accounts */}
                <div className="space-y-6">
                    <div className="pb-4 border-b border-border/40">
                        <h2 className="text-base font-semibold">Connected Accounts</h2>
                    </div>
                    <div className="divide-y divide-border/20">
                        <ConnectionRow
                            name="Google"
                            description="Connected as lucky@john.com"
                            icon="https://www.google.com/favicon.ico"
                        />
                        <ConnectionRow
                            name="GitHub"
                            description="Connected as luckyjohn"
                            icon="https://github.com/favicon.ico"
                        />
                    </div>
                </div>

                {/* Devices */}
                <div className="space-y-6">
                    <div className="pb-4 border-b border-border/40">
                        <h2 className="text-base font-semibold">Devices</h2>
                    </div>
                    <div className="divide-y divide-border/20">
                        <DeviceRow
                            name="iPhone 14 Pro"
                            lastUsed="2 days ago"
                            type="mobile"
                        />
                        <DeviceRow
                            name="Surface Pro 8"
                            lastUsed="1 week ago"
                            type="desktop"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
