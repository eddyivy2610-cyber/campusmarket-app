import { ProductCard } from "./ProductCard";
import { LayoutGrid, List, ChevronDown } from "lucide-react";
import { Product } from "../../data/products";

interface ShopGridProps {
    products: Product[];
}

export function ShopGrid({ products }: ShopGridProps) {
    return (
        <div className="flex-1">

            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-card border border-border/50 p-4 rounded-xl">
                <p className="text-sm text-muted-foreground font-medium">
                    Showing <span className="font-bold text-foreground">1-{products.length}</span> of <span className="font-bold text-foreground">{products.length}</span> results
                </p>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 border-r border-border/50 pr-4">
                        <span className="text-sm text-muted-foreground">Sort by:</span>
                        <div className="relative group">
                            <button className="flex items-center gap-1 text-sm font-bold text-foreground hover:text-primary transition-colors">
                                Newest Items
                                <ChevronDown className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-1">
                        <button className="p-2 bg-primary text-white rounded-lg shadow-sm">
                            <LayoutGrid className="w-4 h-4" />
                        </button>
                        <button className="p-2 bg-secondary text-muted-foreground rounded-lg hover:bg-secondary/80 transition-colors">
                            <List className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
                {products.length === 0 && (
                    <div className="col-span-full py-20 text-center">
                        <p className="text-muted-foreground text-lg italic">No products found matching your filters.</p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 mt-12">
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-border hover:bg-secondary transition-colors disabled:opacity-50">
                    &lt;
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg bg-primary text-white font-bold shadow-md">
                    1
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-border hover:bg-secondary transition-colors font-medium">
                    2
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-border hover:bg-secondary transition-colors font-medium">
                    3
                </button>
                <span className="px-2 text-muted-foreground">...</span>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-border hover:bg-secondary transition-colors font-medium">
                    8
                </button>
                <button className="w-10 h-10 flex items-center justify-center rounded-lg border border-border hover:bg-secondary transition-colors">
                    &gt;
                </button>
            </div>
        </div>
    );
}
