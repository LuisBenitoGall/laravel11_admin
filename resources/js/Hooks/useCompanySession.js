// resources/js/Hooks/useCompanySession.js
import { useSafePage } from '@/Hooks/useSafePage';

export const useCompanySession = () => {
    const sessionData = useSafePage()?.sessionData ?? {};

    return {
        currentCompany: sessionData.currentCompany ?? null,
        companyModules: Array.isArray(sessionData.companyModules) ? sessionData.companyModules : [],
        companySettings: sessionData.companySettings ?? null,
    };
};
