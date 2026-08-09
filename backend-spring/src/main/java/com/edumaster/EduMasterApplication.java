package com.edumaster;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class EduMasterApplication {

    public static void main(String[] args) {
        SpringApplication.run(EduMasterApplication.class, args);
        System.out.println("=================================================");
        System.out.println(" EduMaster AI Java Spring Boot Backend Started ");
        System.out.println(" Listening on http://localhost:8080 ");
        System.out.println("=================================================");
    }
}
