package com.indichess.match.controller;

import com.indichess.match.dto.MatchResponse;
import com.indichess.match.model.GameType;
import com.indichess.match.model.Match;
import com.indichess.match.service.MatchQueueService;
import com.indichess.match.service.MatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/matchmaking")
@RequiredArgsConstructor
public class MatchmakingController {

    private final MatchQueueService matchQueueService;
    private final MatchService matchService;

    @PostMapping("/join")
    public ResponseEntity<?> joinQueue(
            @RequestParam GameType gameType,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
        Long userId = userIdHeader != null ? Long.parseLong(userIdHeader) : null;
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        return matchQueueService.joinQueue(userId, gameType)
                .map(m -> ResponseEntity.status(201).body((Object) matchService.toMatchResponse(m)))
                .orElse(ResponseEntity.ok().body(Map.of("status", "waiting")));
    }

    @PostMapping("/leave")
    public ResponseEntity<Void> leaveQueue(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
        Long userId = userIdHeader != null ? Long.parseLong(userIdHeader) : null;
        if (userId == null) {
            return ResponseEntity.status(401).build();
        }
        matchQueueService.leaveQueue(userId);
        return ResponseEntity.ok().build();
    }
}
