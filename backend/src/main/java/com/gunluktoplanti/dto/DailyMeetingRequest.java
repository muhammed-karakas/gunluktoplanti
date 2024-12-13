package com.gunluktoplanti.dto;

import java.time.LocalDateTime;
import java.util.List;

import javax.validation.constraints.Min;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

import lombok.Data;

@Data
public class DailyMeetingRequest {

    @NotBlank(message = "The topic is required and cannot be blank.")
    private String topic;

    @NotBlank(message = "The location is required and cannot be blank.")
    private String location;

    @NotNull(message = "Meeting date and time are required.")
    private LocalDateTime meetingDatetime;

    @NotNull(message = "Duration is required.")
    @Min(value = 1, message = "Duration must be at least 1 minute.")
    private Integer duration;

    @NotNull(message = "Companies list is required.")
    @Size(min = 1, message = "At least one company must be provided.")
    private List<String> companies;

    @NotNull(message = "Company participants list is required.")
    @Size(min = 1, message = "At least one company participant must be provided.")
    private List<String> companyParticipants;

    @NotNull(message = "Departments list is required.")
    @Size(min = 1, message = "At least one department must be provided.")
    private List<String> departments;

    @NotNull(message = "Department participants list is required.")
    @Size(min = 1, message = "At least one department participant must be provided.")
    private List<String> departmentParticipants;

    @NotNull(message = "Approval authorities list is required.")
    @Size(min = 1, message = "At least one approval authority must be provided.")
    private List<String> approvalAuthorities;

    @NotNull(message = "Approval date and time are required.")
    private LocalDateTime approvalDatetime;
}
