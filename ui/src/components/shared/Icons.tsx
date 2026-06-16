import BloodDropIcon from '@/assets/icons/blood-drop.svg';
import UnprotectedHeartIcon from '@/assets/icons/unprotected-heart.svg';
import ProtectedHeartIcon from '@/assets/icons/protected-heart.svg';
import GenericHeartIcon from '@/assets/icons/generic-heart.svg';
import { ProtectionType } from '@/types';
// You might need a utility like 'clsx' or 'twMerge' for robust class merging, 
// but for simplicity, we'll assume the provided class is the main class.

interface IconProps {
  className?: string;
}

// These are fine, they pass the className down to the SVG
export const BloodDrop = ({ className = '' }: IconProps) => (
  <BloodDropIcon className={className} />
);

export const UnprotectedHeart = ({ className = '' }: IconProps) => (
  <UnprotectedHeartIcon className={className} />
);

export const ProtectedHeart = ({ className = '' }: IconProps) => (
  <ProtectedHeartIcon className={className} />
);

export const GenericHeart = ({ className = '' }: IconProps) => (
  <GenericHeartIcon className={className} />
);

// 🛑 FIX: Accept the className parameter
export const getHeartIcon = (protection: ProtectionType | undefined, className: string = "w-3.5 h-3.5") => {
  switch (protection) {
    case 'protected':
      return <ProtectedHeart className={`${className} text-gray-600`} />;
    case 'unprotected':
      return <UnprotectedHeart className={`${className} text-red-500`} />;
    default:
      return <GenericHeart className={`${className} text-gray-400`} />;
  }
};