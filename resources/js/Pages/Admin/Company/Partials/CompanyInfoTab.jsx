import React from 'react';
import CompanyFormEdit from '@/Components/CompanyFormEdit';

export default function CompanyInfoTab({ 
	company, 
	side = false, 
	updateRoute = 'companies.update', 
	updateParams = null, 
	crm_account = false 
}){
	// This partial is only a wrapper to render the edit form component.
	return (
		<CompanyFormEdit
			company={company}
			side={side}
			updateRoute={updateRoute}
			updateParams={updateParams}
			crm_account={crm_account}
		/>
	);
}

