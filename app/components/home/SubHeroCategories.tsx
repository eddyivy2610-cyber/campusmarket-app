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
        <section className="hidden md:block pt-2 pb-2 space-y-3">
            <div className="flex items-center gap-2">
                <div className="w-2 h-5 bg-[#FFD700] rounded-none shadow-sm" />
                <h2 className="text-sm md:text-base font-bold text-[#1f1f1f] dark:text-foreground">
                    Looking for something specific?
                </h2>
                <div className="ml-auto">
                    <Link href="/listings" className="text-[10px] md:text-[11px] font-semibold text-[#6b6458] dark:text-foreground/70 hover:text-[#1f1f1f] dark:hover:text-foreground transition-colors">
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
                            className="group relative flex flex-col items-center justify-center text-center rounded-2xl border border-[#efe3cf] dark:border-border/70 bg-white dark:bg-card transition-all duration-300 p-2.5 shadow-[0_10px_24px_rgba(40,30,10,0.08)] dark:shadow-[0_12px_26px_rgba(0,0,0,0.35)] hover:-translate-y-1 hover:scale-[1.02] hover:border-[#FFD700]/60 hover:bg-[#fff9e6] dark:hover:bg-white/10 hover:shadow-[0_18px_36px_rgba(40,30,10,0.16)] dark:hover:shadow-[0_20px_36px_rgba(0,0,0,0.5)] min-w-[110px] w-[110px] aspect-square"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#FFD700]/30 bg-[#FFD700] text-black transition-all duration-300 group-hover:bg-[#fff3c6] dark:group-hover:bg-[#FFD700] group-hover:text-black group-hover:shadow-[0_0_0_4px_rgba(255,215,0,0.15)]">
                                <Icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3" />
                            </div>
                            <p className="mt-2 text-[10px] md:text-[11px] font-semibold text-[#1f1f1f] dark:text-foreground group-hover:text-black dark:group-hover:text-foreground">
                                {item.label}
                            </p>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
