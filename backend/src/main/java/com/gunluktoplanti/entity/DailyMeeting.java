package com.gunluktoplanti.entity;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

@Data
public class DailyMeeting {

    private Integer id;
    private String topic;
    private String location;
    private LocalDateTime meetingDatetime;
    private Integer duration;
    private List<String> companies;
    private List<String> companyParticipants;
    private List<String> departments;
    private List<String> departmentParticipants;
    private List<String> approvalAuthorities;
    private LocalDateTime approvalDatetime;

    public DailyMeeting() {
    }

    public DailyMeeting(Integer id, String topic, String location, LocalDateTime meetingDatetime,
            Integer duration, String companies, String companyParticipants, String departments,
            String departmentParticipants, String approvalAuthorities, LocalDateTime approvalDatetime) {
        this.id = id;
        this.topic = topic;
        this.location = location;
        this.meetingDatetime = meetingDatetime;
        this.duration = duration;
        this.companies = parseJson(companies);
        this.companyParticipants = parseJson(companyParticipants);
        this.departments = parseJson(departments);
        this.departmentParticipants = parseJson(departmentParticipants);
        this.approvalAuthorities = parseJson(approvalAuthorities);
        this.approvalDatetime = approvalDatetime;
    }

    private List<String> parseJson(String json) {
        return List.of(json.replace("[", "").replace("]", "").replace("\"", "").split(",")).stream().map(String::trim).toList();
    }
}
