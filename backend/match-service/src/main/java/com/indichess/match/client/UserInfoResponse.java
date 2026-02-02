package com.indichess.match.client;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserInfoResponse {
    private Long userId;
    private String username;
    private String email;
    private String pfpUrl;
    private String country;
    private Integer rating;
    private LocalDateTime createdAt;
}
