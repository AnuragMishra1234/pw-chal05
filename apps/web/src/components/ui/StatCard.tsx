import React from 'react';
import { Card } from './Card';

export interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
  iconBgColor?: string;
  trend?: {
    text: string;
    positive?: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  icon,
  iconBgColor = 'bg-brand-50 text-brand-600 border-brand-200',
  trend
}) => {
  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${iconBgColor}`}>
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{value}</div>
        {subValue && <p className="text-xs text-slate-500 mt-1">{subValue}</p>}
        {trend && (
          <div className="mt-2 text-xs flex items-center gap-1 font-medium">
            <span className={trend.positive ? 'text-emerald-600' : 'text-slate-500'}>
              {trend.text}
            </span>
          </div>
        )}
      </div>
    </Card>
  );
};
