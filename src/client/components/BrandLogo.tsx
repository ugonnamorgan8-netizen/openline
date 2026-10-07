import React from "react";
import dcreativsLogo from "../assets/dcreativs-logo.png";

interface BrandLogoProps {
  /** "light" = on dark bg (logo shows, white text)
   *  "dark"  = on light bg (logo shows, dark text) */
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  style?: React.CSSProperties;
}

/**
 * D'creativs brand mark with two-line text lockup:
 *   D'CREATIVS  (small, light-weight, tracking)
 *   OPENLINE    (bold, Sora)
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = "dark",
  size = "md",
  onClick,
  style,
}) => {
  const isLight = variant === "light";

  const iconSize = size === "sm" ? 26 : size === "lg" ? 44 : 34;
  const brandNameSize = size === "sm" ? 8.5 : size === "lg" ? 12 : 10;
  const openlineSize = size === "sm" ? 13 : size === "lg" ? 20 : 16.5;

  const brandNameColor = isLight ? "rgba(255,255,255,0.60)" : "rgba(15,23,42,0.50)";
  const openlineColor = isLight ? "#ffffff" : "#0f172a";

  return (
    <div
      className="brand-logo"
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
      style={{ cursor: onClick ? "pointer" : "default", alignItems: "center", ...style }}
    >
      <img
        src={dcreativsLogo}
        alt="D'creativs logo"
        width={iconSize}
        height={iconSize}
        style={{
          objectFit: "contain",
          flexShrink: 0,
          display: "block",
          borderRadius: "6px",
        }}
      />

      {/* Text lockup */}
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15, gap: "0px" }}>
        <span
          style={{
            fontSize: String(brandNameSize) + "px",
            fontWeight: 400,
            letterSpacing: "1.1px",
            color: brandNameColor,
            fontFamily: "var(--font-body)",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          {"D\u2019creativs"}
        </span>
        <span
          className="brand-text"
          style={{
            fontSize: String(openlineSize) + "px",
            fontFamily: "var(--font-heading)",
            color: openlineColor,
            letterSpacing: "0.5px",
            fontWeight: 800,
            lineHeight: 1,
          }}
        >
          OPENLINE
        </span>
      </div>
    </div>
  );
};