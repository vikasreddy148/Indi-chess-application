package com.indichess.match.controller;

import com.indichess.match.dto.MatchRequest;
import com.indichess.match.dto.MatchResponse;
import com.indichess.match.service.MatchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
public class MatchController {
    
    private final MatchService matchService;
    
    @PostMapping("/create")
    public ResponseEntity<MatchResponse> createMatch(
            @Valid @RequestBody MatchRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
        Long player1Id = userIdHeader != null ? Long.parseLong(userIdHeader) : 1L; // Fallback for testing
        var match = matchService.createMatch(player1Id, request.getPlayer2Id(), request.getGameType());
        return ResponseEntity.status(HttpStatus.CREATED).body(matchService.toMatchResponse(match));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<MatchResponse> getMatch(@PathVariable Long id) {
        return ResponseEntity.ok(matchService.toMatchResponse(matchService.findById(id)));
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<MatchResponse>> getUserMatches(@PathVariable Long userId) {
        return ResponseEntity.ok(matchService.getUserMatches(userId));
    }
}
