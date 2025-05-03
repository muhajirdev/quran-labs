import { Link } from "react-router";
import { cn } from "~/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  linkTo?: string;
}

export function Logo({
  size = "md",
  className,
  linkTo = "/",
}: LogoProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  // Always use crescent logo
  const darkLogoPath = "/images/logo-crescent-dark.svg";
  const lightLogoPath = "/images/logo-crescent-light.svg";

  const logo = (
    <div className={cn(
      "relative rounded-full overflow-hidden transition-all duration-300 hover:scale-105 group",
      sizeClasses[size],
      className
    )}>
      <img
        src={darkLogoPath}
        alt="Quran AI Logo"
        className="w-full h-full object-cover hidden dark:block"
      />
      <img
        src={lightLogoPath}
        alt="Quran AI Logo"
        className="w-full h-full object-cover block dark:hidden"
      />
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="flex items-center">
        {logo}
      </Link>
    );
  }

  return logo;
}
