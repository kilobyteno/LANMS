import React, {createContext, useContext, useState, useEffect} from 'react';
import {userApi} from '../lib/api/user';
import { useAuth } from './AuthContext';
import {Organisation} from "@/lib/api/organisation.ts";
import { useIsOrganiserRoute } from '../hooks/useIsOrganiserRoute.ts';

interface OrganisationContextType {
    currentOrganisation: Organisation | null;
    userOrganisations: Organisation[];
    setCurrentOrganisation: (org: Organisation | null) => void;
    loading: boolean;
    refreshOrganisations: () => Promise<void>;
}

const CURRENT_ORG_ID_KEY = 'currentOrganisationId';

const OrganisationContext = createContext<OrganisationContextType | undefined>(undefined);

export function OrganisationProvider({children}: { children: React.ReactNode }) {
    const [currentOrganisation, setCurrentOrganisation] = useState<Organisation | null>(null);
    const [userOrganisations, setUserOrganisations] = useState<Organisation[]>([]);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated } = useAuth();
    const isOrganiserRoute = useIsOrganiserRoute();

    const handleSetCurrentOrganisation = (org: Organisation | null) => {
        setCurrentOrganisation(org);
        if (org?.id) {
            localStorage.setItem(CURRENT_ORG_ID_KEY, org.id);
        } else {
            localStorage.removeItem(CURRENT_ORG_ID_KEY);
        }
    };

    const fetchOrganisations = async () => {
        if (!isAuthenticated || !isOrganiserRoute) {
            setLoading(false);
            return;
        }

        try {
            const response = await userApi.getUserOrganisations();
            const organisations = response.data.data;
            setUserOrganisations(organisations);

            const savedOrgId = localStorage.getItem(CURRENT_ORG_ID_KEY);
            const savedOrg = organisations.find(org => org.id === savedOrgId);

            if (savedOrg) {
                setCurrentOrganisation(savedOrg);
            } else if (organisations.length > 0) {
                // If no saved org or saved org not found, use the first org
                const firstOrg = organisations[0];
                handleSetCurrentOrganisation(firstOrg);
            } else {
                handleSetCurrentOrganisation(null);
            }
        } catch (error) {
            console.error('Failed to fetch organisation:', error);
            handleSetCurrentOrganisation(null);
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        fetchOrganisations();
    }, [isAuthenticated, isOrganiserRoute]);

    return (
        <OrganisationContext.Provider
            value={{
                currentOrganisation,
                userOrganisations,
                setCurrentOrganisation: handleSetCurrentOrganisation,
                loading,
                refreshOrganisations: fetchOrganisations,
            }}
        >
            {children}
        </OrganisationContext.Provider>
    );
}

export const useOrganisation = () => {
    const context = useContext(OrganisationContext);
    if (context === undefined) {
        throw new Error('useOrganisation must be used within an OrganisationProvider');
    }
    return context;
};
