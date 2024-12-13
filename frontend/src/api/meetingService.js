import apiClient, { BACKEND_URL } from './apiClient';
import dayjs from 'dayjs';

const meetingService = {

    getMeetings(filters) {
        return apiClient.get('/meetings', {
            params: filters
        });
    },

    getMeetingsByYear(year) {
        const startDate = dayjs().year(year).startOf('year').format('YYYY-MM-DD HH:mm:ss');
        const endDate = dayjs().year(year).endOf('year').format('YYYY-MM-DD HH:mm:ss');
        return this.getMeetings({ startDate, endDate });
    },

    getMeetingsByMonth(year, month) {
        const startDate = dayjs().year(year).month(month).startOf('month').format('YYYY-MM-DD HH:mm:ss');
        const endDate = dayjs().year(year).month(month).endOf('month').format('YYYY-MM-DD HH:mm:ss');
        return this.getMeetings({ startDate, endDate });
    },

    exportToExcel(filters) {
        const filteredFilters = Object.fromEntries(
            Object.entries(filters).filter(([_, value]) => value != null)
        );
        const query = new URLSearchParams(filteredFilters).toString();
        const fullUrl = `${BACKEND_URL}/meetings/export?${query}`;
        window.location.href = fullUrl;
    },

    createMeeting(meetingData) {
        return apiClient.post('/meetings', meetingData);
    },

    getTopics() {
        return apiClient.get('/meetings/topics');
    },

    getLocations() {
        return apiClient.get('/meetings/locations');
    },

    getCompanies() {
        return apiClient.get('/meetings/companies');
    },

    getCompanyParticipants(company) {
        return apiClient.get('/meetings/company-participants', {
            params: { company },
        });
    },

    getDepartments(location) {
        return apiClient.get('/meetings/departments', {
            params: { location },
        });
    },

    getDepartmentParticipants(department) {
        return apiClient.get('/meetings/department-participants', {
            params: { department },
        });
    },

    getApprovalAuthorities() {
        return apiClient.get('/meetings/approval-authorities');
    }
};

export default meetingService;
