import { Link } from "react-router";
import { cn } from "~/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  linkTo?: string;
  fill?: string;
  useInlineSvg?: boolean;
}

export function Logo({
  size = "md",
  className,
  linkTo = "/",
  fill = "currentColor",
  useInlineSvg = false,
}: LogoProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  // Always use crescent logo
  const darkLogoPath = "/images/logo-crescent-dark.svg";
  const lightLogoPath = "/images/logo-crescent-light.svg";

  // Inline SVG version of the crescent logo
  const InlineSvgLogo = (
    <div className={cn(
      "relative transition-all duration-300 hover:scale-105 group",
      sizeClasses[size],
      className
    )}>
      <svg viewBox="0 0 74 76" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path fillRule="evenodd" clipRule="evenodd" d="M67 56.9965C63.0995 58.5139 58.8568 59.3465 54.4197 59.3465C35.2495 59.3465 19.7089 43.8059 19.7089 24.6356C19.7089 17.7774 21.6979 11.3837 25.1306 6C12.1791 11.0385 3 23.6277 3 38.3609C3 57.5311 18.5406 73.0717 37.7108 73.0717C50.0228 73.0717 60.8377 66.6615 67 56.9965Z" fill={fill} />
        <path d="M26.249 6.71289C22.9481 11.89 21.0352 18.0375 21.0352 24.6357C21.0352 43.0737 35.982 58.0205 54.4199 58.0205C58.6899 58.0205 62.7699 57.2195 66.5195 55.7607L70.2979 54.291L68.1182 57.709C61.7227 67.7397 50.4946 74.3974 37.7109 74.3975C17.8086 74.3975 1.67408 58.2636 1.67383 38.3613C1.67383 23.0635 11.2058 9.99482 24.6494 4.76465L28.4277 3.29492L26.249 6.71289Z" stroke="black" strokeOpacity="0.02" strokeWidth="2.65182" />
        <circle cx="38" cy="38" r="34.6296" stroke={fill} strokeWidth="0.740741" />
      </svg>
    </div>
  );

  // Image-based logo (for light/dark mode)
  const ImageLogo = (
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

  // Choose which logo to use based on the useInlineSvg prop
  const logo = useInlineSvg ? InlineSvgLogo : ImageLogo;

  if (linkTo) {
    return (
      <Link to={linkTo} className="flex items-center">
        {logo}
      </Link>
    );
  }

  return logo;
}
