"use client";

import { Star } from "lucide-react";

export const PRODUCTS = [
    {
        id: "prod_1",
        title: "Casual T-Shirt Cotton",
        review: 4.7,
        sold: 210,
        profit: 22.2,
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?width=100&h=100&fit=crop"
    },
    {
        id: "prod_2",
        title: "Shirt Casual Elegant",
        review: 4.5,
        sold: 210,
        profit: 22.2,
        image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?width=100&h=100&fit=crop"
    },
    {
        id: "prod_3",
        title: "Bomber Jacket Winter",
        review: 4.0,
        sold: 210,
        profit: 22.2,
        image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?width=100&h=100&fit=crop"
    },
];

export function TopProductsTable() {
    return (
        <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm col-span-1 lg:col-span-2 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold font-heading">Top Products</h2>
                <button className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest underline decoration-2 underline-offset-4">See All</button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-border/30">
                            <th className="pb-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-medium w-12">No</th>
                            <th className="pb-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-medium">Product Name</th>
                            <th className="pb-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-medium text-center">Review</th>
                            <th className="pb-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-medium text-center">Sold</th>
                            <th className="pb-3 text-[10px] font-bold text-muted-foreground uppercase tracking-wider font-medium text-right">Profit</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {PRODUCTS.map((prod, idx) => (
                            <tr key={prod.id} className="border-b border-border/10 hover:bg-secondary/20 transition-colors group">
                                <td className="py-3 text-muted-foreground">{idx + 1}</td>
                                <td className="py-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-secondary">
                                            <img src={prod.image} alt={prod.title} className="w-full h-full object-cover" />
                                        </div>
                                        <span className="font-medium group-hover:text-primary transition-colors truncate max-w-[150px] sm:max-w-[200px]">{prod.title}</span>
                                    </div>
                                </td>
                                <td className="py-3 text-center">
                                    <div className="flex items-center justify-center gap-1 text-sm">
                                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                        <span className="font-bold">{prod.review.toFixed(1)}</span>
                                    </div>
                                </td>
                                <td className="py-3 text-center text-muted-foreground font-medium">{prod.sold}</td>
                                <td className="py-3 text-right font-bold text-emerald-600">₦{prod.profit}k</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
