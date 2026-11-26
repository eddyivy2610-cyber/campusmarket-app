import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0E1015] px-6 py-16 text-center select-none">
      <div className="relative max-w-md w-full flex flex-col items-center justify-center">
        {/* Giant Subtle 404 Watermark */}
        <span
          aria-hidden="true"
          className="text-[140px] sm:text-[180px] font-black leading-none tracking-tight text-[#E9ECEF] dark:text-white/[0.06] pointer-events-none"
        >
          404
        </span>

        {/* Foreground Copy & CTA */}
        <div className="-mt-10 sm:-mt-12 relative z-10 flex flex-col items-center space-y-3">
          <h1 className="text-[24px] sm:text-[28px] font-bold tracking-[-0.02em] text-[#171717] dark:text-white">
            Oops...page not found
          </h1>
          <p className="text-[13px] sm:text-[13.5px] text-[#68707A] dark:text-neutral-400 max-w-xs leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or may have been moved.
          </p>
          <div className="pt-2">
            <Link
              href="/home"
              className="inline-flex items-center justify-center rounded-full bg-[#1F242D] hover:bg-[#171717] dark:bg-[#FFC928] dark:hover:bg-[#F2BD24] text-white dark:text-[#171717] px-6 py-2.5 text-[12.5px] font-semibold shadow-xs transition-all active:scale-[0.98]"
            >
              Go back home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
