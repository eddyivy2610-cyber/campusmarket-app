import { X } from "lucide-react";

export function TopBar() {
    return (
        <div className="bg-[#1f2937] text-white text-[10px] py-1.5 tracking-wide border-b border-white/5">
            <div className="max-w-[1780px] mx-auto px-4 md:px-12 flex justify-between items-center">
                <div className="flex-1 text-center">
                    <span>
                        Limited time offer, get 10% off all products{" "}
                        <span className="font-bold">use code: CAMPUS10</span>
                    </span>
                </div>
            </div>
        </div>
    );
}
