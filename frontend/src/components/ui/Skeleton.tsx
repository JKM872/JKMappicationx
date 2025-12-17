import React from 'react';

// ============================================================================
// SKELETON COMPONENT
// ============================================================================

interface SkeletonProps {
    className?: string;
    variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
    width?: string | number;
    height?: string | number;
    animation?: 'pulse' | 'wave' | 'none';
}

export function Skeleton({
    className = '',
    variant = 'text',
    width,
    height,
    animation = 'wave',
}: SkeletonProps) {
    const baseClasses = 'bg-white/5';

    const variantClasses = {
        text: 'rounded',
        circular: 'rounded-full',
        rectangular: 'rounded-none',
        rounded: 'rounded-xl',
    };

    const animationClasses = {
        pulse: 'animate-pulse',
        wave: 'skeleton',
        none: '',
    };

    const style: React.CSSProperties = {
        width: width ?? (variant === 'text' ? '100%' : undefined),
        height: height ?? (variant === 'text' ? '1em' : undefined),
    };

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
            style={style}
        />
    );
}

// ============================================================================
// SKELETON CARD - For post cards
// ============================================================================

export function SkeletonCard() {
    return (
        <div className="glass-card p-4 rounded-xl space-y-3">
            {/* Platform badge */}
            <div className="flex items-center justify-between">
                <Skeleton variant="rounded" width={80} height={24} />
                <Skeleton variant="rounded" width={60} height={20} />
            </div>

            {/* Content lines */}
            <div className="space-y-2">
                <Skeleton variant="text" height={16} />
                <Skeleton variant="text" height={16} width="90%" />
                <Skeleton variant="text" height={16} width="75%" />
            </div>

            {/* Author row */}
            <div className="flex items-center gap-2 pt-2">
                <Skeleton variant="circular" width={24} height={24} />
                <Skeleton variant="text" width={100} height={14} />
                <Skeleton variant="text" width={60} height={14} className="ml-auto" />
            </div>

            {/* Stats row */}
            <div className="flex items-center gap-4 pt-2 border-t border-white/5">
                <Skeleton variant="rounded" width={50} height={20} />
                <Skeleton variant="rounded" width={50} height={20} />
                <Skeleton variant="rounded" width={50} height={20} />
            </div>
        </div>
    );
}

// ============================================================================
// SKELETON LIST - Multiple skeleton cards
// ============================================================================

interface SkeletonListProps {
    count?: number;
}

export function SkeletonList({ count = 3 }: SkeletonListProps) {
    return (
        <div className="space-y-4">
            {Array.from({ length: count }).map((_, index) => (
                <SkeletonCard key={index} />
            ))}
        </div>
    );
}
