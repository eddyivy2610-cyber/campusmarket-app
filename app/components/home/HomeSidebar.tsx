import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Truck, Clock, RefreshCcw, Star } from "lucide-react";
import { PRODUCTS } from "../../data/products";

export function HomeSidebar() {
    const guarantees = [
        { icon: Truck, title: "FREE DELIVERY", desc: "On Orders Over ₦20,000", color: "text-amber-500" },
        { icon: ShieldCheck, title: "ORDER PROTECTION", desc: "Secured Information", color: "text-blue-500" },
        { icon: Clock, title: "PROMOTION GIFT", desc: "Special Offers!", color: "text-emerald-500" },
        { icon: RefreshCcw, title: "MONEY BACK", desc: "Return over 30 Days", color: "text-rose-500" }
    ];

    const latestProducts = PRODUCTS.slice(5, 10);

    return (
        <aside className="hidden lg:flex flex-col w-[260px] xl:w-[280px] shrink-0 gap-6 sticky top-24 h-max">

            {/* Latest Products Sidebar Widget */}
            <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-border/50 bg-secondary/20">
                    <h3 className="font-bold text-[13px] font-heading uppercase tracking-widest text-foreground">Latest Products</h3>
                </div>
                <div className="p-3 flex flex-col gap-3">
                    {latestProducts.map((product, idx) => (
                        <Link key={idx} href={`/listings/${product.id}`} className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary/50 transition-colors group">
                            <div className="w-16 h-16 rounded-lg bg-muted relative shrink-0 overflow-hidden">
                                <Image src={product.image} alt={product.title} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight">{product.title}</h4>
                                <div className="flex items-center gap-0.5 mt-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-2.5 h-2.5 ${i < 4 ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}`} />
                                    ))}
                                    <span className="text-[9px] text-muted-foreground ml-1">({product.recommendedCount})</span>
                                </div>
                                <div className="mt-1 flex items-center gap-2">
                                    <span className="text-xs font-bold text-primary">₦{product.price.toLocaleString()}</span>
                                    {product.offer && <span className="text-[10px] text-muted-foreground line-through">₦{(product.price * 1.3).toLocaleString()}</span>}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Service Guarantees Widget */}
            <div className="bg-card rounded-2xl border border-border/50 shadow-sm p-5 flex flex-col gap-5">
                {guarantees.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                        <div key={idx} className="flex gap-4 items-center">
                            <div className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center shrink-0">
                                <Icon className={`w-5 h-5 ${item.color}`} />
                            </div>
                            <div>
                                <h4 className="text-[11px] font-bold font-heading text-foreground uppercase tracking-wider">{item.title}</h4>
                                <p className="text-[10px] text-muted-foreground mt-0.5">{item.desc}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Side Banner Ad */}
            <div className="h-48 rounded-2xl overflow-hidden bg-slate-900 relative group cursor-pointer border border-border/50 shadow-sm">
                <Image src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80" alt="Shoes Ad" fill className="object-cover opacity-60 group-hover:opacity-40 group-hover:scale-105 transition-all duration-700" />
                <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/80 to-transparent">
                    <span className="text-amber-400 text-[10px] font-bold uppercase tracking-widest mb-1 block">New Arrivals</span>
                    <h3 className="text-white font-heading font-extrabold text-lg leading-tight">Trending Sneakers</h3>
                </div>
            </div>

        </aside>
    );
}
