"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CheckCheck } from "lucide-react";
import { useClickOutside } from "../../hooks/useClickOutside";
import { useAuth } from "../../context/AuthContext";
import { apiGet, apiPatch } from "@/lib/apiClient";
import { NotificationLoadingDots, NotificationSkeletons } from "./NotificationLoading";

type Props = { isOpen: boolean; onClose: () => void; onChanged?: () => void };
type Notification = { _id: string; title: string; message: string; link?: string; read: boolean };
export function NotificationsModal({ isOpen, onClose, onChanged }: Props) {
  const ref = useRef<HTMLDivElement>(null); const { user } = useAuth(); const [items, setItems] = useState<Notification[]>([]); const [loading, setLoading] = useState(false); const [working, setWorking] = useState(false); useClickOutside(ref, onClose);
  useEffect(() => { if (!isOpen || !user) return; setLoading(true); void apiGet("/api/notifications?limit=5").then((response: any) => setItems((response.data || []).map((item: any) => ({ ...item, _id: String(item._id || item.id) })))).finally(() => setLoading(false)); }, [isOpen, user?.id]);
  const markRead = async (id: string) => { setWorking(true); try { await apiPatch(`/api/notifications/${id}`, {}); setItems((current) => current.map((item) => item._id === id ? { ...item, read: true } : item)); onChanged?.(); } finally { setWorking(false); } };
  const markAll = async () => { setWorking(true); try { await apiPatch("/api/notifications/read-all", {}); setItems((current) => current.map((item) => ({ ...item, read: true }))); onChanged?.(); } finally { setWorking(false); } };
  if (!isOpen) return null;
  return <div ref={ref} className="absolute top-full right-0 mt-2 w-[320px] z-50 bg-background rounded-xl shadow-2xl border border-border overflow-hidden"><div className="px-3 py-2 border-b border-border/50 flex items-center justify-between"><h3 className="font-bold text-xs">Notifications</h3><button disabled={working} onClick={() => void markAll()} className="text-primary text-[10px] font-bold flex items-center gap-1 disabled:opacity-60"><CheckCheck className="w-3 h-3"/>{working ? <NotificationLoadingDots /> : "Mark all read"}</button></div><div className="max-h-[300px] overflow-y-auto">{loading && items.length === 0 ? <NotificationSkeletons compact /> : <div className="divide-y divide-border/30">{items.length ? items.map((item) => <div key={item._id} className={`px-3 py-3 ${!item.read ? "bg-primary/5" : ""}`}><button disabled={working} onClick={() => !item.read && void markRead(item._id)} className="text-left w-full disabled:opacity-70"><p className={`text-[11px] ${!item.read ? "font-bold" : "font-semibold"}`}>{item.title}</p><p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{item.message}</p></button>{item.link && <Link href={item.link} onClick={() => { if (!item.read) void markRead(item._id); onClose(); }} className="mt-1 inline-block text-[10px] font-bold text-primary">View details</Link>}</div>) : <div className="py-8 text-center text-xs text-muted-foreground">{user ? "No recent notifications." : "Sign in to receive updates."}</div>}</div>}</div><div className="px-3 py-2 border-t border-border/50 text-center"><Link href="/notifications" onClick={onClose} className="text-[11px] font-bold text-primary">View all notifications →</Link></div></div>;
}
