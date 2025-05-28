import React from 'react';
import { TrendingUp } from 'lucide-react';

const StatsCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = 'blue', 
  trend = null, 
  prefix = '', 
  suffix = '',
  loading = false
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          
          {loading ? (
            <div className="mt-2">
              <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
              {subtitle && <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>}
            </div>
          ) : (
            <>
              <p className={`text-3xl font-bold text-${color}-600 mt-2`}>
                {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
              </p>
              {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
              {trend && (
                <div className={`flex items-center mt-2 text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {trend > 0 ? '+' : ''}{trend}% vs ayer
                </div>
              )}
            </>
          )}
        </div>
        
        <div className={`p-3 bg-${color}-50 rounded-lg`}>
          {loading ? (
            <div className="w-6 h-6 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <Icon className={`w-6 h-6 text-${color}-600`} />
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;