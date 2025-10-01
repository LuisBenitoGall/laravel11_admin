import { useEffect, useState } from 'react';
import axios from 'axios';

export default function useInfo(code) {
    const [data, setData] = useState({ title: '', excerpt: '' });

    useEffect(() => {
        if (!code) return;

        axios.get(`/api/admin/content/${code}`)
            .then(res => setData(res.data))
            .catch(() => setData({ title: '', excerpt: '' }));
    }, [code]);

    return data;
}
