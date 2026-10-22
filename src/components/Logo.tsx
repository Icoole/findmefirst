import logo from "@/assets/logo.png";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <img
      src={logo}
      alt="Findme"
      width={916}
      height={345}
      className={`w-auto ${className}`}
    />
  );
}
