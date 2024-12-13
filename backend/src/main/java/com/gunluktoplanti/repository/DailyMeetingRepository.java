package com.gunluktoplanti.repository;

import java.sql.Timestamp;
import java.util.List;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import com.gunluktoplanti.entity.DailyMeeting;

@Repository
public class DailyMeetingRepository {

    private final JdbcTemplate jdbcTemplate;

    public DailyMeetingRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private String normalize(String input) {
        return input == null ? null : input.toLowerCase()
                .replace("ç", "c").replace("ğ", "g").replace("ı", "i").replace("ö", "o").replace("ş", "s").replace("ü", "u");
    }

    public List<DailyMeeting> filterMeetings(String topic, String location, Timestamp startDate, Timestamp endDate, String company,
            String department, String approvalAuthority, Timestamp approvalStartDate, Timestamp approvalEndDate) {

        String sql = "SELECT * FROM DAILY_MEETING WHERE 1=1"
                + (topic != null ? " AND LOWER(TRANSLATE(TOPIC, 'ÇĞİÖŞÜçğıöşü', 'CGIOSUcgiosu')) = ?" : "")
                + (location != null ? " AND LOWER(TRANSLATE(LOCATION, 'ÇĞİÖŞÜçğıöşü', 'CGIOSUcgiosu')) = ?" : "")
                + (startDate != null ? " AND MEETING_DATETIME >= ?" : "")
                + (endDate != null ? " AND MEETING_DATETIME <= ?" : "")
                + (company != null ? " AND EXISTS (SELECT 1 FROM JSON_TABLE(COMPANIES, '$[*]' COLUMNS (COMPANY VARCHAR(255) PATH '$')) WHERE LOWER(TRANSLATE(COMPANY, 'ÇĞİÖŞÜçğıöşü', 'CGIOSUcgiosu')) = ?)" : "")
                + (department != null ? " AND EXISTS (SELECT 1 FROM JSON_TABLE(DEPARTMENTS, '$[*]' COLUMNS (DEPARTMENT VARCHAR(255) PATH '$')) WHERE LOWER(TRANSLATE(DEPARTMENT, 'ÇĞİÖŞÜçğıöşü', 'CGIOSUcgiosu')) = ?)" : "")
                + (approvalAuthority != null ? " AND EXISTS (SELECT 1 FROM JSON_TABLE(APPROVAL_AUTHORITIES, '$[*]' COLUMNS (AUTHORITY VARCHAR(255) PATH '$')) WHERE LOWER(TRANSLATE(AUTHORITY, 'ÇĞİÖŞÜçğıöşü', 'CGIOSUcgiosu')) = ?)" : "")
                + (approvalStartDate != null ? " AND APPROVAL_DATETIME >= ?" : "")
                + (approvalEndDate != null ? " AND APPROVAL_DATETIME <= ?" : "");

        return jdbcTemplate.query(sql, preparedStatement -> {
            int index = 1;
            if (topic != null) {
                preparedStatement.setString(index++, normalize(topic));
            }
            if (location != null) {
                preparedStatement.setString(index++, normalize(location));
            }
            if (startDate != null) {
                preparedStatement.setTimestamp(index++, startDate);
            }
            if (endDate != null) {
                preparedStatement.setTimestamp(index++, endDate);
            }
            if (company != null) {
                preparedStatement.setString(index++, normalize(company));
            }
            if (department != null) {
                preparedStatement.setString(index++, normalize(department));
            }
            if (approvalAuthority != null) {
                preparedStatement.setString(index++, normalize(approvalAuthority));
            }
            if (approvalStartDate != null) {
                preparedStatement.setTimestamp(index++, approvalStartDate);
            }
            if (approvalEndDate != null) {
                preparedStatement.setTimestamp(index++, approvalEndDate);
            }
        }, (rs, rowNum) -> new DailyMeeting(
                rs.getInt("ID"),
                rs.getString("TOPIC"),
                rs.getString("LOCATION"),
                rs.getTimestamp("MEETING_DATETIME").toLocalDateTime(),
                rs.getInt("DURATION"),
                rs.getString("COMPANIES"),
                rs.getString("COMPANY_PARTICIPANTS"),
                rs.getString("DEPARTMENTS"),
                rs.getString("DEPARTMENT_PARTICIPANTS"),
                rs.getString("APPROVAL_AUTHORITIES"),
                rs.getTimestamp("APPROVAL_DATETIME").toLocalDateTime()
        ));
    }

    public int insertMeeting(DailyMeeting meeting) {
        String sql = "INSERT INTO DAILY_MEETING (TOPIC, LOCATION, MEETING_DATETIME, DURATION, COMPANIES, COMPANY_PARTICIPANTS, DEPARTMENTS, DEPARTMENT_PARTICIPANTS, APPROVAL_AUTHORITIES, APPROVAL_DATETIME) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        return jdbcTemplate.update(sql,
                meeting.getTopic(),
                meeting.getLocation(),
                meeting.getMeetingDatetime(),
                meeting.getDuration(),
                toJson(meeting.getCompanies()),
                toJson(meeting.getCompanyParticipants()),
                toJson(meeting.getDepartments()),
                toJson(meeting.getDepartmentParticipants()),
                toJson(meeting.getApprovalAuthorities()),
                meeting.getApprovalDatetime());
    }

    public List<String> findDistinctTopics() {
        String sql = "SELECT DISTINCT TOPIC FROM DAILY_MEETING";
        return jdbcTemplate.query(sql, (rs, rowNum) -> rs.getString("TOPIC"));
    }

    public List<String> findDistinctLocations() {
        String sql = "SELECT DISTINCT LOCATION FROM DAILY_MEETING";
        return jdbcTemplate.query(sql, (rs, rowNum) -> rs.getString("LOCATION"));
    }

    public List<String> findDistinctCompanies() {
        String sql = "SELECT DISTINCT jt.COMPANY FROM DAILY_MEETING dm, JSON_TABLE(dm.COMPANIES, '$[*]' COLUMNS (COMPANY VARCHAR(255) PATH '$')) jt";
        return jdbcTemplate.query(sql, (rs, rowNum) -> rs.getString("COMPANY"));
    }

    public List<String> findCompanyParticipants(String company) {
        String sql = "SELECT DISTINCT jt.PARTICIPANT FROM DAILY_MEETING dm, JSON_TABLE(dm.COMPANY_PARTICIPANTS, '$[*]' COLUMNS (PARTICIPANT VARCHAR(255) PATH '$')) jt WHERE EXISTS (SELECT 1 FROM JSON_TABLE(dm.COMPANIES, '$[*]' COLUMNS (COMPANY VARCHAR(255) PATH '$')) WHERE LOWER(TRANSLATE(COMPANY, 'ÇĞİÖŞÜçğıöşü', 'CGIOSUcgiosu')) = ?)";
        return jdbcTemplate.query(sql, preparedStatement -> preparedStatement.setString(1, normalize(company)), (rs, rowNum) -> rs.getString("PARTICIPANT"));
    }

    public List<String> findDistinctDepartments(String location) {
        String sql = "SELECT DISTINCT jt.DEPARTMENT FROM DAILY_MEETING dm, JSON_TABLE(dm.DEPARTMENTS, '$[*]' COLUMNS (DEPARTMENT VARCHAR(255) PATH '$')) jt WHERE LOWER(TRANSLATE(dm.LOCATION, 'ÇĞİÖŞÜçğıöşü', 'CGIOSUcgiosu')) = ?";
        return jdbcTemplate.query(sql, preparedStatement -> preparedStatement.setString(1, normalize(location)), (rs, rowNum) -> rs.getString("DEPARTMENT"));
    }

    public List<String> findDepartmentParticipants(String department) {
        String sql = "SELECT DISTINCT jt.PARTICIPANT FROM DAILY_MEETING dm, JSON_TABLE(dm.DEPARTMENT_PARTICIPANTS, '$[*]' COLUMNS (PARTICIPANT VARCHAR(255) PATH '$')) jt WHERE EXISTS (SELECT 1 FROM JSON_TABLE(dm.DEPARTMENTS, '$[*]' COLUMNS (DEPARTMENT VARCHAR(255) PATH '$')) WHERE LOWER(TRANSLATE(DEPARTMENT, 'ÇĞİÖŞÜçğıöşü', 'CGIOSUcgiosu')) = ?)";
        return jdbcTemplate.query(sql, preparedStatement -> preparedStatement.setString(1, normalize(department)), (rs, rowNum) -> rs.getString("PARTICIPANT"));
    }

    public List<String> findDistinctApprovalAuthorities() {
        String sql = "SELECT DISTINCT jt.AUTHORITY FROM DAILY_MEETING dm, JSON_TABLE(dm.APPROVAL_AUTHORITIES, '$[*]' COLUMNS (AUTHORITY VARCHAR(255) PATH '$')) jt";
        return jdbcTemplate.query(sql, (rs, rowNum) -> rs.getString("AUTHORITY"));
    }

    private String toJson(List<String> list) {
        return "[" + String.join(",", list.stream().map(s -> "\"" + s.trim() + "\"").toList()) + "]";
    }
}
