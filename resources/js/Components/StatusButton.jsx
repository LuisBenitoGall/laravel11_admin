import React, { useState, forwardRef } from 'react';
import { router } from '@inertiajs/react';

const StatusButton = forwardRef(({ status, id, updateRoute, reloadUrl, reloadResource, routeParams = {} }, ref) => {
	// Estado local para el status, uso universal
	const [currentStatus, setCurrentStatus] = useState(Number(status));
	const [loading, setLoading] = useState(false);

	const handleClick = async () => {
		setLoading(true);
		try {
			const newStatus = currentStatus === 1 ? 0 : 1;
			
			// Get CSRF token from meta tag or page props
			let csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
			
			// Fallback: try to get from Inertia page props
			if (!csrfToken) {
				const pageProps = window?.page?.props;
				csrfToken = pageProps?.csrf_token || pageProps?._token;
			}
			
			const response = await fetch(route(updateRoute, routeParams), {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Accept': 'application/json',
					'X-CSRF-TOKEN': csrfToken,
					'X-Requested-With': 'XMLHttpRequest',
				},
				body: JSON.stringify({ id, status: newStatus }),
			});
			
			if (response.ok) {
				const data = await response.json();
				setCurrentStatus(newStatus);
				// Reload the page if reloadUrl is provided
				if (reloadUrl) {
					router.reload({ only: [reloadResource] });
				}
			} else {
				console.error('StatusButton error:', response.status, response.statusText);
			}
		} catch (e) {
			console.error('StatusButton error:', e);
		} finally {
			setLoading(false);
		}
	};

		 return (
					 <button
						 ref={ref}
						 className={`btn btn-sm ${currentStatus === 1 ? 'btn-success' : 'btn-light'}`}
						 onClick={handleClick}
						 disabled={loading}
					 >
						 <span
							 style={{ width: '1.2em', height: '1.2em', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
						 >
							 {loading ? (
								 <span
									 className="spinner-border"
									   style={{ width: '.9em', height: '.9em', minWidth: '.9em', minHeight: '.9em', verticalAlign: 'middle', marginTop: '2px' }}
									 role="status"
									 aria-hidden="true"
								 ></span>
							 ) : (
								 <i className={`la ${currentStatus === 1 ? 'la-check' : 'la-ban'}`}></i>
							 )}
						 </span>
					 </button>
		 );
});

export default StatusButton;
