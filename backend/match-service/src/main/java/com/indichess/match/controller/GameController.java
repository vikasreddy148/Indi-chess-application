package com.indichess.match.controller;

import com.indichess.match.dto.MatchResponse;
import com.indichess.match.dto.MoveRequest;
import com.indichess.match.dto.MoveResponse;
import com.indichess.match.service.GameService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
public class GameController {

    private final GameService gameService;

    @PostMapping("/{id}/move")
    public ResponseEntity<MatchResponse> makeMove(
            @PathVariable Long id,
            @Valid @RequestBody MoveRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
        Long playerId = userIdHeader != null ? Long.parseLong(userIdHeader) : null;
        if (playerId == null) {
            return ResponseEntity.status(401).build();
        }
        MatchResponse response = gameService.makeMove(id, playerId, request.getMoveUci());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/resign")
    public ResponseEntity<MatchResponse> resign(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
        Long playerId = userIdHeader != null ? Long.parseLong(userIdHeader) : null;
        if (playerId == null) {
            return ResponseEntity.status(401).build();
        }
        MatchResponse response = gameService.resign(id, playerId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/draw")
    public ResponseEntity<MatchResponse> offerDraw(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
        Long playerId = userIdHeader != null ? Long.parseLong(userIdHeader) : null;
        if (playerId == null) {
            return ResponseEntity.status(401).build();
        }
        MatchResponse response = gameService.offerDraw(id, playerId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<List<MoveResponse>> getMoveHistory(@PathVariable Long id) {
        return ResponseEntity.ok(gameService.getMoveHistory(id));
    }
}
