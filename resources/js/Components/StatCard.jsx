import React from 'react';

export default function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    iconColor = 'text-blue-600',
    iconBg = 'bg-blue-50',
    badge,
    className = '',
}) {
    return (
        <div className={`bg-white rounded-xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition-shadow ${className}`}>
            <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
                {Icon && (
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg} ${iconColor}`}>
                        <Icon className="w-5 h-5" />
                    </div>
                )}
            </div>
            <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl lg:text-3xl font-bold text-slate-800 tracking-tight">{value}</span>
                {badge && (
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {badge}
                    </span>
                )}
            </div>
            {subtitle && (
                <p className="mt-1 text-xs text-slate-500 truncate">{subtitle}</p>
            )}
        </div>
    );
}
