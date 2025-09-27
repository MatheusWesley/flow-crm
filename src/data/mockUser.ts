import type { User } from '../types';

// Mock user data - this will be replaced with real authentication later
export const mockUser: User = {
	id: '1',
	name: 'Matheus Wesley',
	email: 'matheus.wesley@empresa.com',
	avatar: 'https://github.com/MatheusWesley.png',
	role: 'admin',
};

// Mock search handler - this will be replaced with real search functionality
export const handleSearch = (query: string) => {
	console.log('Search query:', query);
	// TODO: Implement search functionality
};
