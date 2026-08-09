package com.edumaster.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "student_assessments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentAssessment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String topic;

    @Column(nullable = false)
    private String level;

    @Column(name = "step2_score")
    private Double step2Score;

    @Column(name = "quiz_score")
    private Integer quizScore;

    @Column(name = "overall_mastery_score")
    private Integer overallMasteryScore;

    @Column(name = "missing_points_json", columnDefinition = "TEXT")
    private String missingPointsJson;

    @Column(name = "completed_at")
    private String completedAt;

    @PrePersist
    public void prePersist() {
        if (completedAt == null || completedAt.isEmpty()) {
            completedAt = LocalDate.now().toString();
        }
    }
}
