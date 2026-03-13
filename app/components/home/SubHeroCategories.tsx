import Link from "next/link";
import { Smartphone, BookOpen, Home, UtensilsCrossed, Shirt, Sparkles, Dumbbell, Music } from "lucide-react";

export function SubHeroCategories() {
    const items = [
        {
            label: "Phones",
            key: "phones",
            icon: Smartphone,
            link: "/listings?category=Electronics",
        },
        {
            label: "Books",
            key: "books",
            icon: BookOpen,
            link: "/listings?category=Academics",
        },
        {
            label: "Housing",
            key: "housing",
            icon: Home,
            link: "/listings?category=Accomodation",
        },
        {
            label: "Food & Provisions",
            key: "food",
            icon: UtensilsCrossed,
            link: "/listings?category=Food%20%26%20Provisions",
        },
        {
            label: "Fashion",
            key: "fashion",
            icon: Shirt,
            link: "/listings?category=Fashion",
        },
        {
            label: "Personal Care",
            key: "personal-care",
            icon: Sparkles,
            link: "/listings?category=Personal%20Care",
        },
        {
            label: "Sports & Fitness",
            key: "sports",
            icon: Dumbbell,
            link: "/listings?category=Sports%20%26%20Fitness",
        },
        {
            label: "Entertainment",
            key: "entertainment",
            icon: Music,
            link: "/listings?category=Entertainment",
        }
    ];

    return (
        <section className="hidden md:block pt-0 pb-0 space-y-3">
            <div className="flex items-center gap-2">
                <div className="w-2 h-5 bg-primary rounded-none" />
                <h2 className="text-xs md:text-sm font-semibold text-primary">
                    Looking for something specific?
                </h2>
                <div className="ml-auto">
                    <Link href="/listings" className="text-[10px] md:text-[11px] font-semibold text-primary/80 hover:text-primary transition-colors">
                        View all
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-8 gap-2.5 md:gap-3 overflow-x-auto pb-1">
                {items.map((item) => {
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.key}
                            href={item.link}
                            className="group flex flex-col items-center justify-center text-center rounded-lg border border-orange-100/90 bg-white dark:bg-card dark:border-border/40 transition-all duration-200 p-2.5 shadow-[0_6px_18px_rgba(15,23,42,0.08)] hover:-translate-y-0.5 hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:shadow-[0_12px_24px_rgba(15,23,42,0.16)] min-w-[110px] w-[110px] aspect-square"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-none border border-orange-100/90 bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300 shadow-inner group-hover:bg-orange-200 transition-colors">
                                <Icon className="h-5 w-5" />
                            </div>
                            <p className="mt-2 text-[10px] md:text-[11px] font-semibold text-foreground group-hover:text-orange-700 dark:group-hover:text-orange-300">
                                {item.label}
                            </p>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
