package com.gunluktoplanti.service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.text.Normalizer;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFFont;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import com.gunluktoplanti.entity.DailyMeeting;

@Service
public class ExcelReportService {

    public ByteArrayInputStream generateReport(List<DailyMeeting> meetings) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Daily Meetings");
            CellStyle headerStyle = workbook.createCellStyle();
            XSSFFont font = ((XSSFWorkbook) workbook).createFont();
            font.setBold(true);
            headerStyle.setFont(font);
            Row headerRow = sheet.createRow(0);

            String[] headers = {"ID", "Konu", "Yer", "Toplantı Tarihi",
                "Süre (dk)", "Firmalar", "Firma Katılımcıları", "Departmanlar",
                "Departman Katılımcıları", "Onay Makamları", "Onay Tarihi"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            int rowIndex = 1;
            for (DailyMeeting meeting : meetings) {
                Row row = sheet.createRow(rowIndex++);
                row.createCell(0).setCellValue(meeting.getId());
                row.createCell(1).setCellValue(meeting.getTopic());
                row.createCell(2).setCellValue(meeting.getLocation());
                row.createCell(3).setCellValue(meeting.getMeetingDatetime().format(DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm")));
                row.createCell(4).setCellValue(meeting.getDuration());
                row.createCell(5).setCellValue(String.join(", ", meeting.getCompanies()));
                row.createCell(6).setCellValue(String.join(", ", meeting.getCompanyParticipants()));
                row.createCell(7).setCellValue(String.join(", ", meeting.getDepartments()));
                row.createCell(8).setCellValue(String.join(", ", meeting.getDepartmentParticipants()));
                row.createCell(9).setCellValue(String.join(", ", meeting.getApprovalAuthorities()));
                row.createCell(10).setCellValue(meeting.getApprovalDatetime().format(DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm")));
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        }
    }

    public String generateFileName(Map<String, String> filters) {
        StringBuilder fileName = new StringBuilder("meetings");
        filters.forEach((key, value) -> {
            if (value != null && !value.isEmpty()) {
                String normalizedValue = normalizeAndLowercase(value.replace(" ", "_"));
                fileName.append("-").append(key).append("-").append(normalizedValue);
            }
        });
        return fileName.append(".xlsx").toString();
    }

    private String normalizeAndLowercase(String input) {
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        return Pattern.compile("\\p{M}").matcher(normalized).replaceAll("").replaceAll("[^\\p{ASCII}]", "").toLowerCase();
    }
}
