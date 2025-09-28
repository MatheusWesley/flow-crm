import { X } from 'lucide-react';
import { useEffect, useId, useRef } from 'react';
import type { ModalProps } from '../../../types';

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
	const modalRef = useRef<HTMLDivElement>(null);
	const previousFocusRef = useRef<HTMLElement | null>(null);
	const modalTitleId = useId();

	useEffect(() => {
		if (isOpen) {
			// Store the currently focused element
			previousFocusRef.current = document.activeElement as HTMLElement;

			// Focus the modal
			modalRef.current?.focus();

			// Prevent body scroll
			document.body.style.overflow = 'hidden';
		} else {
			// Restore body scroll
			document.body.style.overflow = 'unset';

			// Restore focus to the previously focused element
			if (previousFocusRef.current) {
				previousFocusRef.current.focus();
			}
		}

		return () => {
			document.body.style.overflow = 'unset';
		};
	}, [isOpen]);

	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && isOpen) {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener('keydown', handleEscape);
		}

		return () => {
			document.removeEventListener('keydown', handleEscape);
		};
	}, [isOpen, onClose]);

	const handleBackdropClick = () => {
		onClose();
	};

	const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if (event.key === 'Tab') {
			// Get all focusable elements within the modal
			const focusableElements = modalRef.current?.querySelectorAll(
				'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
			);

			if (focusableElements && focusableElements.length > 0) {
				const firstElement = focusableElements[0] as HTMLElement;
				const lastElement = focusableElements[
					focusableElements.length - 1
				] as HTMLElement;

				if (event.shiftKey) {
					// Shift + Tab
					if (document.activeElement === firstElement) {
						event.preventDefault();
						lastElement.focus();
					}
				} else {
					// Tab
					if (document.activeElement === lastElement) {
						event.preventDefault();
						firstElement.focus();
					}
				}
			}
		}
	};

	if (!isOpen) {
		return null;
	}

	return (
		<div
			className="fixed inset-0 z-50 overflow-y-auto"
			aria-labelledby={modalTitleId}
			role="dialog"
			aria-modal="true"
		>
			<div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
				{/* Background overlay */}
				<div
					className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity duration-300 ease-out cursor-pointer"
					aria-hidden="true"
					onClick={handleBackdropClick}
				/>

				{/* This element is to trick the browser into centering the modal contents. */}
				<span
					className="hidden sm:inline-block sm:align-middle sm:h-screen"
					aria-hidden="true"
				>
					&#8203;
				</span>

				{/* Modal panel */}
				<div
					ref={modalRef}
					className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all duration-300 ease-out sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 animate-in fade-in-0 zoom-in-95"
					onKeyDown={handleKeyDown}
					tabIndex={-1}
					role="dialog"
				>
					<div className="sm:flex sm:items-start">
						<div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
							{/* Header */}
							<div className="flex items-center justify-between mb-4">
								<h3
									className="text-lg leading-6 font-medium text-gray-900"
									id={modalTitleId}
								>
									{title}
								</h3>
								<button
									type="button"
									className="rounded-md bg-white text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
									onClick={onClose}
									aria-label="Close modal"
								>
									<X className="h-6 w-6" />
								</button>
							</div>

							{/* Content */}
							<div className="mt-2">{children}</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Modal;
