package com.gunluktoplanti.service;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.sql.Timestamp;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import com.gunluktoplanti.dto.DailyMeetingRequest;
import com.gunluktoplanti.entity.DailyMeeting;
import com.gunluktoplanti.repository.DailyMeetingRepository;

@Service
public class DailyMeetingService {

    private final DailyMeetingRepository repository;
    private final ExcelReportService excelReportService;

    public DailyMeetingService(DailyMeetingRepository repository, ExcelReportService excelReportService) {
        this.repository = repository;
        this.excelReportService = excelReportService;
    }

    public List<DailyMeeting> getFilteredMeetings(Map<String, String> filters) {
        Set<String> validParams = Set.of(
                "topic", "location", "startDate", "endDate", "company",
                "department", "approvalAuthority", "approvalStartDate", "approvalEndDate");

        for (String key : filters.keySet()) {
            if (!validParams.contains(key)) {
                throw new IllegalArgumentException("Invalid parameter: " + key);
            }
        }

        String topic = filters.get("topic");
        String location = filters.get("location");
        String startDate = filters.get("startDate");
        String endDate = filters.get("endDate");
        String company = filters.get("company");
        String department = filters.get("department");
        String approvalAuthority = filters.get("approvalAuthority");
        String approvalStartDate = filters.get("approvalStartDate");
        String approvalEndDate = filters.get("approvalEndDate");

        return repository.filterMeetings(
                topic,
                location,
                startDate != null ? Timestamp.valueOf(startDate) : null,
                endDate != null ? Timestamp.valueOf(endDate) : null,
                company,
                department,
                approvalAuthority,
                approvalStartDate != null ? Timestamp.valueOf(approvalStartDate) : null,
                approvalEndDate != null ? Timestamp.valueOf(approvalEndDate) : null
        );
    }

    public ResponseEntity<String> createMeeting(DailyMeetingRequest request) {
        DailyMeeting meeting = new DailyMeeting();
        meeting.setTopic(request.getTopic());
        meeting.setLocation(request.getLocation());
        meeting.setMeetingDatetime(request.getMeetingDatetime());
        meeting.setDuration(request.getDuration());
        meeting.setCompanies(request.getCompanies());
        meeting.setCompanyParticipants(request.getCompanyParticipants());
        meeting.setDepartments(request.getDepartments());
        meeting.setDepartmentParticipants(request.getDepartmentParticipants());
        meeting.setApprovalAuthorities(request.getApprovalAuthorities());
        meeting.setApprovalDatetime(request.getApprovalDatetime());

        int rowsAffected = repository.insertMeeting(meeting);
        if (rowsAffected > 0) {
            return ResponseEntity.ok("Meeting created successfully.");
        } else {
            return ResponseEntity.status(500).body("Failed to create meeting.");
        }
    }

    public ResponseEntity<InputStreamResource> exportToExcel(Map<String, String> filters) throws IOException {
        List<DailyMeeting> meetings = getFilteredMeetings(filters);
        String fileName = excelReportService.generateFileName(filters);
        ByteArrayInputStream stream = excelReportService.generateReport(meetings);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=" + fileName);
        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.ms-excel"))
                .body(new InputStreamResource(stream));
    }

    public List<String> getDistinctTopics() {
        return repository.findDistinctTopics();
    }

    public List<String> getDistinctLocations() {
        return repository.findDistinctLocations();
    }

    public List<String> getDistinctCompanies() {
        return repository.findDistinctCompanies();
    }

    public List<String> getCompanyParticipants(String company) {
        return repository.findCompanyParticipants(company);
    }

    public List<String> getDistinctDepartments(String location) {
        return repository.findDistinctDepartments(location);
    }

    public List<String> getDepartmentParticipants(String department) {
        return repository.findDepartmentParticipants(department);
    }

    public List<String> getDistinctApprovalAuthorities() {
        return repository.findDistinctApprovalAuthorities();
    }
}
