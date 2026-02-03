package com.indichess.match.controller;

import com.indichess.match.dto.RatingResponse;
import com.indichess.match.service.RatingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ratings")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;

    @GetMapping("/me")
    public ResponseEntity<List<RatingResponse>> getMyRatings(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
        if (userIdHeader == null) {
            return ResponseEntity.status(401).build();
        }
        Long userId = Long.parseLong(userIdHeader);
        return ResponseEntity.ok(ratingService.getRatingsForUser(userId));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<RatingResponse>> getUserRatings(@PathVariable Long userId) {
        return ResponseEntity.ok(ratingService.getRatingsForUser(userId));
    }
}
