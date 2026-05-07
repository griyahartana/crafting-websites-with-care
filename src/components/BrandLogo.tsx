import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  imageClassName?: string;
};

export const BrandLogo = ({ className, imageClassName }: BrandLogoProps) => (
  <div className={cn("shrink-0 overflow-hidden rounded-[8px] bg-[#079667]", className)}>
    <img
      src="/layerfarm-logo.svg"
      alt="LayerFarm OS"
      className={cn("h-full w-full object-cover", imageClassName)}
      width={512}
      height={512}
    />
  </div>
);
