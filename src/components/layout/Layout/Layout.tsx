import type React from 'react';
import { useEffect, useState } from 'react';
import type { User } from '../../../types';
import SessionWarning from '../../common/SessionWarning';
import Header from '../Header';
import Sidebar from '../Sidebar';

interface LayoutProps {
	children: React.ReactNode;
	title?: string;
	user?: User;
	onSearch?: (query: string) => void;
	className?: string;
}

const Layout: React.FC<LayoutProps> = ({
	children,
	title = 'Dashboard',
	user,
	onSearch,
	className = '',
}) => {
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
	const [isMobile, setIsMobile] = useState(false);
	const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

	// Check if screen is mobile size
	useEffect(() => {
		const checkMobile = () => {
			const mobile = window.innerWidth < 768; // md breakpoint
			setIsMobile(mobile);

			// Auto-collapse sidebar on mobile
			if (mobile) {
				setIsSidebarCollapsed(true);
			}
		};

		checkMobile();
		window.addEventListener('resize', checkMobile);

		return () => window.removeEventListener('resize', checkMobile);
	}, []);

	const handleSidebarToggle = () => {
		if (isMobile) {
			setIsMobileSidebarOpen(!isMobileSidebarOpen);
		} else {
			setIsSidebarCollapsed(!isSidebarCollapsed);
		}
	};

	const handleMobileOverlayClick = () => {
		if (isMobile) {
			setIsMobileSidebarOpen(false);
		}
	};

	return (
		<div className={`min-h-screen bg-gray-50 ${className}`}>
			{/* Session Warning */}
			<SessionWarning />

			{/* Mobile overlay */}
			{isMobile && isMobileSidebarOpen && (
				<div
					className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
					onClick={handleMobileOverlayClick}
					aria-hidden="true"
				/>
			)}

			{/* Sidebar */}
			<div
				className={`
          fixed top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out
          ${
						isMobile
							? isMobileSidebarOpen
								? 'translate-x-0'
								: '-translate-x-full'
							: 'translate-x-0'
					}
        `}
			>
				<Sidebar
					isCollapsed={isSidebarCollapsed && !isMobile}
					onToggleCollapse={handleSidebarToggle}
					className="h-full shadow-2xl"
				/>
			</div>

			{/* Main content area */}
			<div
				className={`
          transition-all duration-300 ease-in-out
          ${isMobile ? 'ml-0' : isSidebarCollapsed ? 'ml-16' : 'ml-64'}
        `}
			>
				{/* Header */}
				<Header
					title={title}
					user={user}
					onSearch={onSearch}
					className="sticky top-0 z-20"
				/>

				{/* Page content */}
				<main className="p-6">
					<div className="max-w-7xl mx-auto">{children}</div>
				</main>
			</div>
		</div>
	);
};

export default Layout;
