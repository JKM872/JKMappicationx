import * as LucideIcons from 'lucide-react';

// ============================================================================
// CUSTOM PLATFORM ICONS (SVG - Shadcn-compatible)
// ============================================================================

interface PlatformIconProps {
    className?: string;
    size?: number;
}

// X (Twitter) Icon - Official X logo
export function XIcon({ className = '', size = 20 }: PlatformIconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            width={size}
            height={size}
            className={className}
            fill="currentColor"
        >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    );
}

// Reddit Icon
export function RedditIcon({ className = '', size = 20 }: PlatformIconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            width={size}
            height={size}
            className={className}
            fill="currentColor"
        >
            <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
        </svg>
    );
}

// Threads Icon
export function ThreadsIcon({ className = '', size = 20 }: PlatformIconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            width={size}
            height={size}
            className={className}
            fill="currentColor"
        >
            <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.182.408-2.256 1.33-3.022.812-.675 1.89-1.082 3.112-1.18-.104-.296-.191-.6-.263-.91l-1.12-.232c-1.492-.31-2.598-.91-3.294-1.79-.736-.93-1.065-2.155-.952-3.546.162-1.98 1.49-4.016 4.15-4.302l.202 1.99c-1.79.192-2.69 1.47-2.79 2.69-.073.912.166 1.693.69 2.255.476.512 1.224.858 2.225 1.029l.962.2c-.216-.99-.212-1.99.01-2.97.31-1.36 1.062-2.56 2.174-3.468C10.123 3.089 11.123 2.75 12.24 2.75c2.407 0 4.412 1.525 4.907 3.735.138.615.139 1.25.003 1.878l-.93-.186c.092-.427.09-.865-.006-1.293-.35-1.562-1.765-2.644-3.464-2.644-.803 0-1.548.245-2.156.71-.79.604-1.328 1.498-1.555 2.585-.143.685-.14 1.408.008 2.118l2.166.448c1.478.306 2.61.878 3.37 1.703.867.944 1.195 2.166 1.025 3.552-.128 1.04-.522 1.991-1.172 2.826-.832 1.07-2.03 1.857-3.56 2.341l-.61-1.903c1.122-.355 1.99-.926 2.58-1.686.463-.596.748-1.297.846-2.082.102-.836-.084-1.527-.538-2.001-.546-.57-1.42-.973-2.598-1.197l-2.376-.491.112.54c.288 1.395.115 2.717-.5 3.827-.517.935-1.3 1.594-2.266 1.905l-.654-1.89c.564-.182.995-.523 1.284-1.016.35-.599.435-1.356.256-2.253l-.2-.968c-.678.105-1.28.348-1.748.705-.572.437-.846 1.022-.795 1.696.043.563.326 1.019.82 1.321.563.345 1.32.523 2.127.5.983-.026 1.773-.354 2.351-1.004.503-.564.82-1.331.943-2.282.039-.3.053-.61.043-.925l1.047.308c.035.488.006.984-.088 1.48-.17.897-.508 1.71-1.007 2.42-.708.999-1.73 1.758-2.958 2.196-1.39.495-3 .64-4.64.418-1.7-.23-3.17-.843-4.25-1.772-1.19-1.022-1.83-2.392-1.79-3.847.037-1.357.628-2.538 1.71-3.416 1.17-.95 2.76-1.46 4.59-1.472l.08 1.99z" />
        </svg>
    );
}

// Dev.to Icon
export function DevToIcon({ className = '', size = 20 }: PlatformIconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            width={size}
            height={size}
            className={className}
            fill="currentColor"
        >
            <path d="M7.42 10.05c-.18-.16-.46-.23-.84-.23H6v4.36h.58c.37 0 .65-.08.84-.23.19-.15.29-.37.29-.74v-2.42c0-.37-.1-.59-.29-.74zm7.12-.36h-.86V8.5h.86c.27 0 .49.08.65.23.16.16.24.37.24.65 0 .28-.08.49-.24.65-.16.15-.38.23-.65.23zM3 3v18h18V3H3zm4.64 10.76c-.35.35-.8.53-1.37.53H4.56V6.71h1.71c.57 0 1.02.18 1.37.53.35.35.53.8.53 1.37v3.78c0 .57-.18 1.02-.53 1.37zm4.6-1.31h-.86v2.02h-.91V6.71h1.77c.59 0 1.06.17 1.41.51.35.34.53.8.53 1.37 0 .59-.18 1.05-.53 1.39-.35.34-.82.51-1.41.51zm3.87 3.68l-1.18-3.2h-.81v3.2h-.91V6.71h1.77c.59 0 1.06.17 1.41.51.35.34.53.8.53 1.37 0 .62-.2 1.12-.6 1.48l1.37 3.65h-1.58z" />
        </svg>
    );
}

// Export platform icons map
export const PlatformIcons = {
    Twitter: XIcon,
    'X': XIcon,
    Reddit: RedditIcon,
    Threads: ThreadsIcon,
    'Dev.to': DevToIcon,
    devto: DevToIcon,
} as const;

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
