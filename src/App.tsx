import Dashboard from './components/features/dashboard';
import Layout from './components/layout/Layout';
import { mockUser } from './data/mockUser';

function App() {
	const handleSearch = (query: string) => {
		console.log('Search query:', query);
		// TODO: Implement search functionality
	};

	return (
		<Layout title="Dashboard" user={mockUser} onSearch={handleSearch}>
			<Dashboard />
		</Layout>
	);
}

export default App;
