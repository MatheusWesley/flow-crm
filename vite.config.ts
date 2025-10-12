import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	server: {
		proxy: {
			'/api': {
				target: 'http://localhost:3000',
				changeOrigin: true,
				secure: false,
				configure: (proxy, _options) => {
					proxy.on('error', (err, _req, _res) => {
						console.log('proxy error', err);
					});
					proxy.on('proxyReq', (_proxyReq, req, _res) => {
						console.log('Sending Request to the Target:', req.method, req.url);
					});
					proxy.on('proxyRes', (proxyRes, req, _res) => {
						console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
					});
				},
			}
		}
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks: (id) => {
					// Vendor chunks
					if (id.includes('node_modules')) {
						if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
							return 'react-vendor';
						}
						if (id.includes('lucide-react')) {
							return 'ui-vendor';
						}
						if (id.includes('react-toastify')) {
							return 'toast-vendor';
						}
						return 'vendor';
					}

					// App chunks based on features
					if (id.includes('/features/dashboard/')) {
						return 'dashboard';
					}
					if (id.includes('/features/auth/') || id.includes('AuthContext')) {
						return 'auth';
					}
					if (id.includes('/features/products/')) {
						return 'products';
					}
					if (id.includes('/features/customers/')) {
						return 'customers';
					}
					if (id.includes('/features/presales/')) {
						return 'presales';
					}
					if (id.includes('/features/users/')) {
						return 'users';
					}
					if (id.includes('/features/inventory/')) {
						return 'inventory';
					}
					if (id.includes('/features/paymentMethods/')) {
						return 'payment-methods';
					}
					if (id.includes('/components/shared/') || id.includes('/services/')) {
						return 'shared';
					}
					if (id.includes('/components/layout/')) {
						return 'layout';
					}
				}
			}
		},
		chunkSizeWarningLimit: 500,
		target: 'esnext',
		minify: 'esbuild'
	}
});
