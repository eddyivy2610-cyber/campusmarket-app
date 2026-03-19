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
                <div className="w-2 h-5 bg-[#f2c94c] rounded-none shadow-sm" />
                <h2 className="text-sm md:text-base font-bold text-[#1f1f1f]">
                    Looking for something specific?
                </h2>
                <div className="ml-auto">
                    <Link href="/listings" className="text-[10px] md:text-[11px] font-semibold text-[#6b6458] hover:text-[#1f1f1f] transition-colors">
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
                            className="group flex flex-col items-center justify-center text-center rounded-2xl border border-[#efe3cf] bg-white transition-all duration-200 p-2.5 shadow-[0_10px_24px_rgba(40,30,10,0.08)] hover:-translate-y-0.5 hover:border-[#f2c94c]/60 hover:bg-[#fff9e6] hover:shadow-[0_16px_32px_rgba(40,30,10,0.12)] min-w-[110px] w-[110px] aspect-square"
                        >
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#f2c94c]/30 bg-[#fff3c6] text-[#1f1f1f] transition-colors group-hover:bg-[#f2c94c] group-hover:text-black">
                                <Icon className="h-5 w-5" />
                            </div>
                            <p className="mt-2 text-[10px] md:text-[11px] font-semibold text-[#1f1f1f] group-hover:text-black">
                                {item.label}
                            </p>
                        </Link>
                    );
                })}
            </div>
        </section>
    );
}
