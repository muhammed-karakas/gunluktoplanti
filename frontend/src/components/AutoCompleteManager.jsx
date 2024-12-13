import React, { createContext, useContext, useEffect, useState } from 'react';
import meetingService from '../api/meetingService';

const AutoCompleteContext = createContext();

export const AutoCompleteProvider = ({ children }) => {

    const [topics, setTopics] = useState([]);
    const [locations, setLocations] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [approvalAuthorities, setApprovalAuthorities] = useState([]);
    const [companyParticipants, setCompanyParticipants] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [departmentParticipants, setDepartmentParticipants] = useState([]);

    const [loading, setLoading] = useState({
        topics: false, locations: false, companies: false, approvalAuthorities: false,
        companyParticipants: false, departments: false, departmentParticipants: false
    });

    useEffect(() => {
        const fetchStaticData = async () => {
            try {
                setLoading((prev) => ({
                    ...prev, topics: true, locations: true, companies: true, approvalAuthorities: true
                }));
                const [topicsRes, locationsRes, companiesRes, approvalAuthoritiesRes] = await Promise.all([
                    meetingService.getTopics(),
                    meetingService.getLocations(),
                    meetingService.getCompanies(),
                    meetingService.getApprovalAuthorities()
                ]);
                setTopics(topicsRes.data);
                setLocations(locationsRes.data);
                setCompanies(companiesRes.data);
                setApprovalAuthorities(approvalAuthoritiesRes.data);
            } catch (error) {
                console.error('Static data fetch failed:', error);
            } finally {
                setLoading((prev) => ({
                    ...prev, topics: false, locations: false, companies: false, approvalAuthorities: false
                }));
            }
        };
        fetchStaticData();
    }, []);

    const fetchCompanyParticipants = async (companies) => {
        if (!companies || companies.length === 0) return;
        try {
            setLoading((prev) => ({ ...prev, companyParticipants: true }));
            const responses = await Promise.all(
                companies.map((company) => meetingService.getCompanyParticipants(company))
            );
            setCompanyParticipants(responses.flatMap((res) => res.data));
        } catch (error) {
            console.error('Failed to fetch company participants:', error);
        } finally {
            setLoading((prev) => ({ ...prev, companyParticipants: false }));
        }
    };

    const fetchDepartments = async (locations) => {
        if (!locations || locations.length === 0) return;
        try {
            setLoading((prev) => ({ ...prev, departments: true }));
            const responses = await Promise.all(
                locations.map((location) => meetingService.getDepartments(location))
            );
            setDepartments(responses.flatMap((res) => res.data));
        } catch (error) {
            console.error('Failed to fetch departments:', error);
        } finally {
            setLoading((prev) => ({ ...prev, departments: false }));
        }
    };

    const fetchDepartmentParticipants = async (departments) => {
        if (!departments || departments.length === 0) return;
        try {
            setLoading((prev) => ({ ...prev, departmentParticipants: true }));
            const responses = await Promise.all(
                departments.map((department) => meetingService.getDepartmentParticipants(department))
            );
            setDepartmentParticipants(responses.flatMap((res) => res.data));
        } catch (error) {
            console.error('Failed to fetch department participants:', error);
        } finally {
            setLoading((prev) => ({ ...prev, departmentParticipants: false }));
        }
    };

    const value = {
        topics, locations, companies, approvalAuthorities, companyParticipants, departments, departmentParticipants, loading,
        fetchCompanyParticipants, fetchDepartments, fetchDepartmentParticipants
    };

    return <AutoCompleteContext.Provider value={value}>{children}</AutoCompleteContext.Provider>;
};

export const useAutoComplete = () => {
    const context = useContext(AutoCompleteContext);
    if (!context) {
        throw new Error('useAutoComplete must be used within an AutoCompleteProvider');
    }
    return context;
};
