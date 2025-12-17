import React from 'react';
import { TrendingUp, TrendingDown, Flame, Star, Zap, Clock, CheckCircle } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple' | 'gradient';
type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps {
    children: React.ReactNode;
    variant?: BadgeVariant;
    size?: BadgeSize;
    icon?: React.ReactNode;
    className?: string;
    dot?: boolean;
    pulse?: boolean;
}

interface PlatformBadgeProps {
    platform: 'Twitter' | 'Reddit' | 'Dev.to' | 'Threads';
    size?: BadgeSize;
    className?: string;
}

interface TrendBadgeProps {
    value: number;
    size?: BadgeSize;
    className?: string;
}

interface StatusBadgeProps {
    status: 'pending' | 'active' | 'completed' | 'error';
    size?: BadgeSize;
    className?: string;
}

// ============================================================================
// STYLE MAPPINGS
// ============================================================================

const variantStyles: Record<BadgeVariant, string> = {
    default: 'bg-white/10 text-gray-300 border-white/10',
    success: 'bg-green-500/10 text-green-400 border-green-500/30',
    warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    error: 'bg-red-500/10 text-red-400 border-red-500/30',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    gradient: 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white border-purple-500/30',
};

const sizeStyles: Record<BadgeSize, string> = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
};

// ============================================================================
// BADGE COMPONENT
// ============================================================================

export function Badge({
    children,
    variant = 'default',
    size = 'md',
    icon,
    className = '',
    dot = false,
    pulse = false,
}: BadgeProps) {
    const baseStyles = 'inline-flex items-center gap-1.5 rounded-full font-medium border';
    const variantClass = variantStyles[variant];
    const sizeClass = sizeStyles[size];

    return (
        <span className={`${baseStyles} ${variantClass} ${sizeClass} ${className}`}>
            {dot && (
                <span className={`w-1.5 h-1.5 rounded-full bg-current ${pulse ? 'animate-pulse' : ''}`} />
            )}
            {icon && <span className="inline-flex">{icon}</span>}
            {children}
        </span>
    );
}

// ============================================================================
// PLATFORM BADGE
// ============================================================================

const platformConfig: Record<string, { color: string; bgColor: string; label: string }> = {
    Twitter: { color: 'text-[#1DA1F2]', bgColor: 'bg-[#1DA1F2]/10 border-[#1DA1F2]/30', label: 'Twitter' },
    Reddit: { color: 'text-[#FF4500]', bgColor: 'bg-[#FF4500]/10 border-[#FF4500]/30', label: 'Reddit' },
    'Dev.to': { color: 'text-white', bgColor: 'bg-white/10 border-white/20', label: 'Dev.to' },
    Threads: { color: 'text-white', bgColor: 'bg-white/10 border-white/20', label: 'Threads' },
};

export function PlatformBadge({ platform, size = 'md', className = '' }: PlatformBadgeProps) {
    const config = platformConfig[platform];
    const sizeClass = sizeStyles[size];

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${config.bgColor} ${config.color} ${sizeClass} ${className}`}>
            {config.label}
        </span>
    );
}

// ============================================================================
// TREND BADGE
// ============================================================================

export function TrendBadge({ value, size = 'md', className = '' }: TrendBadgeProps) {
    const isPositive = value >= 0;
    const variant = isPositive ? 'success' : 'error';
    const Icon = isPositive ? TrendingUp : TrendingDown;

    return (
        <Badge variant={variant} size={size} className={className}>
            <Icon className="w-3 h-3" />
            {isPositive ? '+' : ''}{value}%
        </Badge>
    );
}

// ============================================================================
// STATUS BADGE
// ============================================================================

const statusConfig: Record<string, { variant: BadgeVariant; icon: React.ReactNode; label: string }> = {
    pending: { variant: 'warning', icon: <Clock className="w-3 h-3" />, label: 'Pending' },
    active: { variant: 'info', icon: <Zap className="w-3 h-3" />, label: 'Active' },
    completed: { variant: 'success', icon: <CheckCircle className="w-3 h-3" />, label: 'Completed' },
    error: { variant: 'error', icon: null, label: 'Error' },
};

export function StatusBadge({ status, size = 'md', className = '' }: StatusBadgeProps) {
    const config = statusConfig[status];

    return (
        <Badge variant={config.variant} size={size} icon={config.icon} className={className}>
            {config.label}
        </Badge>
    );
}

// ============================================================================
// SPECIAL BADGES
// ============================================================================

export function HotBadge({ className = '' }: { className?: string }) {
    return (
        <Badge variant="error" size="sm" className={`animate-pulse ${className}`}>
            <Flame className="w-3 h-3" />
            HOT
        </Badge>
    );
}

export function ViralBadge({ score, className = '' }: { score: number; className?: string }) {
    return (
        <Badge variant="gradient" size="sm" className={className}>
            <Star className="w-3 h-3" />
            {score}%
        </Badge>
    );
}

export function TrendingBadge({ className = '' }: { className?: string }) {
    return (
        <Badge variant="purple" size="sm" className={className}>
            <TrendingUp className="w-3 h-3" />
            Trending
        </Badge>
    );
}
