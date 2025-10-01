import { router, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import { addYears, format } from 'date-fns';
import * as locales from 'date-fns/locale';

//Components:
import SelectInput from '@/Components/SelectInput';
import TextInput from '@/Components/TextInput';

//Hooks:
import { useTranslation } from '@/Hooks/useTranslation';

export default function FilterRow({ columns, queryParams, visibleColumns, SearchFieldChanged }) {
    const __ = useTranslation();
    const txt_fechas_selec = __('fechas_selec');
    const txt_todos = __('todos');
    const txt_opcion_selec = __('opcion_selec');

    const props = usePage().props;
    const locale = props.locale || 'es';
    const datepickerFormat = props.languages?.[locale]?.[6] || 'dd/MM/yyyy';

    const isManualFiltering = typeof SearchFieldChanged === 'function' && !queryParams.hasOwnProperty('page');

    const translatedColumns = columns.map(col => ({
        ...col,
        translatedLabel: __(col.label),
        translatedPlaceholder: col.placeholder ? __(col.placeholder) : '',
        translatedOptions: col.options?.map(opt => ({
            value: opt.value,
            label: opt.label
        })) || []
    }));

    const [dateRanges, setDateRanges] = useState(() => {
        const initial = {};
        columns.forEach(col => {
            if (col.filter === 'date' && Array.isArray(col.dateKeys) && col.dateKeys.length === 2) {
                initial[col.key] = [
                    queryParams[col.dateKeys[0]] ? new Date(queryParams[col.dateKeys[0]]) : null,
                    queryParams[col.dateKeys[1]] ? new Date(queryParams[col.dateKeys[1]]) : null
                ];
            }
        });
        return initial;
    });

    const [textValues, setTextValues] = useState(() => {
        const initialValues = {};
        columns.forEach(col => {
            if (col.filter === 'text') {
                initialValues[col.key] = queryParams[col.key] || '';
            }
        });
        return initialValues;
    });

    useEffect(() => {
        const newRanges = {};
        const updatedTextValues = {};

        columns.forEach(col => {
            if (col.filter === 'date' && Array.isArray(col.dateKeys) && col.dateKeys.length === 2) {
                newRanges[col.key] = [
                    queryParams[col.dateKeys[0]] ? new Date(queryParams[col.dateKeys[0]]) : null,
                    queryParams[col.dateKeys[1]] ? new Date(queryParams[col.dateKeys[1]]) : null
                ];
            }

            if (col.filter === 'text') {
                const newValue = queryParams[col.key] || '';
                updatedTextValues[col.key] = newValue;
            }
        });

        setDateRanges(newRanges);
        setTextValues(prev => {
            const next = { ...prev };
            for (const key in updatedTextValues) {
                // Solo actualiza si el valor realmente cambió
                if (updatedTextValues[key] !== prev[key]) {
                    next[key] = updatedTextValues[key];
                }
            }
            return next;
        });
    }, [JSON.stringify(queryParams)]);

    const handleDateChange = (colKey, dateKeys, update) => {
        const [start, end] = update;
    
        setDateRanges(prev => ({
            ...prev,
            [colKey]: [start, end]
        }));
    
        if (start && end) {
            const filters = {
                [dateKeys[0]]: start.toISOString().split('T')[0],
                [dateKeys[1]]: end.toISOString().split('T')[0]
            };
    
            const updatedParams = {
                ...queryParams,
                ...filters,
                page: 1
            };
    
            router.get(route("users.index"), updatedParams, {
                preserveState: true,
                replace: true
            });
        }
    };

    const clearDateFilter = (colKey, dateKeys) => {
        const updatedParams = { ...queryParams };
        delete updatedParams[dateKeys[0]];
        delete updatedParams[dateKeys[1]];
        updatedParams.page = 1;

        setDateRanges(prev => ({
            ...prev,
            [colKey]: [null, null]
        }));
        
        router.get(route('users.index'), updatedParams, {
            preserveState: true,
            replace: true
        });
    };

    const handleKeyPress = (name) => (e) => {
        if (e.key === 'Enter') {
            SearchFieldChanged(name, e.target.value.trim());
        }
    };

    return (
        <thead className="tbl-filters">
            <tr className="text-nowrap">
                {translatedColumns.map(col => {
                    const localValue = textValues[col.key] || '';

                    return (
                        <th key={col.key} className={visibleColumns.includes(col.key) ? '' : 'd-none'}>
                            <div className="input-group">
                                {/* Filtro texto */}
                                {col.filter === 'text' && (
                                    <TextInput
                                        className="form-control-sm input-rounded input-rounded-sm"
                                        value={localValue}
                                        placeholder={col.translatedPlaceholder}
                                        onChange={e => {
                                            const newValue = e.target.value;
                                            setTextValues(prev => ({
                                                ...prev,
                                                [col.key]: newValue
                                            }));

                                            if (!isManualFiltering) {
                                                // Para filtrado automático al vuelo
                                                SearchFieldChanged(col.key, newValue.trim());
                                            }
                                        }}
                                        onBlur={() => {
                                            if (isManualFiltering) {
                                                SearchFieldChanged(col.key, localValue.trim());
                                            }
                                        }}
                                        onKeyPress={handleKeyPress(col.key)}
                                        type="search"
                                    />
                                )}

                                {/* Filtro select */}
                                {col.filter === 'select' && Array.isArray(col.translatedOptions) && (
                                    <SelectInput
                                        className="select-rounded select-rounded-sm"
                                        value={queryParams[col.key] || ''}
                                        onChange={(e) => SearchFieldChanged(col.key, e.target.value)}
                                    >
                                        <option value="">{txt_opcion_selec}</option>
                                        {col.translatedOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </SelectInput>
                                )}

                                {/* Filtro date */}
                                {col.filter === 'date' && Array.isArray(col.dateKeys) && col.dateKeys.length === 2 && (
                                    <DatePicker
                                        selectsRange
                                        startDate={dateRanges[col.key]?.[0] || null}
                                        endDate={dateRanges[col.key]?.[1] || null}
                                        onChange={(update) => handleDateChange(col.key, col.dateKeys, update)}
                                        selected={null}
                                        dateFormat={datepickerFormat}
                                        locale={locales[locale] || locales['es']}
                                        placeholderText={txt_fechas_selec}
                                        className="form-control form-control-sm input-rounded input-rounded-sm"
                                        showMonthDropdown
                                        showYearDropdown
                                        dropdownMode="select"
                                        minDate={new Date(2010, 0, 1)}
                                        maxDate={addYears(new Date(), 5)}
                                        yearDropdownItemNumber={10}
                                        preventOpenOnFocus={true}
                                    />                                
                                )}

                                {/* Limpiar filtro */}

                                {col.filter !== 'date' && !!(localValue && localValue.toString().trim()) && (
                                    <button
                                        className="clean-filter"
                                        onClick={() => {
                                            setTextValues(prev => ({
                                                ...prev,
                                                [col.key]: ''
                                            }));
                                            SearchFieldChanged(col.key, '');
                                        }}
                                    >
                                        <i className="lar la-times-circle"></i>
                                    </button>
                                )}

                                {col.filter === 'date' && Array.isArray(col.dateKeys) && (
                                    (queryParams[col.dateKeys[0]] || queryParams[col.dateKeys[1]]) && (
                                        <button
                                            className="clean-filter"
                                            onClick={() => clearDateFilter(col.key, col.dateKeys)}
                                        >
                                            <i className="lar la-times-circle"></i>
                                        </button>
                                    )
                                )}
                            </div>
                        </th>
                    );
                })}

                <th></th>
            </tr>
        </thead>
    );
}
