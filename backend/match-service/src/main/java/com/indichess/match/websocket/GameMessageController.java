package com.indichess.match.websocket;

import com.indichess.match.dto.MatchResponse;
import com.indichess.match.service.GameService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@Slf4j
public class GameMessageController {

    private final GameService gameService;
    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/game/{matchId}/move")
    public void move(
            @DestinationVariable Long matchId,
            @Payload MoveMessage payload,
            SimpMessageHeaderAccessor accessor) {
        GameUpdateMessage msg;
        Long userId = extractUserId(accessor);
        if (userId == null) {
            msg = GameUpdateMessage.error("Unauthorized");
        } else {
            try {
                MatchResponse match = gameService.makeMove(matchId, userId, payload.getMoveUci());
                msg = GameUpdateMessage.moveMade(match, payload.getMoveUci());
            } catch (Exception e) {
                log.warn("Move failed for match {}: {}", matchId, e.getMessage());
                msg = GameUpdateMessage.error(e.getMessage());
            }
        }
        messagingTemplate.convertAndSend("/topic/game/" + matchId, msg);
    }

    @MessageMapping("/game/{matchId}/resign")
    public void resign(
            @DestinationVariable Long matchId,
            SimpMessageHeaderAccessor accessor) {
        GameUpdateMessage msg;
        Long userId = extractUserId(accessor);
        if (userId == null) {
            msg = GameUpdateMessage.error("Unauthorized");
        } else {
            try {
                MatchResponse match = gameService.resign(matchId, userId);
                msg = GameUpdateMessage.resigned(match, userId);
            } catch (Exception e) {
                log.warn("Resign failed for match {}: {}", matchId, e.getMessage());
                msg = GameUpdateMessage.error(e.getMessage());
            }
        }
        messagingTemplate.convertAndSend("/topic/game/" + matchId, msg);
    }

    @MessageMapping("/game/{matchId}/draw")
    public void offerDraw(
            @DestinationVariable Long matchId,
            SimpMessageHeaderAccessor accessor) {
        GameUpdateMessage msg;
        Long userId = extractUserId(accessor);
        if (userId == null) {
            msg = GameUpdateMessage.error("Unauthorized");
        } else {
            try {
                MatchResponse match = gameService.offerDraw(matchId, userId);
                msg = GameUpdateMessage.draw(match);
            } catch (Exception e) {
                log.warn("Draw failed for match {}: {}", matchId, e.getMessage());
                msg = GameUpdateMessage.error(e.getMessage());
            }
        }
        messagingTemplate.convertAndSend("/topic/game/" + matchId, msg);
    }

    private Long extractUserId(SimpMessageHeaderAccessor accessor) {
        if (accessor == null || accessor.getUser() == null) return null;
        String name = accessor.getUser().getName();
        if (name == null || !name.contains(":")) return null;
        try {
            return Long.parseLong(name.split(":")[0]);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    // DTOs for WebSocket messages
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class MoveMessage {
        private String moveUci;
    }

    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class GameUpdateMessage {
        private String type;
        private MatchResponse match;
        private String moveUci;
        private Long resignedPlayerId;
        private String error;

        public static GameUpdateMessage moveMade(MatchResponse match, String moveUci) {
            GameUpdateMessage m = new GameUpdateMessage();
            m.setType("MOVE_MADE");
            m.setMatch(match);
            m.setMoveUci(moveUci);
            return m;
        }

        public static GameUpdateMessage resigned(MatchResponse match, Long resignedPlayerId) {
            GameUpdateMessage m = new GameUpdateMessage();
            m.setType("RESIGNED");
            m.setMatch(match);
            m.setResignedPlayerId(resignedPlayerId);
            return m;
        }

        public static GameUpdateMessage draw(MatchResponse match) {
            GameUpdateMessage m = new GameUpdateMessage();
            m.setType("DRAW");
            m.setMatch(match);
            return m;
        }

        public static GameUpdateMessage error(String error) {
            GameUpdateMessage m = new GameUpdateMessage();
            m.setType("ERROR");
            m.setError(error);
            return m;
        }
    }
}
