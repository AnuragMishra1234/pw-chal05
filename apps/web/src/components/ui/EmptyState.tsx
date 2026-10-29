import React from 'react';
import { LucideIcon, Sparkles } from 'lucide-react';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Sparkles,
  title,
  description,
  actionText,
  onAction,
  className = ''
}) => {
  return (
    <div className={`text-center py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 ${className}`}>
      <div className="w-12 h-12 mx-auto rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400">
        <Icon className="w-6 h-6 text-brand-500" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-slate-900">{title}</h3>
      <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">{description}</p>
      {actionText && onAction && (
        <div className="mt-6">
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center px-4 py-2 text-xs font-semibold rounded-xl text-white bg-brand-600 hover:bg-brand-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          >
            {actionText}
          </button>
        </div>
      )}
    </div>
  );
};
