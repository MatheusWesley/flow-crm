import type React from 'react';
import { usePermissions } from './usePermissions';

/**
 * Example component demonstrating how to use the usePermissions hook
 * This file serves as documentation and can be removed in production
 */
export const PermissionsExample: React.FC = () => {
	const {
		isAdmin,
		isEmployee,
		canAccessProducts,
		canAccessUserManagement,
		canCreatePresales,
		canViewAllPresales,
		hasPermission,
		getAccessibleNavigationItems,
	} = usePermissions();

	const navigationItems = getAccessibleNavigationItems();

	return (
		<div className="p-6 max-w-2xl mx-auto">
			<h2 className="text-2xl font-bold mb-6">Permissions Hook Example</h2>

			{/* User Type Display */}
			<div className="mb-6">
				<h3 className="text-lg font-semibold mb-2">User Type</h3>
				<div className="space-y-2">
					<p>
						<span className="font-medium">Is Admin:</span>{' '}
						<span className={isAdmin() ? 'text-green-600' : 'text-red-600'}>
							{isAdmin() ? 'Yes' : 'No'}
						</span>
					</p>
					<p>
						<span className="font-medium">Is Employee:</span>{' '}
						<span className={isEmployee() ? 'text-green-600' : 'text-red-600'}>
							{isEmployee() ? 'Yes' : 'No'}
						</span>
					</p>
				</div>
			</div>

			{/* Module Access */}
			<div className="mb-6">
				<h3 className="text-lg font-semibold mb-2">Module Access</h3>
				<div className="grid grid-cols-2 gap-4">
					<div className="space-y-2">
						<p>
							<span className="font-medium">Products:</span>{' '}
							<span
								className={
									canAccessProducts() ? 'text-green-600' : 'text-red-600'
								}
							>
								{canAccessProducts() ? 'Allowed' : 'Denied'}
							</span>
						</p>
						<p>
							<span className="font-medium">User Management:</span>{' '}
							<span
								className={
									canAccessUserManagement() ? 'text-green-600' : 'text-red-600'
								}
							>
								{canAccessUserManagement() ? 'Allowed' : 'Denied'}
							</span>
						</p>
					</div>
					<div className="space-y-2">
						<p>
							<span className="font-medium">Create Presales:</span>{' '}
							<span
								className={
									canCreatePresales() ? 'text-green-600' : 'text-red-600'
								}
							>
								{canCreatePresales() ? 'Allowed' : 'Denied'}
							</span>
						</p>
						<p>
							<span className="font-medium">View All Presales:</span>{' '}
							<span
								className={
									canViewAllPresales() ? 'text-green-600' : 'text-red-600'
								}
							>
								{canViewAllPresales() ? 'Allowed' : 'Denied'}
							</span>
						</p>
					</div>
				</div>
			</div>

			{/* Specific Permission Checks */}
			<div className="mb-6">
				<h3 className="text-lg font-semibold mb-2">
					Specific Permission Checks
				</h3>
				<div className="space-y-2">
					<p>
						<span className="font-medium">modules.reports:</span>{' '}
						<span
							className={
								hasPermission('modules.reports')
									? 'text-green-600'
									: 'text-red-600'
							}
						>
							{hasPermission('modules.reports') ? 'Allowed' : 'Denied'}
						</span>
					</p>
					<p>
						<span className="font-medium">presales.canViewAll:</span>{' '}
						<span
							className={
								hasPermission('presales.canViewAll')
									? 'text-green-600'
									: 'text-red-600'
							}
						>
							{hasPermission('presales.canViewAll') ? 'Allowed' : 'Denied'}
						</span>
					</p>
				</div>
			</div>

			{/* Navigation Items */}
			<div className="mb-6">
				<h3 className="text-lg font-semibold mb-2">
					Accessible Navigation Items
				</h3>
				<div className="flex flex-wrap gap-2">
					{navigationItems.map((item) => (
						<span
							key={item}
							className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
						>
							{item}
						</span>
					))}
				</div>
			</div>

			{/* Conditional Rendering Examples */}
			<div className="mb-6">
				<h3 className="text-lg font-semibold mb-2">
					Conditional Rendering Examples
				</h3>
				<div className="space-y-4">
					{/* Admin-only content */}
					{isAdmin() && (
						<div className="p-4 bg-red-50 border border-red-200 rounded">
							<p className="text-red-800 font-medium">Admin Only Content</p>
							<p className="text-red-600">
								This content is only visible to administrators.
							</p>
						</div>
					)}

					{/* Employee content */}
					{isEmployee() && (
						<div className="p-4 bg-blue-50 border border-blue-200 rounded">
							<p className="text-blue-800 font-medium">Employee Content</p>
							<p className="text-blue-600">
								This content is visible to employees.
							</p>
						</div>
					)}

					{/* Permission-based content */}
					{canAccessUserManagement() && (
						<div className="p-4 bg-green-50 border border-green-200 rounded">
							<p className="text-green-800 font-medium">
								User Management Access
							</p>
							<p className="text-green-600">
								You can access user management features.
							</p>
						</div>
					)}

					{/* Button with permission check */}
					<div className="space-x-4">
						<button
							type="button"
							className={`px-4 py-2 rounded ${
								canCreatePresales()
									? 'bg-blue-600 text-white hover:bg-blue-700'
									: 'bg-gray-300 text-gray-500 cursor-not-allowed'
							}`}
							disabled={!canCreatePresales()}
						>
							Create Presale
						</button>

						<button
							type="button"
							className={`px-4 py-2 rounded ${
								canAccessUserManagement()
									? 'bg-green-600 text-white hover:bg-green-700'
									: 'bg-gray-300 text-gray-500 cursor-not-allowed'
							}`}
							disabled={!canAccessUserManagement()}
						>
							Manage Users
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default PermissionsExample;
