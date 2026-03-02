import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

export function SubHeroCategories() {
    const categories = [
        {
            title: "Fashion & Accessories",
            subtitle: "Up to 50% Off",
            image: "https://purepng.com/public/uploads/large/purepng.com-women-shoppingwomenpeoplepersonsfemaleshopping-1121525086701oaqxc.png",
            bgClass: "bg-[#d1c4e9] dark:bg-fuchsia-950/30",
            textClass: "text-[#aa00ff] dark:text-fuchsia-400",
            link: "/listings?category=Fashion",
        },
        {
            title: "Electronics & Tech",
            subtitle: "Black Friday Sale",
            image: "https://purepng.com/public/uploads/large/purepng.com-black-xbox-one-controllerxbox-one-controllergamepadgame-controllergameplaygaming-17015283461246qjnx.png",
            bgClass: "bg-[#b0bec5] dark:bg-slate-800/80",
            textClass: "text-[#1e88e5] dark:text-blue-400",
            link: "/listings?category=Electronics",
        },
        {
            title: "Furniture & Decor",
            subtitle: "Best Sellers",
            image: "https://purepng.com/public/uploads/large/purepng.com-bedbedfurniturebeddingsleep-170152792618991wsc.png",
            bgClass: "bg-[#d7ccc8] dark:bg-stone-800/80",
            textClass: "text-[#f57f17] dark:text-amber-400",
            link: "/listings?category=Accomodation",
        },
        {
            title: "Health & Beauty",
            subtitle: "Clearance Sale",
            image: "https://purepng.com/public/uploads/large/purepng.com-cosmeticshealth-body-care-cosmetics-makeup-lipstick-601521035210q0e1z.png",
            bgClass: "bg-[#b2dfdb] dark:bg-teal-900/40",
            textClass: "text-[#00c853] dark:text-emerald-400",
            link: "/listings?category=Personal Care",
        }
    ];

    return (
        <section className="pt-4 pb-2">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                {categories.map((category, idx) => (
                    <Link
                        key={idx}
                        href={category.link}
                        className={`group relative overflow-hidden rounded-xl flex flex-col h-20 md:h-24 border border-border/50 hover:border-black/10 dark:hover:border-white/10 transition-colors shadow-sm ${category.bgClass}`}
                    >
                        <div className="p-2.5 md:p-3 flex flex-col z-20 h-full justify-between w-[60%]">
                            <div>
                                <h4 className={`text-[7px] md:text-[9px] font-bold uppercase tracking-widest mb-0.5 ${category.textClass}`}>
                                    {category.subtitle}
                                </h4>
                                <h3 className="text-[11px] md:text-xs lg:text-sm font-extrabold font-heading leading-tight text-slate-800 dark:text-slate-200">
                                    {category.title}
                                </h3>
                            </div>
                            <span className="text-[9px] md:text-[10px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1 group-hover:text-slate-900 dark:group-hover:text-white transition-colors w-max mt-auto">
                                Shop Now <ChevronRight className="w-2.5 h-2.5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </div>

                        {/* Image Container */}
                        <div className="absolute top-0 right-0 bottom-0 w-[45%] md:w-[50%] bg-[#e2d5cd]/10 overflow-hidden flex items-center justify-center pointer-events-none">
                            <div className="absolute inset-0 bg-white/30 dark:bg-black/20" />
                            <Image
                                src={category.image}
                                alt={category.title}
                                fill
                                className="object-contain p-1.5 origin-center transition-transform duration-500 group-hover:scale-110 drop-shadow-lg z-10"
                                sizes="(max-width: 768px) 100px, 150px"
                            />
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}