import { ChevronDown, LogOut, Search, X } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useSearchShortcut } from '../../../hooks/useKeyboardShortcut';
import type { User as UserType } from '../../../types';
import SearchModal from '../../common/SearchModal';

interface HeaderProps {
	title: string;
	user?: UserType;
	onSearch?: (query: string) => void;
	className?: string;
}

const Header: React.FC<HeaderProps> = ({
	title,
	user,
	onSearch,
	className = '',
}) => {
	const navigate = useNavigate();
	const { logout } = useAuth();
	const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

	// CSS para animação do dropdown
	React.useEffect(() => {
		const style = document.createElement('style');
		style.textContent = `
			@keyframes dropdownSlide {
				from {
					opacity: 0;
					transform: translateY(-8px) scale(0.95);
				}
				to {
					opacity: 1;
					transform: translateY(0) scale(1);
				}
			}
		`;
		document.head.appendChild(style);
		return () => {
			document.head.removeChild(style);
		};
	}, []);

	// Atalho de teclado para abrir a pesquisa (Ctrl+K / Cmd+K)
	useSearchShortcut(() => setIsSearchModalOpen(true));

	const handleSearchClick = () => {
		setIsSearchModalOpen(true);
	};

	const handleSearchModalClose = () => {
		setIsSearchModalOpen(false);
	};

	// Handle logout
	const handleLogout = () => {
		setIsUserMenuOpen(false);
		logout();
		navigate('/login');
	};

	// Função para gerar iniciais do usuário
	const getUserInitials = (name: string | undefined): string => {
		if (!name) return 'U';
		return name
			.split(' ')
			.map((word) => word.charAt(0).toUpperCase())
			.slice(0, 2)
			.join('');
	};

	return (
		<>
			<header
				className={`
				bg-gradient-to-r from-slate-900 via-slate-900 to-slate-800 
				border-b border-slate-700/50 backdrop-blur-xl px-4 py-3
				relative
				${className}
			`}
			>
				{/* Background decoration */}
				<div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />
				<div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

				<div className="relative flex items-center justify-between">
					{/* Left section - Title */}
					<div className="flex items-center">
						<h1 className="text-lg font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
							{title}
						</h1>
					</div>

					{/* Right section - Search, Notifications and User */}
					<div className="flex items-center space-x-3">
						{/* Search button */}
						<button
							type="button"
							onClick={handleSearchClick}
							className="
								flex items-center space-x-2 px-3 py-2 text-slate-300 
								hover:text-white hover:bg-slate-800/50 rounded-xl 
								transition-all duration-300 border border-slate-700/50
								hover:border-slate-600 hover:scale-105
							"
							aria-label="Search (Ctrl+K)"
							title="Pesquisar (Ctrl+K)"
						>
							<Search className="h-4 w-4" />
							<span className="hidden sm:inline text-sm font-medium">
								Pesquisar
							</span>
							<kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 border border-slate-600 rounded text-xs font-mono bg-slate-800/50 text-slate-300">
								⌘K
							</kbd>
						</button>

						{/* User menu */}
						{user && (
							<div className="relative">
								<button
									type="button"
									onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
									className="flex items-center space-x-2 p-2 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800/50 transition-all duration-300 hover:scale-105"
									aria-label="User menu"
								>
									<div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
										{getUserInitials(user.name)}
									</div>
									<div className="hidden sm:block text-left">
										<div className="text-sm font-medium text-white">
											{user.name || 'Usuário'}
										</div>
									</div>
									<ChevronDown className="h-4 w-4 text-slate-400" />
								</button>

								{/* User dropdown menu - Gmail style */}
								{isUserMenuOpen && (
									<>
										{/* Backdrop */}
										<button
											type="button"
											className="fixed inset-0 z-40"
											onClick={() => setIsUserMenuOpen(false)}
										/>

										{/* Menu */}
										<div
											className="absolute right-0 mt-4 w-72 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden transform transition-all duration-200 ease-out"
											style={{
												animation: 'dropdownSlide 0.2s ease-out forwards',
												transformOrigin: 'top right',
											}}
										>
											{/* Header */}
											<div className="relative bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 px-4 py-4 text-center">
												<button
													type="button"
													onClick={() => setIsUserMenuOpen(false)}
													className="absolute top-3 right-3 p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
												>
													<X className="h-4 w-4 text-slate-600 dark:text-slate-400" />
												</button>

												<div className="flex flex-col items-center space-y-2">
													<div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold border-3 border-white dark:border-slate-700 shadow-md">
														{getUserInitials(user.name)}
													</div>

													<div>
														<h3 className="text-base font-semibold text-slate-900 dark:text-white">
															Olá, {user.name?.split(' ')[0] || 'Usuário'}!
														</h3>
														<p className="text-xs text-slate-600 dark:text-slate-400">
															{user.email}
														</p>
													</div>
												</div>
											</div>

											{/* Account Management Button */}
											<div className="px-4 py-3">
												<button
													type="button"
													className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-slate-900 dark:text-white text-sm font-medium transition-colors border border-slate-200 dark:border-slate-600"
													onClick={() => setIsUserMenuOpen(false)}
												>
													Gerenciar sua Conta
												</button>
											</div>

											{/* Menu Items */}
											<div className="border-t border-slate-200 dark:border-slate-700">
												<button
													type="button"
													className="flex items-center w-full text-left px-4 py-2.5 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm"
													onClick={handleLogout}
													title="Sair do sistema"
												>
													<LogOut className="h-4 w-4 mr-3" />
													Sair
												</button>
											</div>
										</div>
									</>
								)}
							</div>
						)}
					</div>
				</div>
			</header>

			{/* Search Modal */}
			<SearchModal
				isOpen={isSearchModalOpen}
				onClose={handleSearchModalClose}
				onSearch={onSearch}
			/>
		</>
	);
};

export default Header;
