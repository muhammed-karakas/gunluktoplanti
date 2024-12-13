
import java.io.FileWriter;
import java.io.IOException;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;

public class Sample {

    public static void main(String[] args) {
        Random random = new Random();
        LocalDate now = LocalDate.now();
        List<String> topics = List.of("Bütçe Görüşmesi", "Strateji Planlama", "Proje Başlangıcı", "Üç Aylık Raporlama", "Ekip Gelişimi");
        List<String> locations = List.of("A", "B", "C");

        try (FileWriter writer = new FileWriter("sample.sql")) {
            for (int i = 1; i <= 100; i++) {
                int day = random.nextInt(now.lengthOfMonth()) + 1;
                LocalDateTime meetingDateTime = LocalDateTime.of(now.withDayOfMonth(day), LocalTime.of(random.nextInt(24), random.nextInt(60)));

                String topic = topics.get(random.nextInt(topics.size()));
                String location = locations.get(random.nextInt(locations.size()));

                int departmentCount = random.nextInt(5) + 1;
                Set<String> departments = new HashSet<>();
                Set<String> departmentParticipants = new HashSet<>();
                while (departments.size() < departmentCount) {
                    String department = location + random.nextInt(10);
                    departments.add(department);
                    int participantCount = random.nextInt(5) + 1;
                    for (int k = 0; k < participantCount; k++) {
                        departmentParticipants.add(department + random.nextInt(10));
                    }
                }

                int companyCount = random.nextInt(5) + 1;
                Set<String> companies = new HashSet<>();
                Set<String> companyParticipants = new HashSet<>();
                while (companies.size() < companyCount) {
                    String firm = String.valueOf((char) ('A' + random.nextInt(26)));
                    companies.add(firm);
                    int participantCount = random.nextInt(5) + 1;
                    for (int k = 0; k < participantCount; k++) {
                        companyParticipants.add(firm + random.nextInt(10));
                    }
                }

                int approvalAuthorityCount = random.nextInt(5) + 1;
                Set<String> approvalAuthorities = new HashSet<>();
                while (approvalAuthorities.size() < approvalAuthorityCount) {
                    approvalAuthorities.add("Onay Makamı " + random.nextInt(10));
                }

                int duration = (random.nextInt(120) + 30);

                LocalDateTime approvalDateTime = meetingDateTime.minusDays(random.nextInt(7) + 1).withHour(random.nextInt(24)).withMinute(random.nextInt(60));

                writer.write(String.format("""
                                           INSERT INTO DAILY_MEETING (TOPIC, LOCATION, MEETING_DATETIME, DURATION, COMPANIES, \
                                           COMPANY_PARTICIPANTS, DEPARTMENTS, DEPARTMENT_PARTICIPANTS, APPROVAL_AUTHORITIES, APPROVAL_DATETIME) \
                                           VALUES ('%s', '%s', '%s', %d, '%s', '%s', '%s', '%s', '%s', '%s');
                                           """,
                        topic, location, meetingDateTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")), duration,
                        toJsonArray("Şirket ", companies), toJsonArray("Şirket Katılımcısı ", companyParticipants),
                        toJsonArray("Departman ", departments), toJsonArray("Departman Katılımcısı ", departmentParticipants),
                        toJsonArray("", approvalAuthorities),
                        approvalDateTime.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))));
            }
            System.out.println("sample.sql dosyası başarıyla oluşturuldu.");
        } catch (IOException e) {
            System.err.println("Dosya yazma hatası: " + e.getMessage());
        }
    }

    private static String toJsonArray(String prefix, Set<String> elements) {
        List<String> jsonElements = new ArrayList<>();
        for (String element : elements) {
            jsonElements.add(String.format("\"%s%s\"", prefix, element));
        }
        return "[" + String.join(", ", jsonElements) + "]";
    }
}
