package com.gunluktoplanti.controller;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import javax.validation.Valid;

import org.springframework.core.io.InputStreamResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gunluktoplanti.dto.DailyMeetingRequest;
import com.gunluktoplanti.entity.DailyMeeting;
import com.gunluktoplanti.service.DailyMeetingService;

@RestController
@RequestMapping("/meetings")
public class DailyMeetingController {

    private final DailyMeetingService dailyMeetingService;

    public DailyMeetingController(DailyMeetingService dailyMeetingService) {
        this.dailyMeetingService = dailyMeetingService;
    }

    @GetMapping
    public List<DailyMeeting> getFilteredMeetings(@RequestParam Map<String, String> allParams) {
        return dailyMeetingService.getFilteredMeetings(allParams);
    }

    @PostMapping
    public ResponseEntity<String> createMeeting(@RequestBody @Valid DailyMeetingRequest request) {
        return dailyMeetingService.createMeeting(request);
    }

    @GetMapping("/topics")
    public List<String> getDistinctTopics() {
        return dailyMeetingService.getDistinctTopics();
    }

    @GetMapping("/locations")
    public List<String> getDistinctLocations() {
        return dailyMeetingService.getDistinctLocations();
    }

    @GetMapping("/companies")
    public List<String> getDistinctCompanies() {
        return dailyMeetingService.getDistinctCompanies();
    }

    @GetMapping("/company-participants")
    public List<String> getCompanyParticipants(@RequestParam String company) {
        return dailyMeetingService.getCompanyParticipants(company);
    }

    @GetMapping("/departments")
    public List<String> getDistinctDepartments(@RequestParam String location) {
        return dailyMeetingService.getDistinctDepartments(location);
    }

    @GetMapping("/department-participants")
    public List<String> getDepartmentParticipants(@RequestParam String department) {
        return dailyMeetingService.getDepartmentParticipants(department);
    }

    @GetMapping("/approval-authorities")
    public List<String> getDistinctApprovalAuthorities() {
        return dailyMeetingService.getDistinctApprovalAuthorities();
    }

    @GetMapping("/export")
    public ResponseEntity<InputStreamResource> exportToExcel(@RequestParam Map<String, String> allParams) throws IOException {
        return dailyMeetingService.exportToExcel(allParams);
    }
}
