import Image from "next/image";

type AvatarSize = "S" | "L";
type AvatarType = "Photo" | "Placeholder";

interface AvatarProps {
  size?: AvatarSize;
  type?: AvatarType;
  src?: string;
  alt?: string;
  className?: string;
}

const sizeMap: Record<AvatarSize, { px: number; icon: number }> = {
  S: { px: 40, icon: 24 },
  L: { px: 80, icon: 40 },
};

export default function Avatar({
  size = "S",
  type = "Placeholder",
  src,
  alt = "",
  className = "",
}: AvatarProps) {
  if (process.env.NODE_ENV === "development" && type === "Photo" && !src) {
    console.warn("Avatar: type='Photo' requires a src prop — falling back to Placeholder");
  }

  const { px, icon } = sizeMap[size];
  const dim = `${px}px`;
  const iconDim = `${icon}px`;

  return (
    <div
      className={`relative rounded-full overflow-hidden bg-brand-light flex items-center justify-center shrink-0 ${className}`}
      style={{ width: dim, height: dim }}
    >
      {type === "Photo" && src ? (
        <Image src={src} alt={alt} fill className="object-cover" />
      ) : (
        <svg
          width={iconDim}
          height={iconDim}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"
            fill="#202464"
          />
        </svg>
      )}
    </div>
  );
}
