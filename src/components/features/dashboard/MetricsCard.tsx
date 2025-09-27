import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import type React from 'react';

interface MetricsCardProps {
	title: string;
	value: string | number;
	icon: React.ReactNode;
	trend?: {
		value: number;
		isPositive: boolean;
		period?: string;
	};
	color: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
	loading?: boolean;
	error?: string;
	subtitle?: string;
}

const MetricsCard: React.FC<MetricsCardProps> = ({
	title,
	value,
	icon,
	trend,
	color,
	loading = false,
	error,
	subtitle,
}) => {
	const colorClasses = {
		blue: 'bg-blue-50 text-blue-600 border-blue-200',
		green: 'bg-green-50 text-green-600 border-green-200',
		yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
		red: 'bg-red-50 text-red-600 border-red-200',
		purple: 'bg-purple-50 text-purple-600 border-purple-200',
	};

	const trendColorClasses = {
		positive: 'text-green-600',
		negative: 'text-red-600',
		neutral: 'text-gray-500',
	};

	const getTrendIcon = () => {
		if (!trend) return null;

		if (trend.value === 0) {
			return <Minus className="w-4 h-4 mr-1" />;
		}

		return trend.isPositive ? (
			<TrendingUp className="w-4 h-4 mr-1" />
		) : (
			<TrendingDown className="w-4 h-4 mr-1" />
		);
	};

	const getTrendColorClass = () => {
		if (!trend) return trendColorClasses.neutral;

		if (trend.value === 0) return trendColorClasses.neutral;

		return trend.isPositive
			? trendColorClasses.positive
			: trendColorClasses.negative;
	};

	if (loading) {
		return (
			<div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
				<div className="animate-pulse">
					<div className="flex items-center justify-between">
						<div className="flex-1">
							<div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
							<div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
							<div className="h-4 bg-gray-200 rounded w-2/3"></div>
						</div>
						<div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="bg-white rounded-lg border border-red-200 p-6 shadow-sm">
				<div className="flex items-center justify-between">
					<div className="flex-1">
						<p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
						<p className="text-sm text-red-600">Erro ao carregar dados</p>
						<p className="text-xs text-gray-500 mt-1">{error}</p>
					</div>
					<div className="p-3 rounded-lg border bg-red-50 text-red-600 border-red-200">
						{icon}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
			<div className="flex items-center justify-between">
				<div className="flex-1">
					<p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
					<p className="text-2xl font-bold text-gray-900">{value}</p>
					{subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
					{trend && (
						<div
							className={`flex items-center mt-2 text-sm ${getTrendColorClass()}`}
						>
							{getTrendIcon()}
							<span>{Math.abs(trend.value)}%</span>
							<span className="text-gray-500 ml-1">
								{trend.period || 'vs mês anterior'}
							</span>
						</div>
					)}
				</div>
				<div className={`p-3 rounded-lg border ${colorClasses[color]}`}>
					{icon}
				</div>
			</div>
		</div>
	);
};

export default MetricsCard;
