import * as LucideIcons from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
type IconVariant = 'default' | 'muted' | 'primary' | 'success' | 'warning' | 'error' | 'gradient';

interface IconProps {
    name: keyof typeof LucideIcons | string;
    size?: IconSize;
    variant?: IconVariant;
    className?: string;
    gradient?: string;
}

// ============================================================================
// SIZE MAPPINGS
// ============================================================================

const sizeMap: Record<IconSize, string> = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
    '2xl': 'w-10 h-10',
};

const variantMap: Record<IconVariant, string> = {
    default: 'text-white',
    muted: 'text-gray-500',
    primary: 'text-blue-500',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    error: 'text-red-500',
    gradient: '', // Handled separately
};

// ============================================================================
// ICON COMPONENT
// ============================================================================

/**
 * Unified Icon component supporting Lucide icons
 */
export function Icon({
    name,
    size = 'md',
    variant = 'default',
    className = '',
    gradient
}: IconProps) {
    const LucideIcon = (LucideIcons as any)[name];

    if (!LucideIcon) {
        console.warn(`Icon "${name}" not found in Lucide icons`);
        return null;
    }

    const sizeClass = sizeMap[size];
    const variantClass = variant === 'gradient' ? '' : variantMap[variant];

    if (variant === 'gradient' || gradient) {
        const gradientStyle = gradient || 'from-purple-500 to-pink-500';
        return (
            <span className={`inline-flex bg-gradient-to-r ${gradientStyle} bg-clip-text`}>
                <LucideIcon
                    className={`${sizeClass} text-transparent ${className}`}
                    style={{ fill: 'url(#iconGradient)', stroke: 'currentColor' }}
                />
            </span>
        );
    }

    return (
        <LucideIcon className={`${sizeClass} ${variantClass} ${className}`} />
    );
}

// ============================================================================
// ICON SETS FOR COMMON USE CASES
// ============================================================================

export const ActionIcons = {
    search: 'Search',
    filter: 'Filter',
    sort: 'ArrowUpDown',
    refresh: 'RefreshCw',
    add: 'Plus',
    remove: 'Minus',
    delete: 'Trash2',
    edit: 'Edit3',
    copy: 'Copy',
    share: 'Share2',
    download: 'Download',
    upload: 'Upload',
    settings: 'Settings',
    close: 'X',
    menu: 'Menu',
    more: 'MoreHorizontal',
} as const;

export const StatusIcons = {
    success: 'CheckCircle',
    error: 'XCircle',
    warning: 'AlertTriangle',
    info: 'Info',
    loading: 'Loader2',
    pending: 'Clock',
} as const;

export const AnalyticsIcons = {
    chart: 'BarChart3',
    trend: 'TrendingUp',
    trendDown: 'TrendingDown',
    growth: 'ArrowUpRight',
    decline: 'ArrowDownRight',
    target: 'Target',
    fire: 'Flame',
    star: 'Star',
    heart: 'Heart',
    eye: 'Eye',
    users: 'Users',
} as const;

export const ContentIcons = {
    post: 'FileText',
    image: 'Image',
    video: 'Video',
    link: 'Link',
    hashtag: 'Hash',
    calendar: 'Calendar',
    clock: 'Clock',
    send: 'Send',
    reply: 'MessageCircle',
    repost: 'Repeat2',
} as const;

// ============================================================================
// ANIMATED ICONS
// ============================================================================

interface AnimatedIconProps extends IconProps {
    animation?: 'spin' | 'pulse' | 'bounce' | 'ping';
}

export function AnimatedIcon({ animation, ...props }: AnimatedIconProps) {
    const animationClass = animation ? `animate-${animation}` : '';
    return <Icon {...props} className={`${props.className || ''} ${animationClass}`} />;
}

// ============================================================================
// ICON BUTTON
// ============================================================================

interface IconButtonProps {
    icon: string;
    onClick?: () => void;
    size?: IconSize;
    variant?: 'ghost' | 'filled' | 'outline';
    disabled?: boolean;
    className?: string;
    title?: string;
}

export function IconButton({
    icon,
    onClick,
    size = 'md',
    variant = 'ghost',
    disabled = false,
    className = '',
    title
}: IconButtonProps) {
    const baseClass = 'rounded-lg transition-all duration-200 flex items-center justify-center';

    const variantClasses = {
        ghost: 'hover:bg-white/10 text-gray-400 hover:text-white',
        filled: 'bg-white/10 hover:bg-white/20 text-white',
        outline: 'border border-white/10 hover:border-white/30 text-gray-400 hover:text-white',
    };

    const sizeClasses = {
        xs: 'p-1',
        sm: 'p-1.5',
        md: 'p-2',
        lg: 'p-2.5',
        xl: 'p-3',
        '2xl': 'p-4',
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`${baseClass} ${variantClasses[variant]} ${sizeClasses[size]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <Icon name={icon} size={size} />
        </button>
    );
}

// ============================================================================
// GRADIENT DEFINITIONS (for SVG gradients)
// ============================================================================

export function IconGradientDefs() {
    return (
        <svg width="0" height="0" className="hidden">
            <defs>
                <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#EC4899" />
                </linearGradient>
                <linearGradient id="iconGradientBlue" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3B82F6" />
                    <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
                <linearGradient id="iconGradientOrange" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F97316" />
                    <stop offset="100%" stopColor="#FBBF24" />
                </linearGradient>
                <linearGradient id="iconGradientGreen" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10B981" />
                    <stop offset="100%" stopColor="#34D399" />
                </linearGradient>
            </defs>
        </svg>
    );
}
