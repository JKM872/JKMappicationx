import React from 'react';
import { Loader2 } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline' | 'gradient';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
    fullWidth?: boolean;
    gradient?: string;
}

// ============================================================================
// STYLE MAPPINGS
// ============================================================================

const variantStyles: Record<ButtonVariant, string> = {
    primary: `
    bg-gradient-to-r from-purple-600 to-pink-600 
    hover:from-purple-500 hover:to-pink-500 
    text-white shadow-lg shadow-purple-500/25
    border-0
  `,
    secondary: `
    bg-white/10 hover:bg-white/20 
    text-white border border-white/10
  `,
    ghost: `
    bg-transparent hover:bg-white/10 
    text-gray-400 hover:text-white
    border-0
  `,
    destructive: `
    bg-gradient-to-r from-red-600 to-rose-600 
    hover:from-red-500 hover:to-rose-500 
    text-white shadow-lg shadow-red-500/25
    border-0
  `,
    outline: `
    bg-transparent border border-white/20 
    hover:border-white/40 hover:bg-white/5
    text-white
  `,
    gradient: `
    bg-gradient-to-r from-orange-500 to-amber-500 
    hover:from-orange-400 hover:to-amber-400 
    text-white shadow-lg shadow-orange-500/25
    border-0
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2',
    xl: 'px-6 py-3 text-lg gap-2.5',
};

// ============================================================================
// BUTTON COMPONENT
// ============================================================================

export function Button({
    variant = 'primary',
    size = 'md',
    loading = false,
    leftIcon,
    rightIcon,
    fullWidth = false,
    gradient,
    children,
    disabled,
    className = '',
    ...props
}: ButtonProps) {
    const baseStyles = `
    inline-flex items-center justify-center
    font-medium rounded-xl
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-purple-500/50
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

    const variantClass = gradient
        ? `bg-gradient-to-r ${gradient} text-white shadow-lg border-0 hover:opacity-90`
        : variantStyles[variant];

    const sizeClass = sizeStyles[size];
    const widthClass = fullWidth ? 'w-full' : '';

    return (
        <button
            disabled={disabled || loading}
            className={`${baseStyles} ${variantClass} ${sizeClass} ${widthClass} ${className}`.trim().replace(/\s+/g, ' ')}
            {...props}
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : leftIcon ? (
                <span className="inline-flex">{leftIcon}</span>
            ) : null}

            {children}

            {rightIcon && !loading && (
                <span className="inline-flex">{rightIcon}</span>
            )}
        </button>
    );
}

// ============================================================================
// BUTTON GROUP
// ============================================================================

interface ButtonGroupProps {
    children: React.ReactNode;
    className?: string;
}

export function ButtonGroup({ children, className = '' }: ButtonGroupProps) {
    return (
        <div className={`inline-flex rounded-xl overflow-hidden ${className}`}>
            {React.Children.map(children, (child) => {
                if (React.isValidElement(child)) {
                    return React.cloneElement(child as React.ReactElement<any>, {
                        className: `${child.props.className || ''} rounded-none first:rounded-l-xl last:rounded-r-xl border-r-0 last:border-r`,
                    });
                }
                return child;
            })}
        </div>
    );
}

// ============================================================================
// ICON BUTTON
// ============================================================================

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    icon: React.ReactNode;
    variant?: ButtonVariant;
    size?: ButtonSize;
    loading?: boolean;
}

export function IconButton({
    icon,
    variant = 'ghost',
    size = 'md',
    loading = false,
    disabled,
    className = '',
    ...props
}: IconButtonProps) {
    const baseStyles = `
    inline-flex items-center justify-center
    rounded-xl transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-purple-500/50
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

    const variantClass = variantStyles[variant];

    const sizeClasses: Record<ButtonSize, string> = {
        sm: 'p-1.5',
        md: 'p-2',
        lg: 'p-2.5',
        xl: 'p-3',
    };

    return (
        <button
            disabled={disabled || loading}
            className={`${baseStyles} ${variantClass} ${sizeClasses[size]} ${className}`.trim().replace(/\s+/g, ' ')}
            {...props}
        >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
        </button>
    );
}
