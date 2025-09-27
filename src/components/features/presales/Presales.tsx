import type React from 'react';
import PreSalesForm from './PreSalesForm';

const Presales: React.FC = () => {
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold text-gray-900">Pré-vendas</h1>
			</div>

			<div className="bg-white rounded-lg shadow">
				<PreSalesForm
					selectedProduct={null}
					onAddItem={() => {}}
					existingItems={[]}
				/>
			</div>
		</div>
	);
};

export default Presales;
