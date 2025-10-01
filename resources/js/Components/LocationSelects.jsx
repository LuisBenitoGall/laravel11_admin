import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from '@/Hooks/useTranslation';

export default function LocationSelects({
    countries = [],
    formData = {},
    setData = () => {},
    countryField = 'country_id',
    provinceField = 'province_id',
    townField = 'town_id',
    provincesUrl = '/api/provinces',
    townsUrl = '/api/towns',
    labels = { country: 'Country', province: 'Province', town: 'Town' }
}) {
    const __ = useTranslation();
    const [provinces, setProvinces] = useState([]);
    const [towns, setTowns] = useState([]);
    const [loading, setLoading] = useState({ initial: false, provinces: false, towns: false });
    const [error, setError] = useState(null);
    const selectedCountry = formData[countryField] || '';
    const selectedProvince = formData[provinceField] || '';

    // On mount: if a town_id is present, fetch town to initialize selects
    useEffect(() => {
        const initialTownId = formData[townField];
        if (initialTownId) {
            setLoading(l => ({ ...l, initial: true }));
            setError(null);
            // fetch town details (province_id, country_id)
            (async () => {
                try {
                    const res = await axios.get(`/api/town/${initialTownId}`);
                    const town = res.data;
                    if (town) {
                        // If country_id is present and different, set it
                        if (town.country_id) {
                            setData(countryField, String(town.country_id));
                            await fetchProvinces(town.country_id);
                        }

                        if (town.province_id) {
                            setData(provinceField, String(town.province_id));
                            await fetchTowns(town.province_id);
                        }

                        // Finally ensure town is set (in case it was numeric vs string)
                        setData(townField, String(town.id));
                    }
                } catch (e) {
                    // set an error so the UI can show it
                    console.error('Error fetching initial town:', e);
                    setError(__('Error cargando la ubicación') || 'Error loading location');
                }
                finally {
                    setLoading(l => ({ ...l, initial: false }));
                }
            })();
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        // Load provinces if we have a selected country
        if (selectedCountry) {
            fetchProvinces(selectedCountry);
        } else {
            setProvinces([]);
            setTowns([]);
        }
    }, [selectedCountry]);

    useEffect(() => {
        // Load towns if we have a selected province
        if (selectedProvince) {
            fetchTowns(selectedProvince);
        } else {
            setTowns([]);
        }
    }, [selectedProvince]);

    // If countries change we don't need to do anything else

    const fetchProvinces = async (countryId) => {
        try {
            const res = await axios.get(provincesUrl, { params: { country_id: countryId } });
            setProvinces(Array.isArray(res.data) ? res.data : (res.data.provinces || []));
        } catch (e) {
            console.error('Error fetching provinces:', e);
            setProvinces([]);
        }
    };

    const fetchTowns = async (provinceId) => {
        try {
            const res = await axios.get(townsUrl, { params: { province_id: provinceId } });
            setTowns(Array.isArray(res.data) ? res.data : (res.data.towns || []));
        } catch (e) {
            console.error('Error fetching towns:', e);
            setTowns([]);
        }
    };

    const onCountryChange = (e) => {
        const val = e.target.value;
        setData(countryField, val);
        // reset dependent
        setData(provinceField, '');
        setData(townField, '');
        setProvinces([]);
        setTowns([]);
    };

    const onProvinceChange = (e) => {
        const val = e.target.value;
        setData(provinceField, val);
        setData(townField, '');
        setTowns([]);
    };

    const onTownChange = (e) => {
        setData(townField, e.target.value);
    };

    return (
        <>
            <div className="row gy-3">
                <div className="col-md-4">
                    <label className="form-label">{labels.country}</label>
                    <select className="form-select" name={countryField} value={selectedCountry} onChange={onCountryChange}>
                        <option value="">{__('opcion_selec') || 'Select'}</option>
                        {Array.isArray(countries) && countries.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-4">
                    <label className="form-label">{labels.province}</label>
                    <select className="form-select" name={provinceField} value={selectedProvince} onChange={onProvinceChange}>
                        <option value="">{loading.provinces ? (__('cargando') || 'Cargando...') : (__('opcion_selec') || 'Select')}</option>
                        {provinces.map(p => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                <div className="col-md-4">
                    <label className="form-label">{labels.town}</label>
                    <select className="form-select" name={townField} value={formData[townField] || ''} onChange={onTownChange}>
                        <option value="">{loading.towns ? (__('cargando') || 'Cargando...') : (__('opcion_selec') || 'Select')}</option>
                        {towns.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                    {error && (
                        <small className="text-danger">{error}</small>
                    )}
                </div>
            </div>
        </>
    );
}
