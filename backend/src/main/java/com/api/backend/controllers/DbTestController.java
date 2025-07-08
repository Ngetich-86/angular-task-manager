package com.api.backend.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DbTestController {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/db-test")
    public String dbTest() {
        try {
            // Execute a simple query to test the database connection
            jdbcTemplate.queryForObject("SELECT 1", Integer.class);
            return "Database connection is working💚💚💚!";
        } catch (Exception e) {
            return "Database connection failed❌❗: " + e.getMessage();
        }
    }
}
