import React from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface CardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'glass' | 'premium' | 'outline';
    hover?: boolean;
    clickable?: boolean;
    onClick?: (e?: React.MouseEvent<HTMLDivElement>) => void;
}

interface CardHeaderProps {
    children: React.ReactNode;
    className?: string;
    action?: React.ReactNode;
}

interface CardContentProps {
    children: React.ReactNode;
    className?: string;
    noPadding?: boolean;
}

interface CardFooterProps {
    children: React.ReactNode;
    className?: string;
}

// ============================================================================
// VARIANT STYLES
// ============================================================================

const variantStyles = {
    default: `
    bg-gray-900/50 
    border border-white/10
  `,
    glass: `
    bg-white/5 backdrop-blur-xl 
    border border-white/10
  `,
    premium: `
    bg-gradient-to-br from-gray-900/80 to-gray-800/50 
    backdrop-blur-xl 
    border border-white/10
    shadow-xl shadow-purple-500/5
  `,
    outline: `
    bg-transparent 
    border border-white/20
  `,
};

// ============================================================================
// CARD COMPONENT
// ============================================================================

export function Card({
    children,
    className = '',
    variant = 'default',
    hover = false,
    clickable = false,
    onClick,
}: CardProps) {
    const baseStyles = 'rounded-2xl overflow-hidden';
    const variantClass = variantStyles[variant];
    const hoverStyles = hover ? 'hover:border-white/20 hover:shadow-lg transition-all duration-300' : '';
    const clickableStyles = clickable ? 'cursor-pointer active:scale-[0.99]' : '';

    return (
        <div
            className={`${baseStyles} ${variantClass} ${hoverStyles} ${clickableStyles} ${className}`.trim().replace(/\s+/g, ' ')}
            onClick={onClick}
        >
            {children}
        </div>
    );
}

// ============================================================================
// CARD HEADER
// ============================================================================

export function CardHeader({ children, className = '', action }: CardHeaderProps) {
    return (
        <div className={`px-5 py-4 border-b border-white/5 flex items-center justify-between ${className}`}>
            <div className="flex-1">{children}</div>
            {action && <div className="ml-4">{action}</div>}
        </div>
    );
}

// ============================================================================
// CARD CONTENT
// ============================================================================

export function CardContent({ children, className = '', noPadding = false }: CardContentProps) {
    return (
        <div className={`${noPadding ? '' : 'p-5'} ${className}`}>
            {children}
        </div>
    );
}

// ============================================================================
// CARD FOOTER
// ============================================================================

export function CardFooter({ children, className = '' }: CardFooterProps) {
    return (
        <div className={`px-5 py-4 border-t border-white/5 ${className}`}>
            {children}
        </div>
    );
}

// ============================================================================
// CARD TITLE
// ============================================================================

interface CardTitleProps {
    children: React.ReactNode;
    className?: string;
    gradient?: boolean;
}

export function CardTitle({ children, className = '', gradient = false }: CardTitleProps) {
    const gradientClass = gradient
        ? 'bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent'
        : 'text-white';

    return (
        <h3 className={`text-lg font-semibold ${gradientClass} ${className}`}>
            {children}
        </h3>
    );
}

// ============================================================================
// CARD DESCRIPTION
// ============================================================================

interface CardDescriptionProps {
    children: React.ReactNode;
    className?: string;
}

export function CardDescription({ children, className = '' }: CardDescriptionProps) {
    return (
        <p className={`text-sm text-gray-400 mt-1 ${className}`}>
            {children}
        </p>
    );
}

// ============================================================================
// STAT CARD
// ============================================================================

interface StatCardProps {
    title: string;
    value: string | number;
    change?: number;
    icon?: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
    className?: string;
}

export function StatCard({
    title,
    value,
    change,
    icon,
    trend = 'neutral',
    className = '',
}: StatCardProps) {
    const trendColors = {
        up: 'text-green-400',
        down: 'text-red-400',
        neutral: 'text-gray-400',
    };

    const trendIcons = {
        up: '↑',
        down: '↓',
        neutral: '→',
    };

    return (
        <Card variant="glass" className={className}>
            <CardContent>
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-sm text-gray-400 mb-1">{title}</p>
                        <p className="text-2xl font-bold text-white">{value}</p>
                        {change !== undefined && (
                            <p className={`text-sm mt-1 ${trendColors[trend]}`}>
                                {trendIcons[trend]} {change > 0 ? '+' : ''}{change}%
                            </p>
                        )}
                    </div>
                    {icon && (
                        <div className="p-3 rounded-xl bg-white/5">
                            {icon}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
