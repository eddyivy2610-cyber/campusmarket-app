import { Search, Plus, Filter, ArrowDownUp } from "lucide-react";

interface ListingsToolbarProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
}

export function ListingsToolbar({ searchQuery, setSearchQuery }: ListingsToolbarProps) {
    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
            {/* Search and Filters */}
            <div className="flex items-center gap-2 w-full md:max-w-xl">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search listings by title or tags..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-10 pl-9 pr-4 rounded-xl border border-border/50 bg-secondary/20 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                </div>
                <button className="h-10 px-4 rounded-xl border border-border/50 bg-secondary/20 text-sm hover:bg-secondary/40 transition-colors flex items-center gap-2 group whitespace-nowrap">
                    <Filter className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <span>Filter</span>
                </button>
                <button className="h-10 px-4 rounded-xl border border-border/50 bg-secondary/20 text-sm hover:bg-secondary/40 transition-colors flex items-center gap-2 group whitespace-nowrap hidden sm:flex">
                    <ArrowDownUp className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <span>Sort</span>
                </button>
            </div>

            {/* Actions */}
            <button className="w-full md:w-auto h-10 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-medium tracking-tight hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-sm">
                <Plus className="w-4 h-4" />
                <span>Create Listing</span>
            </button>
        </div>
    );
}
