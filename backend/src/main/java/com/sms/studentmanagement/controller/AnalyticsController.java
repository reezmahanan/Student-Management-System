package com.sms.studentmanagement.controller;

import com.sms.studentmanagement.dto.ApiResponse;
import com.sms.studentmanagement.dto.DashboardStatsDTO;
import com.sms.studentmanagement.service.AcademicAdvisorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.ByteArrayInputStream;
import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
@Slf4j
public class AnalyticsController {

    private final AcademicAdvisorService advisorService;

    @GetMapping("/at-risk")
    public ResponseEntity<ApiResponse<List<DashboardStatsDTO.AtRiskStudentDTO>>> getAtRiskStudents() {
        log.info("Assessing students at risk via AI Advisor Service...");
        List<DashboardStatsDTO.AtRiskStudentDTO> list = advisorService.assessAtRiskStudents();
        return ResponseEntity.ok(ApiResponse.success("At-risk assessment completed", list));
    }
}
