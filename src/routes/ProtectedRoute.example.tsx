import ProtectedRoute from './ProtectedRoute';

/**
 * Examples of how to use the ProtectedRoute component with different configurations
 */

// Example 1: Basic authentication check only
const BasicProtectedExample = () => (
	<ProtectedRoute>
		<div>This content requires authentication only</div>
	</ProtectedRoute>
);

// Example 2: Require specific permission
const PermissionProtectedExample = () => (
	<ProtectedRoute requiredPermission="modules.userManagement">
		<div>This content requires user management permission</div>
	</ProtectedRoute>
);

// Example 3: Require specific user type
const UserTypeProtectedExample = () => (
	<ProtectedRoute requiredUserType="admin">
		<div>This content is only for administrators</div>
	</ProtectedRoute>
);

// Example 4: Require both permission and user type
const StrictProtectedExample = () => (
	<ProtectedRoute
		requiredUserType="admin"
		requiredPermission="modules.userManagement"
	>
		<div>
			This content requires admin user type AND user management permission
		</div>
	</ProtectedRoute>
);

// Custom access denied component (defined outside to avoid component definition inside component)
const CustomAccessDenied = () => (
	<div className="p-6 text-center">
		<h2 className="text-xl font-bold text-red-600 mb-4">Acesso Restrito</h2>
		<p className="text-gray-600">
			Esta funcionalidade está disponível apenas para administradores. Entre em
			contato com seu supervisor para mais informações.
		</p>
	</div>
);

// Example 5: Custom fallback component
const CustomFallbackExample = () => (
	<ProtectedRoute requiredUserType="admin" fallback={<CustomAccessDenied />}>
		<div>Admin-only content with custom access denied message</div>
	</ProtectedRoute>
);

// Nested fallback component
const AdvancedReportsAccessDenied = () => (
	<div className="p-4 bg-gray-100 rounded">
		<p className="text-gray-600">
			Relatórios avançados disponíveis apenas para administradores
		</p>
	</div>
);

// Example 6: Nested protection with different requirements
const NestedProtectionExample = () => (
	<ProtectedRoute requiredPermission="modules.reports">
		<div className="p-6">
			<h1>Reports Dashboard</h1>

			{/* Basic reports available to all users with reports permission */}
			<div className="mb-6">
				<h2>Basic Reports</h2>
				<p>Sales summary, inventory status, etc.</p>
			</div>

			{/* Advanced reports only for admins */}
			<ProtectedRoute
				requiredUserType="admin"
				fallback={<AdvancedReportsAccessDenied />}
			>
				<div>
					<h2>Advanced Reports</h2>
					<p>Financial analysis, user activity logs, etc.</p>
				</div>
			</ProtectedRoute>
		</div>
	</ProtectedRoute>
);

// Export examples for documentation purposes
export {
	BasicProtectedExample,
	PermissionProtectedExample,
	UserTypeProtectedExample,
	StrictProtectedExample,
	CustomFallbackExample,
	NestedProtectionExample,
};

/**
 * Usage patterns and best practices:
 *
 * 1. Basic Authentication:
 *    Use ProtectedRoute without additional props for pages that just need authentication
 *
 * 2. Permission-based Access:
 *    Use requiredPermission prop with permission strings like:
 *    - "modules.products" - access to products module
 *    - "modules.customers" - access to customers module
 *    - "modules.userManagement" - access to user management
 *    - "presales.canViewAll" - can view all presales
 *
 * 3. User Type Restrictions:
 *    Use requiredUserType prop with "admin" or "employee"
 *
 * 4. Combined Requirements:
 *    Use both requiredUserType and requiredPermission for strict access control
 *
 * 5. Custom Error Messages:
 *    Provide fallback prop with custom component for better user experience
 *
 * 6. Nested Protection:
 *    Use multiple ProtectedRoute components for granular access control within pages
 */
