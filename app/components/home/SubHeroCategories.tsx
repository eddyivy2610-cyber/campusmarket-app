import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

export function SubHeroCategories() {
    const categories = [
        {
            title: "Fashion & Accessories",
            subtitle: "Up to 50% Off",
            image: "https://purepng.com/public/uploads/large/purepng.com-women-shoppingwomenpeoplepersonsfemaleshopping-1121525086701oaqxc.png", // Standalone object
            bgClass: "bg-[#d1c4e9] dark:bg-fuchsia-950/30",
            textClass: "text-[#aa00ff] dark:text-fuchsia-400",
            link: "/listings?category=Fashion",
        },
        {
            title: "Electronics & Tech",
            subtitle: "Black Friday Sale",
            image: "https://purepng.com/public/uploads/large/purepng.com-black-xbox-one-controllerxbox-onexbox-one-controllergamepadgame-controllergameplaygaming-17015283461246qjnx.png", // Transparent electronics
            bgClass: "bg-[#b0bec5] dark:bg-slate-800/80",
            textClass: "text-[#1e88e5] dark:text-blue-400",
            link: "/listings?category=Electronics",
        },
        {
            title: "Furniture & Decor",
            subtitle: "Best Sellers",
            image: "https://purepng.com/public/uploads/large/purepng.com-bedbedfurniturebeddingsleep-170152792618991wsc.png", // Transparent furniture
            bgClass: "bg-[#d7ccc8] dark:bg-stone-800/80",
            textClass: "text-[#f57f17] dark:text-amber-400",
            link: "/listings?category=Accomodation",
        },
        {
            title: "Health & Beauty",
            subtitle: "Clearance Sale",
            image: "https://purepng.com/public/uploads/large/purepng.com-cosmeticshealth-body-care-cosmetics-makeup-lipstick-601521035210q0e1z.png", // Transparent makeup
            bgClass: "bg-[#b2dfdb] dark:bg-teal-900/40",
            textClass: "text-[#00c853] dark:text-emerald-400",
            link: "/listings?category=Personal Care",
        }
    ];

    return (
        <section className="bg-background pt-6 pb-2">
            <div className="max-w-[1780px] mx-auto px-4 md:px-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
                    {categories.map((category, idx) => (
                        <Link
                            key={idx}
                            href={category.link}
                            className={`group relative overflow-hidden rounded-xl flex flex-col h-28 md:h-32 border border-border/50 hover:border-black/10 dark:hover:border-white/10 transition-colors shadow-sm ${category.bgClass}`}
                        >
                            <div className="p-3 md:p-4 flex flex-col z-20 h-full justify-between w-[60%]">
                                <div>
                                    <h4 className={`text-[8px] md:text-[10px] font-bold uppercase tracking-widest mb-0.5 ${category.textClass}`}>
                                        {category.subtitle}
                                    </h4>
                                    <h3 className="text-xs md:text-sm lg:text-base font-extrabold font-heading leading-tight text-slate-800 dark:text-slate-200">
                                        {category.title}
                                    </h3>
                                </div>
                                <span className="text-[10px] md:text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1 group-hover:text-slate-900 dark:group-hover:text-white transition-colors w-max mt-auto">
                                    Shop Now <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </div>

                            {/* Image Container directly mimicking the concept style */}
                            <div className="absolute top-0 right-0 bottom-0 w-[45%] md:w-[50%] bg-[#e2d5cd]/10 overflow-hidden flex items-center justify-center pointer-events-none">
                                {/* Solid background for the right panel to match the concept's split design better */}
                                <div className="absolute inset-0 bg-white/30 dark:bg-black/20" />
                                <Image
                                    src={category.image}
                                    alt={category.title}
                                    fill
                                    className="object-contain p-2 origin-center transition-transform duration-500 group-hover:scale-110 drop-shadow-lg z-10"
                                    sizes="(max-width: 768px) 100px, 150px"
                                />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
