package com.indichess.match.service;

import com.indichess.match.config.TimeControlConfig;
import com.indichess.match.dto.MatchResponse;
import com.indichess.match.model.GameType;
import com.indichess.match.model.Match;
import com.indichess.match.model.MatchStatus;
import com.indichess.match.model.Move;
import com.indichess.match.service.MoveValidationService.ValidationResult;
import com.indichess.match.repo.MatchRepository;
import com.indichess.match.repo.MoveRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GameService {

    private final MatchRepository matchRepository;
    private final MoveRepository moveRepository;
    private final MatchService matchService;
    private final MoveValidationService moveValidationService;
    private final RatingService ratingService;

    @Transactional
    public MatchResponse makeMove(Long matchId, Long playerId, String moveUci) {
        Match match = matchService.findById(matchId);
        if (match.getStatus() != MatchStatus.ONGOING) {
            throw new IllegalStateException("Match is not ongoing");
        }
        boolean isWhite = match.getPlayer1Id().equals(playerId);
        boolean whiteToMove = moveValidationService.isWhiteToMove(match.getFenCurrent());
        if (isWhite != whiteToMove) {
            throw new IllegalStateException("Not your turn");
        }

        LocalDateTime lastMoveAt = match.getLastMoveAt() != null ? match.getLastMoveAt() : match.getStartedAt();
        if (lastMoveAt == null) lastMoveAt = LocalDateTime.now();
        long elapsedSeconds = ChronoUnit.SECONDS.between(lastMoveAt, LocalDateTime.now());
        int increment = TimeControlConfig.getIncrementSeconds(match.getGameType());
        if (whiteToMove) {
            int p1Time = match.getPlayer1TimeLeftSeconds() != null ? match.getPlayer1TimeLeftSeconds() : TimeControlConfig.getInitialSeconds(match.getGameType());
            int after = (int) (p1Time - elapsedSeconds + increment);
            match.setPlayer1TimeLeftSeconds(Math.max(0, after));
            if (after <= 0) {
                match.setStatus(MatchStatus.PLAYER2_WON);
                match.setFinishedAt(LocalDateTime.now());
                match.setLastMoveAt(LocalDateTime.now());
                matchRepository.save(match);
                ratingService.updateRatingsAfterMatch(match);
                return matchService.toMatchResponse(match);
            }
        } else {
            int p2Time = match.getPlayer2TimeLeftSeconds() != null ? match.getPlayer2TimeLeftSeconds() : TimeControlConfig.getInitialSeconds(match.getGameType());
            int after = (int) (p2Time - elapsedSeconds + increment);
            match.setPlayer2TimeLeftSeconds(Math.max(0, after));
            if (after <= 0) {
                match.setStatus(MatchStatus.PLAYER1_WON);
                match.setFinishedAt(LocalDateTime.now());
                match.setLastMoveAt(LocalDateTime.now());
                matchRepository.save(match);
                ratingService.updateRatingsAfterMatch(match);
                return matchService.toMatchResponse(match);
            }
        }
        match.setLastMoveAt(LocalDateTime.now());

        ValidationResult result = moveValidationService.validateAndApply(match.getFenCurrent(), moveUci);
        if (!result.valid()) {
            throw new IllegalArgumentException(result.error());
        }

        int nextPly = match.getCurrentPly() + 1;
        String fromSquare = moveUci.substring(0, 2);
        String toSquare = moveUci.substring(2, 4);
        String pieceType = extractPieceType(match.getFenCurrent(), fromSquare);

        Move move = new Move();
        move.setMatch(match);
        move.setPly(nextPly);
        move.setMoveNotation(moveUci);
        move.setFromSquare(fromSquare);
        move.setToSquare(toSquare);
        move.setPieceType(pieceType);
        move.setFenAfter(result.newFen());
        move.setCheck(result.isCheck());
        move.setCheckmate(result.isCheckmate());
        moveRepository.save(move);

        match.setCurrentPly(nextPly);
        match.setFenCurrent(result.newFen());
        match.setLastMoveUci(moveUci);
        match.setUpdatedAt(LocalDateTime.now());
        if (result.isCheckmate()) {
            match.setStatus(whiteToMove ? MatchStatus.PLAYER1_WON : MatchStatus.PLAYER2_WON);
            match.setFinishedAt(LocalDateTime.now());
            ratingService.updateRatingsAfterMatch(match);
        } else if (result.isStalemate() || result.isInsufficientMaterial() || result.isFiftyMoveRule()) {
            match.setStatus(MatchStatus.DRAW);
            match.setFinishedAt(LocalDateTime.now());
            ratingService.updateRatingsAfterMatch(match);
        }
        matchRepository.save(match);

        return matchService.toMatchResponse(match);
    }

    private String extractPieceType(String fen, String fromSquare) {
        if (fen == null || fromSquare == null || fromSquare.length() < 2) return null;
        try {
            FenParser fp = new FenParser(fen);
            char p = fp.pieceAt(fromSquare);
            return p == 0 ? null : String.valueOf(Character.toUpperCase(p));
        } catch (Exception e) {
            return null;
        }
    }

    @Transactional
    public MatchResponse resign(Long matchId, Long playerId) {
        Match match = matchService.findById(matchId);
        if (match.getStatus() != MatchStatus.ONGOING) {
            throw new IllegalStateException("Match is not ongoing");
        }
        boolean isPlayer1 = match.getPlayer1Id().equals(playerId);
        match.setStatus(isPlayer1 ? MatchStatus.PLAYER2_WON : MatchStatus.PLAYER1_WON);
        match.setFinishedAt(LocalDateTime.now());
        match.setUpdatedAt(LocalDateTime.now());
        matchRepository.save(match);
        ratingService.updateRatingsAfterMatch(match);
        return matchService.toMatchResponse(match);
    }

    @Transactional
    public MatchResponse offerDraw(Long matchId, Long playerId) {
        Match match = matchService.findById(matchId);
        if (match.getStatus() != MatchStatus.ONGOING) {
            throw new IllegalStateException("Match is not ongoing");
        }
        if (match.getDrawOfferedByPlayerId() != null) {
            throw new IllegalStateException("A draw offer is already pending");
        }
        match.setDrawOfferedByPlayerId(playerId);
        match.setUpdatedAt(LocalDateTime.now());
        matchRepository.save(match);
        return matchService.toMatchResponse(match);
    }

    @Transactional
    public MatchResponse acceptDraw(Long matchId, Long playerId) {
        Match match = matchService.findById(matchId);
        if (match.getStatus() != MatchStatus.ONGOING) {
            throw new IllegalStateException("Match is not ongoing");
        }
        Long offeredBy = match.getDrawOfferedByPlayerId();
        if (offeredBy == null) {
            throw new IllegalStateException("No draw offer pending");
        }
        if (offeredBy.equals(playerId)) {
            throw new IllegalStateException("You cannot accept your own draw offer");
        }
        match.setStatus(MatchStatus.DRAW);
        match.setDrawOfferedByPlayerId(null);
        match.setFinishedAt(LocalDateTime.now());
        match.setUpdatedAt(LocalDateTime.now());
        matchRepository.save(match);
        ratingService.updateRatingsAfterMatch(match);
        return matchService.toMatchResponse(match);
    }

    @Transactional
    public MatchResponse declineDraw(Long matchId, Long playerId) {
        Match match = matchService.findById(matchId);
        if (match.getStatus() != MatchStatus.ONGOING) {
            throw new IllegalStateException("Match is not ongoing");
        }
        if (match.getDrawOfferedByPlayerId() == null) {
            return matchService.toMatchResponse(match);
        }
        match.setDrawOfferedByPlayerId(null);
        match.setUpdatedAt(LocalDateTime.now());
        matchRepository.save(match);
        return matchService.toMatchResponse(match);
    }

    public List<com.indichess.match.dto.MoveResponse> getMoveHistory(Long matchId) {
        List<Move> moves = moveRepository.findByMatchIdOrderByPlyAsc(matchId);
        return moves.stream()
                .map(m -> {
                    var r = new com.indichess.match.dto.MoveResponse();
                    r.setPly(m.getPly());
                    r.setMoveNotation(m.getMoveNotation());
                    r.setFromSquare(m.getFromSquare());
                    r.setToSquare(m.getToSquare());
                    r.setFenAfter(m.getFenAfter());
                    r.setCheck(m.getCheck());
                    r.setCheckmate(m.getCheckmate());
                    return r;
                })
                .collect(Collectors.toList());
    }

    private static class FenParser {
        private static final String FILES = "abcdefgh";
        private final char[][] board = new char[8][8];

        FenParser(String fen) {
            String placement = fen.split("\\s+")[0];
            int row = 0, col = 0;
            for (char c : placement.toCharArray()) {
                if (c == '/') { row++; col = 0; continue; }
                if (Character.isDigit(c)) { col += c - '0'; continue; }
                if (row < 8 && col < 8) board[row][col] = c;
                col++;
            }
        }

        char pieceAt(String square) {
            int file = FILES.indexOf(square.charAt(0));
            int rank = 7 - (square.charAt(1) - '1');
            if (rank < 0 || rank > 7 || file < 0 || file > 7) return 0;
            return board[rank][file];
        }
    }
}
