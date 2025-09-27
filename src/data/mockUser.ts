import avatarPNG from '../assets/avatar.jpg';
import type { User } from '../types';

// Mock user data - this will be replaced with real authentication later
export const mockUser: User = {
	id: '1',
	name: 'John Doe',
	email: 'john.doe@empresa.com',
	avatar: avatarPNG,
	role: 'admin',
};

// Mock search handler - this will be replaced with real search functionality
export const handleSearch = (query: string) => {
	console.log('Search query:', query);
	// TODO: Implement search functionality
};
