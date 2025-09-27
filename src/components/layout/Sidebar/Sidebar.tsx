import {
	BarChart3,
	ChevronDown,
	ChevronLeft,
	FileText,
	Home,
	LogOut,
	Package,
	Settings,
	ShoppingCart,
	Users,
} from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { MenuItem } from '../../../types';

interface SidebarProps {
	isCollapsed: boolean;
	onToggleCollapse: () => void;
	className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({
	isCollapsed,
	onToggleCollapse,
	className = '',
}) => {
	const navigate = useNavigate();
	const location = useLocation();
	const [expandedItems, setExpandedItems] = useState<string[]>([]);
	const [hoveredItem, setHoveredItem] = useState<string | null>(null);
	const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

	const handleMouseEnter = (itemId: string) => {
		if (isCollapsed) {
			if (hoverTimeout) {
				clearTimeout(hoverTimeout);
				setHoverTimeout(null);
			}
			setHoveredItem(itemId);
		}
	};

	const handleMouseLeave = () => {
		if (isCollapsed) {
			const timeout = setTimeout(() => {
				setHoveredItem(null);
			}, 150);
			setHoverTimeout(timeout);
		}
	};

	// Get active item based on current route
	const getActiveItem = () => {
		const path = location.pathname;
		if (path === '/dashboard') return 'dashboard';
		if (path === '/presales') return 'presales';
		if (path.startsWith('/products')) return 'products';
		if (path.startsWith('/customers')) return 'customers';
		if (path === '/inventory') return 'inventory';
		if (path.startsWith('/reports')) return 'reports';
		if (path === '/settings') return 'settings';
		return 'dashboard';
	};

	const activeItem = getActiveItem();

	// Menu items configuration
	const menuItems: MenuItem[] = [
		{
			id: 'dashboard',
			label: 'Dashboard',
			icon: 'Home',
			path: '/dashboard',
		},
		{
			id: 'presales',
			label: 'Pré-vendas',
			icon: 'ShoppingCart',
			path: '/presales',
		},
		{
			id: 'products',
			label: 'Produtos',
			icon: 'Package',
			children: [
				{
					id: 'products-list',
					label: 'Lista de Produtos',
					path: '/products',
				},
				{
					id: 'products-add',
					label: 'Cadastrar Produto',
					path: '/products/add',
				},
			],
		},
		{
			id: 'customers',
			label: 'Clientes',
			icon: 'Users',
			children: [
				{
					id: 'customers-list',
					label: 'Lista de Clientes',
					path: '/customers',
				},
				{
					id: 'customers-add',
					label: 'Cadastrar Cliente',
					path: '/customers/add',
				},
			],
		},
		{
			id: 'inventory',
			label: 'Estoque',
			icon: 'BarChart3',
			path: '/inventory',
		},
		{
			id: 'reports',
			label: 'Relatórios',
			icon: 'FileText',
			children: [
				{
					id: 'reports-sales',
					label: 'Relatório de Vendas',
					path: '/reports/sales',
				},
				{
					id: 'reports-inventory',
					label: 'Relatório de Estoque',
					path: '/reports/inventory',
				},
			],
		},
	];

	// Bottom menu items
	const bottomMenuItems: MenuItem[] = [
		{
			id: 'settings',
			label: 'Configurações',
			icon: 'Settings',
			path: '/settings',
		},
		{
			id: 'logout',
			label: 'Sair',
			icon: 'LogOut',
			path: '/logout',
		},
	];

	// Icon mapping
	const iconMap = {
		Home,
		ShoppingCart,
		Users,
		Package,
		BarChart3,
		FileText,
		Settings,
		LogOut,
	};

	const toggleExpanded = (itemId: string) => {
		setExpandedItems((prev) =>
			prev.includes(itemId)
				? prev.filter((id) => id !== itemId)
				: [...prev, itemId],
		);
	};

	const isExpanded = (itemId: string) => expandedItems.includes(itemId);

	const renderIcon = (iconName?: string) => {
		if (!iconName) return null;
		const IconComponent = iconMap[iconName as keyof typeof iconMap];
		return IconComponent ? <IconComponent size={20} /> : null;
	};

	const handleItemClick = (item: MenuItem) => {
		if (item.children && item.children.length > 0 && !isCollapsed) {
			toggleExpanded(item.id);
		} else if (item.path && (!item.children || item.children.length === 0)) {
			if (item.id === 'logout') {
				// Handle logout logic here
				console.log('Logout clicked');
				// For now, just navigate to dashboard
				navigate('/dashboard');
			} else {
				navigate(item.path);
			}
		}
		// When collapsed and has children, do nothing - let hover handle it
	};

	const handleChildClick = (child: MenuItem, e?: React.MouseEvent) => {
		if (e) {
			e.stopPropagation();
		}
		if (child.path) {
			navigate(child.path);
		}
	};

	const renderMenuItem = (item: MenuItem, level = 0) => {
		const hasChildren = item.children && item.children.length > 0;
		const isItemExpanded = isExpanded(item.id);
		const isHovered = hoveredItem === item.id;
		const isActive = activeItem === item.id;

		return (
			<div key={item.id} className="relative">
				<div
					className="relative"
					onMouseEnter={() => handleMouseEnter(item.id)}
					onMouseLeave={handleMouseLeave}
				>
					{/* Main menu item */}
					<div
						data-menu-id={item.id}
						className={`
                            group flex items-center px-4 py-3 mx-2 rounded-xl cursor-pointer 
                            transition-all duration-300 ease-in-out transform hover:scale-105
                            ${level === 0 ? 'mb-1' : 'ml-4 mb-0.5'}
                            ${
															isActive && !hasChildren
																? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25'
																: hasChildren && isItemExpanded
																	? 'bg-slate-800/50 text-blue-400'
																	: 'text-slate-300 hover:bg-slate-800/50 hover:text-white'
														}
                            ${isCollapsed && level === 0 ? 'justify-center px-3' : ''}
                            ${level > 0 ? 'text-sm' : ''}
                        `}
						role="button"
						tabIndex={0}
						aria-label={isCollapsed && level === 0 ? item.label : undefined}
						onClick={() => handleItemClick(item)}
						onKeyDown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								handleItemClick(item);
							}
						}}
					>
						{/* Icon */}
						{level === 0 && (
							<div
								className={`
                            flex-shrink-0 transition-all duration-300
                            ${isActive && !hasChildren ? 'text-white' : 'text-slate-400 group-hover:text-white'}
                        `}
							>
								{renderIcon(item.icon)}
							</div>
						)}

						{/* Bullet point for submenu items */}
						{level > 0 && (
							<div
								className={`
                            w-2 h-2 rounded-full mr-3 transition-all duration-300
                            ${isActive ? 'bg-blue-400' : 'bg-slate-500 group-hover:bg-slate-300'}
                        `}
							/>
						)}

						{/* Label */}
						{!isCollapsed && (
							<>
								<span
									className={`
                                flex-1 font-medium transition-all duration-300
                                ${level === 0 ? 'ml-3' : ''}
                                ${isActive && !hasChildren ? 'text-white' : ''}
                            `}
								>
									{item.label}
								</span>

								{/* Expand/Collapse icon for items with children */}
								{hasChildren && (
									<div
										className={`
                                    flex-shrink-0 ml-2 transition-all duration-300
                                    ${isItemExpanded ? 'rotate-180' : 'rotate-0'}
                                `}
									>
										<ChevronDown
											size={16}
											className={`
                                        transition-colors duration-300
                                        ${isItemExpanded ? 'text-blue-400' : 'text-slate-400 group-hover:text-white'}
                                    `}
										/>
									</div>
								)}
							</>
						)}

						{/* Active indicator */}
						{isActive && !hasChildren && !isCollapsed && (
							<div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-l-full" />
						)}
					</div>

					{/* Tooltip for collapsed state */}
					{isCollapsed && level === 0 && isHovered && (
						<div
							className="absolute left-full top-0 ml-2 z-[9999] pointer-events-auto"
							onMouseEnter={() => {
								if (hoverTimeout) {
									clearTimeout(hoverTimeout);
									setHoverTimeout(null);
								}
							}}
							onMouseLeave={handleMouseLeave}
						>
							<div className="bg-gray-800 border border-gray-600 text-white rounded-lg shadow-lg py-2 min-w-48">
								<div className="px-3 py-2 text-sm font-medium text-white border-b border-gray-600">
									{item.label}
								</div>
								{hasChildren && item.children
									? item.children.map((child) => (
											<button
												key={child.id}
												onClick={(e) => handleChildClick(child, e)}
												className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
											>
												{child.label}
											</button>
										))
									: item.path && (
											<button
												onClick={(e) => handleChildClick(item, e)}
												className="w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
											>
												Acessar {item.label}
											</button>
										)}
							</div>
						</div>
					)}
				</div>

				{/* Submenu items with smooth animation */}
				{!isCollapsed && hasChildren && (
					<div
						className={`
                        overflow-hidden transition-all duration-300 ease-in-out
                        ${isItemExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                    `}
					>
						<div className="ml-2 mt-1 space-y-1">
							{item.children?.map((child) => renderMenuItem(child, level + 1))}
						</div>
					</div>
				)}
			</div>
		);
	};

	return (
		<div
			className={`
                bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800 
                border-r border-slate-700/50 backdrop-blur-xl
                transition-all duration-300 ease-in-out
                ${isCollapsed ? 'w-16' : 'w-64'}
                ${className}
                relative ${isCollapsed ? 'overflow-visible' : 'overflow-hidden'}
            `}
		>
			{/* Background decoration */}
			<div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />
			<div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

			{/* Header */}
			<div className="relative flex items-center justify-center p-4 border-b border-slate-700/50">
				{isCollapsed ? (
					// Estado collapsed - apenas o ícone do carrinho
					<button
						onClick={onToggleCollapse}
						onKeyDown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								e.preventDefault();
								onToggleCollapse();
							}
						}}
						className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
						aria-label="Expand sidebar"
					>
						<ShoppingCart size={18} className="text-white" />
					</button>
				) : (
					// Estado expandido - logo + título + botão de colapso
					<div className="flex items-center justify-between w-full">
						<div className="flex items-center space-x-2">
							<div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
								<ShoppingCart size={18} className="text-white" />
							</div>
							<h1 className="text-lg font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
								Minhas Vendas
							</h1>
						</div>
						<button
							onClick={onToggleCollapse}
							onKeyDown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									onToggleCollapse();
								}
							}}
							className="p-2 rounded-xl transition-all duration-300 hover:bg-slate-800/50 text-slate-400 hover:text-white hover:scale-110 active:scale-95"
							aria-label="Collapse sidebar"
						>
							<ChevronLeft
								size={20}
								className="text-slate-400 hover:text-white transition-colors"
							/>
						</button>
					</div>
				)}
			</div>

			{/* Navigation */}
			<div
				className={`relative flex flex-col h-full ${isCollapsed ? 'overflow-visible' : ''}`}
			>
				<nav
					className={`flex-1 py-4 space-y-1 ${isCollapsed ? 'overflow-visible' : ''}`}
				>
					{menuItems.map((item) => renderMenuItem(item))}
				</nav>

				{/* Bottom menu */}
				<div className="border-t border-slate-700/50 py-4 space-y-1">
					{bottomMenuItems.map((item) => renderMenuItem(item))}
				</div>

				{/* User section for expanded state */}
				{!isCollapsed && (
					<div className="border-t border-slate-700/50 p-4">
						<div className="flex items-center space-x-3 mb-3">
							<div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
								<Users size={16} className="text-slate-300" />
							</div>
							<span className="text-sm text-slate-300">Bem vindo, Usuário</span>
						</div>
					</div>
				)}

				{/* User section for collapsed state */}
				{isCollapsed && (
					<div className="border-t border-slate-700/50 p-4">
						<div
							className="relative"
							onMouseEnter={() => handleMouseEnter('user')}
							onMouseLeave={handleMouseLeave}
						>
							<div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center mx-auto cursor-pointer hover:bg-slate-500 transition-colors">
								<Users size={16} className="text-slate-300" />
							</div>

							{hoveredItem === 'user' && (
								<div
									className="absolute left-full bottom-0 ml-3 z-[9999]"
									onMouseEnter={() => {
										if (hoverTimeout) {
											clearTimeout(hoverTimeout);
											setHoverTimeout(null);
										}
									}}
									onMouseLeave={handleMouseLeave}
								>
									<div className="bg-slate-800 border border-slate-700 text-white rounded-lg shadow-xl min-w-48">
										<div className="px-3 py-2 text-sm border-b border-slate-600">
											Bem vindo, Usuário
										</div>
										<div className="py-2">
											<button
												onClick={() => navigate('/settings')}
												className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-2"
											>
												<Settings size={16} />
												Configurações
											</button>
											<button
												onClick={() => {
													console.log('Logout clicked');
													navigate('/dashboard');
												}}
												className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-2"
											>
												<LogOut size={16} />
												Sair
											</button>
										</div>
										{/* Tooltip arrow */}
										<div className="absolute left-0 bottom-4 transform -translate-x-1 w-2 h-2 bg-slate-800 border-l border-b border-slate-700 rotate-45" />
									</div>
								</div>
							)}
						</div>
					</div>
				)}
			</div>

			{/* Bottom decoration */}
			<div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
		</div>
	);
};

export default Sidebar;
