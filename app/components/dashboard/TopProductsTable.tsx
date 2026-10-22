"use client";

export const PRODUCTS = [
    {
        id: "prod_1",
        title: "Home Decor Range",
        popularity: 72,
        sales: 45,
        color: "bg-blue-500"
    },
    {
        id: "prod_2",
        title: "Disney Princess Pink Bag 18\"",
        popularity: 58,
        sales: 29,
        color: "bg-emerald-500"
    },
    {
        id: "prod_3",
        title: "Bathroom Essentials",
        popularity: 38,
        sales: 18,
        color: "bg-amber-500"
    },
    {
        id: "prod_4",
        title: "Apple Smartwatches",
        popularity: 24,
        sales: 25,
        color: "bg-violet-500"
    },
];

export function TopProductsTable() {
    return (
        <div className="bg-card border border-border/50 rounded-2xl p-5 shadow-sm h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold font-heading">Top Products</h2>
                <button className="text-[10px] font-semibold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest">
                    See All
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-border/30">
                            <th className="pb-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider w-8">No</th>
                            <th className="pb-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                            <th className="pb-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Popularity</th>
                            <th className="pb-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider text-right">Sales</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {PRODUCTS.map((prod, idx) => (
                            <tr key={prod.id} className="border-b border-border/10">
                                <td className="py-3 text-muted-foreground">{String(idx + 1).padStart(2, "0")}</td>
                                <td className="py-3">
                                    <span className="font-medium text-foreground">{prod.title}</span>
                                </td>
                                <td className="py-3">
                                    <div className="h-2 w-full max-w-[180px] rounded-full bg-secondary/60 overflow-hidden">
                                        <div className={`h-full ${prod.color} rounded-full`} style={{ width: `${prod.popularity}%` }} />
                                    </div>
                                </td>
                                <td className="py-3 text-right">
                                    <span className="inline-flex items-center justify-center rounded-full bg-secondary px-2.5 py-1 text-[10px] font-semibold text-muted-foreground">
                                        {prod.sales}%
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
