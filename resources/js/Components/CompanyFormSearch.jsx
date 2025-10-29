import React from 'react';
import { useForm } from '@inertiajs/react';

//Components:
import PrimaryButton from './PrimaryButton';
import SelectSearch from './SelectSearch';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

const CompanyFormSearch = ({ options, name, side = false }) => {
    const __ = useTranslation();
    const { data, setData, post, reset, errors, processing } = useForm({
            side: side,
            company_id: ''
    });

    const handleChange = (selectedOption) => {
        console.log('Selected:', selectedOption);
    };

    const handleSelect = (e) => {
        e.preventDefault();
        post(route('customer-provider.store-by-list'), {
            onSuccess: () => reset()
        });
    };

    return (
        <form  onSubmit={handleSelect}>
            {/* Hidden Input for Side */}
            <input type="hidden" name="$side" value={side} />

            <div className="row gy-3">
                {/* Select Search Field */}
                <div className="col-lg-12">
                    <div>
                        <label htmlFor={name} className="form-label">{__('empresa_selec_lista')}</label>
                        <SelectSearch 
                            name="company_id"
                            options={options} 
                            onChange={(selectedOption) => setData('company_id', selectedOption ? selectedOption.value : '')} 
                            placeholder={__('empresa_selec')} 
                        />
                    </div>
                </div>

                <div className='mt-4 text-end'>
                    <PrimaryButton disabled={processing} className='btn btn-rdn'>
                        {processing ? __('procesando')+'...':__('guardar')}
                    </PrimaryButton>    
                </div>
            </div>
        </form>
    );
};

export default CompanyFormSearch;