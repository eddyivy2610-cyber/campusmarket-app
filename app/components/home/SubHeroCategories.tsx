import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import categoryFashion from "../../../public/category-fashion.png";
import categoryTech from "../../../public/category-tech.png";
import categoryFurniture from "../../../public/category-furniture.png";
import categoryBeauty from "../../../public/category-beauty.jpg";

export function SubHeroCategories() {
    const categories = [
        {
            title: "Fashion & Accessories",
            image: categoryFashion,
            gradientClass: "from-[#f6d7f9] via-[#edd9ff] to-[#d6d9ff]",
            accentClass: "text-fuchsia-700",
            imageWrapClass: "bg-fuchsia-600/10",
            buttonClass: "bg-fuchsia-700 text-white",
            link: "/listings?category=Fashion",
        },
        {
            title: "Electronics & Tech",
            image: categoryTech,
            gradientClass: "from-[#d7ecff] via-[#d5e5ff] to-[#dde0ff]",
            accentClass: "text-blue-700",
            imageWrapClass: "bg-blue-700/10",
            buttonClass: "bg-blue-700 text-white",
            link: "/listings?category=Electronics",
        },
        {
            title: "Furniture & Decor",
            image: categoryFurniture,
            gradientClass: "from-[#ffe5d0] via-[#ffecd9] to-[#fff6e8]",
            accentClass: "text-amber-700",
            imageWrapClass: "bg-amber-600/10",
            buttonClass: "bg-amber-700 text-white",
            link: "/listings?category=Accomodation",
        },
        {
            title: "Health & Beauty",
            image: categoryBeauty,
            gradientClass: "from-[#d7f7ef] via-[#dcf8ea] to-[#ecfff8]",
            accentClass: "text-emerald-700",
            imageWrapClass: "bg-emerald-700/10",
            buttonClass: "bg-emerald-700 text-white",
            link: "/listings?category=Personal Care",
        }
    ];

    return (
        <section className="pt-3 pb-2 space-y-3">
            <div className="flex items-center justify-between mb-1 border-b-2 border-orange-500 pb-1.5">
                <div className="radius-native flex items-center gap-2 bg-orange-500 text-white px-3 py-1 rounded-t-md">
                    <h2 className="text-xs md:text-sm font-bold uppercase tracking-wider">Top Categories</h2>
                </div>
                <Link href="/listings" className="text-[11px] md:text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                    View all
                </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-3">
                {categories.map((category, idx) => (
                    <Link
                        key={idx}
                        href={category.link}
                        className="group relative overflow-hidden rounded-xl min-h-[112px] md:min-h-[124px] border border-black/10 shadow-[0_8px_24px_rgba(15,23,42,0.08)] bg-transparent transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(15,23,42,0.14)]"
                    >
                        <div className={`absolute inset-0 opacity-55 bg-gradient-to-br ${category.gradientClass}`} />
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(255,255,255,0.75),transparent_55%)]" />
                        <div className="relative z-10 p-3 md:p-3.5 flex h-full flex-col">
                            <div className="mt-1 max-w-[66%]">
                                <h3 className="text-[12px] md:text-sm font-extrabold font-heading leading-tight text-slate-900">
                                    {category.title}
                                </h3>
                            </div>

                            <div className="mt-auto flex items-center gap-1.5">
                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold shadow-sm transition-transform group-hover:translate-x-0.5 ${category.buttonClass}`}>
                                    Shop now <ArrowUpRight className="h-3.5 w-3.5" />
                                </span>
                                <span className={`text-[10px] font-semibold ${category.accentClass}`}>Featured</span>
                            </div>
                        </div>

                        <div className={`absolute -right-8 -bottom-8 h-28 w-28 rounded-full blur-2xl ${category.imageWrapClass}`} />
                        <div className="absolute right-1.5 bottom-0.5 h-[72%] w-[42%] pointer-events-none">
                            <Image
                                src={category.image}
                                alt={category.title}
                                fill
                                className="object-contain object-bottom drop-shadow-[0_14px_22px_rgba(15,23,42,0.22)] transition-transform duration-300 group-hover:scale-105"
                                sizes="(max-width: 640px) 110px, (max-width: 1280px) 140px, 170px"
                            />
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}
