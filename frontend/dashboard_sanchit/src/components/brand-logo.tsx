import studyVaultLogo from "@/assets/studyvault.png";
import studyVaultMark from "@/assets/studyvault-mark.png";

type BrandLogoProps = {
  /** Sizing/spacing classes for the image itself. */
  className?: string;
  alt?: string;
};

/** Full StudyVault lockup (cap + wordmark), black on white. */
export function BrandLogo({ className = "h-full w-full", alt = "StudyVault" }: BrandLogoProps) {
  return <img src={studyVaultLogo} alt={alt} className={`object-contain ${className}`} />;
}

/** Cap-only mark, trimmed and transparent so it fills its container. */
export function BrandMark({ className = "h-full w-full", alt = "StudyVault" }: BrandLogoProps) {
  return <img src={studyVaultMark} alt={alt} className={`object-contain ${className}`} />;
}

type BrandLogoTileProps = {
  /** Sizing classes for the tile, e.g. "h-10 w-10 rounded-xl". */
  className?: string;
  /** Inset around the mark. Keep it small — the mark is already trimmed. */
  imgClassName?: string;
};

/**
 * The brand mark on a white tile. The artwork is solid black, so it needs a
 * light backdrop to stay readable on the dark headers and sidebars.
 */
export function BrandLogoTile({
  className = "h-10 w-10 rounded-xl",
  imgClassName = "h-[78%] w-[78%]",
}: BrandLogoTileProps) {
  return (
    <span className={`grid shrink-0 place-items-center overflow-hidden bg-white ${className}`}>
      <BrandMark className={imgClassName} />
    </span>
  );
}

export { studyVaultLogo, studyVaultMark };
