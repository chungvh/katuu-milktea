import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

const SVGIcon: React.FC<IconProps> = ({ className, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  />
);

export const ToppingIcon: React.FC<IconProps> = (props) => (
    <SVGIcon {...props}>
        <circle cx="12" cy="15" r="2.5" />
        <circle cx="8" cy="9" r="2.5" />
        <circle cx="16" cy="9" r="2.5" />
    </SVGIcon>
);

export const SizeIcon: React.FC<IconProps> = (props) => (
    <SVGIcon {...props}>
        <path d="M6 21l-3-9h18l-3 9H6z" />
        <path d="M10 3v2" />
        <path d="M14 3v2" />
        <path d="M3 12h18" />
    </SVGIcon>
);

export const SugarIcon: React.FC<IconProps> = (props) => (
    <SVGIcon {...props}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </SVGIcon>
);

export const IceIcon: React.FC<IconProps> = (props) => (
    <SVGIcon {...props}>
        <path d="M12 2v20" />
        <path d="M2 12h20" />
        <path d="m4.9 4.9 2.1 2.1" />
        <path d="m17 17 2.1 2.1" />
        <path d="m4.9 19.1 2.1-2.1" />
        <path d="m17 7-2.1-2.1" />
    </SVGIcon>
);

export const BobaIcon: React.FC<IconProps> = (props) => (
  <SVGIcon {...props} strokeWidth="1.5">
    <path d="M15.33 21.5H8.67a3 3 0 01-2.9-4.14L7.5 9.5h9l1.73 7.86a3 3 0 01-2.9 4.14z" />
    <path d="M20.2 9.5H3.8a1 1 0 01-1-1.2L4.66 3.4A1 1 0 015.6 2.5h12.8a1 1 0 01.94.9l1.86 4.9a1 1 0 01-1 1.2z" />
    <circle cx="10" cy="18.5" r="1" />
    <circle cx="14" cy="18.5" r="1" />
    <circle cx="12" cy="14.5" r="1" />
  </SVGIcon>
);

export const XIcon: React.FC<IconProps> = (props) => (
  <SVGIcon {...props}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </SVGIcon>
);

export const CheckIcon: React.FC<IconProps> = (props) => (
  <SVGIcon {...props} strokeWidth="3">
    <path d="M20 6L9 17l-5-5" />
  </SVGIcon>
);

export const HistoryIcon: React.FC<IconProps> = (props) => (
  <SVGIcon {...props}>
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M12 7v5l4 2" />
  </SVGIcon>
);

export const ArrowUpIcon: React.FC<IconProps> = (props) => (
  <SVGIcon {...props}>
    <path d="M12 19V5" />
    <path d="m5 12 7-7 7 7" />
  </SVGIcon>
);

export const EditIcon: React.FC<IconProps> = (props) => (
  <SVGIcon {...props}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </SVGIcon>
);

export const TrashIcon: React.FC<IconProps> = (props) => (
  <SVGIcon {...props}>
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </SVGIcon>
);

export const WarningIcon: React.FC<IconProps> = (props) => (
  <SVGIcon {...props}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </SVGIcon>
);

export const ArrowLeftIcon: React.FC<IconProps> = (props) => (
  <SVGIcon {...props}>
    <path d="M19 12H5" />
    <path d="m12 19-7-7 7-7" />
  </SVGIcon>
);

export const PackageIcon: React.FC<IconProps> = (props) => (
  <SVGIcon {...props}>
    <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v2" />
    <path d="M21 14v4a2 2 0 0 1-1 1.73l-7 4a2 2 0 0 1-2 0l-7-4A2 2 0 0 1 3 18v-4" />
    <path d="M3 10h18" />
    <path d="m3.3 8.7 8.7 5 8.7-5" />
    <path d="m12 22.7-8.7-5" />
  </SVGIcon>
);

export const DollarSignIcon: React.FC<IconProps> = (props) => (
  <SVGIcon {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
    <path d="M12 18V6" />
  </SVGIcon>
);

export const TrophyIcon: React.FC<IconProps> = (props) => (
  <SVGIcon {...props}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.87 18.75 7 20.24 7 22" />
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.13 18.75 17 20.24 17 22" />
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
  </SVGIcon>
);

export const SearchIcon: React.FC<IconProps> = (props) => (
  <SVGIcon {...props}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </SVGIcon>
);

export const RefreshIcon: React.FC<IconProps> = (props) => (
  <SVGIcon {...props}>
    <path d="M21 12a9 9 0 0 0-9-9 .94 .94 0 0 0-1 1v4" />
    <path d="M3 12a9 9 0 0 0 9 9 .94 .94 0 0 0 1-1v-4" />
    <path d="m3 7 3 3 3-3" />
    <path d="m21 17-3-3-3 3" />
  </SVGIcon>
);

export const SettingsIcon: React.FC<IconProps> = (props) => (
  <SVGIcon {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6m0 6v6" />
    <path d="m1 12 6 0m6 0h6" />
    <path d="m4.93 4.93 4.24 4.24m5.66 5.66 4.24 4.24" />
    <path d="m4.93 19.07 4.24-4.24m5.66-5.66 4.24-4.24" />
  </SVGIcon>
);

export const PlusIcon: React.FC<IconProps> = (props) => (
  <SVGIcon {...props}>
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </SVGIcon>
);

export const SaveIcon: React.FC<IconProps> = (props) => (
  <SVGIcon {...props}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </SVGIcon>
);

export const ImageIcon: React.FC<IconProps> = (props) => (
  <SVGIcon {...props}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </SVGIcon>
);

export const TagIcon: React.FC<IconProps> = (props) => (
  <SVGIcon {...props}>
    <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
    <path d="M7 7h.01" />
  </SVGIcon>
);

export const ListIcon: React.FC<IconProps> = (props) => (
  <SVGIcon {...props}>
    <line x1="8" y1="6" x2="21" y2="6" />
    <line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" />
    <line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" />
    <line x1="3" y1="18" x2="3.01" y2="18" />
  </SVGIcon>
);

export const ShoppingCartIcon: React.FC<IconProps> = (props) => (
  <SVGIcon {...props}>
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </SVGIcon>
);

export const UsersIcon: React.FC<IconProps> = (props) => (
  <SVGIcon {...props}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </SVGIcon>
);

export const ClockIcon: React.FC<IconProps> = (props) => (
  <SVGIcon {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </SVGIcon>
);

export const ReceiptIcon: React.FC<IconProps> = (props) => (
  <SVGIcon {...props}>
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
    <path d="M12 17V7" />
  </SVGIcon>
);

export const CheckCircleIcon: React.FC<IconProps> = (props) => (
  <SVGIcon {...props}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <path d="m9 11 3 3L22 4" />
  </SVGIcon>
);
