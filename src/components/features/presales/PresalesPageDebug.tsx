import { Eye, Plus, Search } from 'lucide-react';
import type React from 'react';
import { useState } from 'react';
import type { Customer, PreSale, Product } from '../../../types';
import Button from '../../common/Button';
import SimpleModal from '../../common/SimpleModal';

const PresalesPageDebug: React.FC = () => {
	const [searchTerm, setSearchTerm] = useState('');
	const [showModal, setShowModal] = useState(false);

	// Mock data for customers
	const [customers] = useState<Customer[]>([
		{
			id: '1',
			name: 'João Silva',
			email: 'joao@email.com',
			phone: '(11) 99999-9999',
			cpf: '123.456.789-01',
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	]);

	// Mock data for products
	const [products] = useState<Product[]>([
		{
			id: '1',
			code: 'PRD001',
			name: 'Produto Exemplo 1',
			description: 'Descrição do produto exemplo 1',
			unit: 'pc',
			stock: 100,
			category: 'Categoria A',
			saleType: 'unit',
			purchasePrice: 20.0,
			salePrice: 29.99,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	]);

	// Mock data for pre-sales
	const [preSales] = useState<PreSale[]>([
		{
			id: '1',
			customer: customers[0],
			items: [
				{
					id: '1',
					product: products[0],
					quantity: 2,
					unitPrice: 29.99,
					totalPrice: 59.98,
				},
			],
			total: 59.98,
			status: 'pending',
			notes: 'Entrega urgente solicitada',
			validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
			salesperson: 'Vendedor A',
			createdAt: new Date('2024-01-15'),
			updatedAt: new Date('2024-01-15'),
		},
	]);

	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold text-gray-900 mb-6">Pré-vendas</h1>

			{/* Teste básico de estado */}
			<div className="mb-4">
				<input
					type="text"
					placeholder="Teste de input..."
					value={searchTerm}
					onChange={(e) => setSearchTerm(e.target.value)}
					className="px-3 py-2 border border-gray-300 rounded-lg"
				/>
				<p className="text-sm text-gray-600 mt-2">Você digitou: {searchTerm}</p>
			</div>

			{/* Teste de componentes */}
			<div className="mb-4">
				<Button variant="primary" className="flex items-center space-x-2">
					<Plus className="h-4 w-4" />
					<span>Teste Button</span>
				</Button>
			</div>

			{/* Dados carregados */}
			<div className="bg-white rounded-lg shadow p-6 mb-4">
				<div className="flex items-center space-x-2 mb-3">
					<Search className="h-5 w-5 text-blue-500" />
					<p className="text-gray-600">Mock data carregado com sucesso!</p>
				</div>
				<div className="text-sm text-gray-500">
					<p>Clientes: {customers.length}</p>
					<p>Produtos: {products.length}</p>
					<p>Pré-vendas: {preSales.length}</p>
				</div>
			</div>

			{/* Lista simples de pré-vendas */}
			<div className="bg-white rounded-lg shadow p-6">
				<h2 className="text-lg font-semibold mb-4">Pré-vendas</h2>
				{preSales.map((preSale) => (
					<div
						key={preSale.id}
						className="border-b border-gray-200 py-3 last:border-b-0"
					>
						<div className="flex justify-between items-start">
							<div>
								<h3 className="font-medium">#{preSale.id}</h3>
								<p className="text-sm text-gray-600">{preSale.customer.name}</p>
								<p className="text-xs text-gray-500">
									{preSale.customer.email}
								</p>
							</div>
							<div className="text-right">
								<p className="font-bold text-green-600">
									R$ {preSale.total.toFixed(2)}
								</p>
								<p className="text-sm text-gray-500">{preSale.status}</p>
								<button
									onClick={() => setShowModal(true)}
									className="mt-2 p-1 text-blue-600 hover:text-blue-800 rounded"
								>
									<Eye className="h-4 w-4" />
								</button>
							</div>
						</div>
					</div>
				))}
			</div>

			{/* Modal de teste */}
			{showModal && (
				<SimpleModal
					isOpen={showModal}
					onClose={() => setShowModal(false)}
					title="Teste de Modal"
				>
					<div className="p-4">
						<p className="text-gray-600">
							Se você está vendo isso, o Modal está funcionando!
						</p>
						<div className="mt-4 flex justify-end">
							<Button variant="secondary" onClick={() => setShowModal(false)}>
								Fechar
							</Button>
						</div>
					</div>
				</SimpleModal>
			)}
		</div>
	);
};

export default PresalesPageDebug;
