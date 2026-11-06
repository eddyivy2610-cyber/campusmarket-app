import React from "react";
import Image from "next/image";
import Link from "next/link";

export interface LogoProps {
  className?: string;
  imageClassName?: string;
  height?: number;
  width?: number;
  href?: string | null;
  priority?: boolean;
  onClick?: () => void;
}

export function Logo({
  className = "",
  imageClassName = "",
  height = 38,
  width = 96,
  href = "/home",
  priority = true,
  onClick,
}: LogoProps) {
  const computedWidth = Math.max(width, Math.round(height * (1132 / 585)));

  const content = (
    <span className={`inline-flex items-center shrink-0 ${className}`}>
      {/* Light Theme Logo */}
      <Image
        src="/logo-light.png?v=3"
        alt="Campus Hive"
        width={computedWidth}
        height={height}
        priority={priority}
        unoptimized
        className={`dark:hidden block h-auto max-h-full w-auto object-contain ${imageClassName}`}
        style={{ height: `${height}px`, width: "auto" }}
      />
      {/* Dark Theme Logo */}
      <Image
        src="/logo-dark.png?v=3"
        alt="Campus Hive"
        width={computedWidth}
        height={height}
        priority={priority}
        unoptimized
        className={`hidden dark:block h-auto max-h-full w-auto object-contain ${imageClassName}`}
        style={{ height: `${height}px`, width: "auto" }}
      />
    </span>
  );

  if (href) {
    return (
      <Link
        href={href}
        onClick={onClick}
        className="inline-flex items-center group focus:outline-none transition-transform hover:opacity-95"
        aria-label="Campus Hive"
      >
        {content}
      </Link>
    );
  }

  return onClick ? (
    <button type="button" onClick={onClick} className="inline-flex items-center group focus:outline-none transition-transform hover:opacity-95">
      {content}
    </button>
  ) : (
    content
  );
}
