package com.edumaster.controller;

import com.edumaster.dto.Step1Request;
import com.edumaster.dto.Step2Request;
import com.edumaster.entity.StudentAssessment;
import com.edumaster.repository.StudentAssessmentRepository;
import com.edumaster.service.GeminiService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3000")
public class AssessmentController {

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private StudentAssessmentRepository assessmentRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostMapping("/step1-teach")
    public ResponseEntity<Map<String, Object>> generateStep1Lesson(@RequestBody Step1Request request) {
        String topic = (request.getTopic() != null && !request.getTopic().isEmpty()) ? request.getTopic() : "SQL Queries & Joins";
        String level = (request.getLevel() != null && !request.getLevel().isEmpty()) ? request.getLevel() : "Intermediate";

        Map<String, Object> result = geminiService.generateStep1Lesson(topic, level);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/step2-evaluate")
    public ResponseEntity<Map<String, Object>> evaluateStep2Answers(@RequestBody Step2Request request) {
        String topic = (request.getTopic() != null && !request.getTopic().isEmpty()) ? request.getTopic() : "SQL Queries";
        String level = (request.getLevel() != null && !request.getLevel().isEmpty()) ? request.getLevel() : "Intermediate";

        String ans1 = request.getAnswer1();
        if (ans1 == null || ans1.isEmpty()) {
            ans1 = request.getStudentAnswer();
        }
        String ans2 = request.getAnswer2();

        Map<String, Object> evalResult = geminiService.evaluateStep2Answers(topic, level, ans1, ans2);

        // Save entry to PostgreSQL via JPA repository
        try {
            Double score = evalResult.containsKey("score") ? Double.parseDouble(evalResult.get("score").toString()) : 1.5;
            Object missingPoints = evalResult.get("missingPoints");
            String missingJson = objectMapper.writeValueAsString(missingPoints != null ? missingPoints : List.of());

            StudentAssessment assessment = StudentAssessment.builder()
                    .topic(topic)
                    .level(level)
                    .step2Score(score)
                    .quizScore(85)
                    .overallMasteryScore((int) Math.round((score / 2.0) * 100 * 0.4 + 85 * 0.6))
                    .missingPointsJson(missingJson)
                    .completedAt(LocalDate.now().toString())
                    .build();

            StudentAssessment saved = assessmentRepository.save(assessment);
            evalResult.put("assessmentId", saved.getId());
            evalResult.put("savedAt", saved.getCompletedAt());
        } catch (Exception e) {
            System.err.println("[AssessmentController] Error saving assessment to DB: " + e.getMessage());
        }

        return ResponseEntity.ok(evalResult);
    }

    @GetMapping("/assessments")
    public ResponseEntity<List<StudentAssessment>> getAllAssessments() {
        try {
            List<StudentAssessment> assessments = assessmentRepository.findAllByOrderByIdDesc();
            return ResponseEntity.ok(assessments);
        } catch (Exception e) {
            System.err.println("[AssessmentController] Error fetching assessments: " + e.getMessage());
            return ResponseEntity.ok(List.of());
        }
    }
}
