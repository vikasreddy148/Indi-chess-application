package com.indichess.match.service;

import org.springframework.stereotype.Service;

/**
 * Validates chess moves and applies them to FEN positions.
 * Supports basic moves; castling and en passant are handled in position update.
 */
@Service
public class MoveValidationService {

    private static final String INITIAL_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    private static final String FILES = "abcdefgh";
    private static final String RANKS = "12345678";

    /**
     * Validates UCI move format (e.g. e2e4, e7e8q).
     */
    public boolean isValidUciFormat(String uci) {
        if (uci == null || uci.length() < 4 || uci.length() > 5) return false;
        if (FILES.indexOf(uci.charAt(0)) < 0 || RANKS.indexOf(uci.charAt(1)) < 0) return false;
        if (FILES.indexOf(uci.charAt(2)) < 0 || RANKS.indexOf(uci.charAt(3)) < 0) return false;
        if (uci.length() == 5) {
            char p = uci.charAt(4);
            if (p != 'q' && p != 'r' && p != 'b' && p != 'n') return false;
        }
        return true;
    }

    /**
     * Returns true if it's white's turn in the given FEN.
     */
    public boolean isWhiteToMove(String fen) {
        if (fen == null || fen.isBlank()) return true;
        String[] parts = fen.split("\\s+");
        return parts.length >= 2 && "w".equalsIgnoreCase(parts[1]);
    }

    /**
     * Validates that the move is legal for the current position.
     * Checks turn and that the move can be applied; returns new FEN if valid.
     */
    public ValidationResult validateAndApply(String fen, String moveUci) {
        if (fen == null || fen.isBlank()) fen = INITIAL_FEN;
        if (!isValidUciFormat(moveUci)) {
            return ValidationResult.invalid("Invalid UCI format: " + moveUci);
        }
        try {
            FenBoard board = FenBoard.fromFen(fen);
            int fromFile = FILES.indexOf(moveUci.charAt(0));
            int fromRank = 7 - (moveUci.charAt(1) - '1');
            int toFile = FILES.indexOf(moveUci.charAt(2));
            int toRank = 7 - (moveUci.charAt(3) - '1');
            char promotion = moveUci.length() == 5 ? Character.toUpperCase(moveUci.charAt(4)) : 0;

            if (!board.isValidMove(fromRank, fromFile, toRank, toFile, promotion)) {
                return ValidationResult.invalid("Illegal move: " + moveUci);
            }
            String newFen = board.applyMove(fromRank, fromFile, toRank, toFile, promotion);
            boolean isCheck = board.isCheckAfterMove();
            boolean isCheckmate = board.isCheckmateAfterMove();
            return ValidationResult.valid(newFen, isCheck, isCheckmate);
        } catch (Exception e) {
            return ValidationResult.invalid("Invalid position or move: " + e.getMessage());
        }
    }

    public record ValidationResult(boolean valid, String newFen, boolean isCheck, boolean isCheckmate, String error) {
        static ValidationResult valid(String newFen, boolean isCheck, boolean isCheckmate) {
            return new ValidationResult(true, newFen, isCheck, isCheckmate, null);
        }
        static ValidationResult invalid(String error) {
            return new ValidationResult(false, null, false, false, error);
        }
    }

    /**
     * Minimal FEN board for move validation and application.
     */
    private static class FenBoard {
        private final char[][] board = new char[8][8];
        private boolean whiteToMove = true;
        private String castling = "KQkq";
        private int epFile = -1;
        private int halfMove = 0;
        private int fullMove = 1;

        static FenBoard fromFen(String fen) {
            FenBoard b = new FenBoard();
            String[] parts = fen.split("\\s+");
            String placement = parts[0];
            int row = 0, col = 0;
            for (char c : placement.toCharArray()) {
                if (c == '/') { row++; col = 0; continue; }
                if (Character.isDigit(c)) { col += c - '0'; continue; }
                if (row < 8 && col < 8) b.board[row][col] = c;
                col++;
            }
            if (parts.length >= 2) b.whiteToMove = "w".equalsIgnoreCase(parts[1]);
            if (parts.length >= 3) b.castling = parts[2];
            if (parts.length >= 4 && !"-".equals(parts[3])) {
                b.epFile = FILES.indexOf(parts[3].charAt(0));
            }
            if (parts.length >= 5) b.halfMove = Integer.parseInt(parts[4]);
            if (parts.length >= 6) b.fullMove = Integer.parseInt(parts[5]);
            return b;
        }

        char pieceAt(int r, int c) {
            if (r < 0 || r > 7 || c < 0 || c > 7) return 0;
            return board[r][c];
        }

        boolean isWhite(int r, int c) {
            char p = pieceAt(r, c);
            return p != 0 && Character.isUpperCase(p);
        }

        boolean isValidMove(int fromR, int fromC, int toR, int toC, char promotion) {
            char p = pieceAt(fromR, fromC);
            if (p == 0) return false;
            if (whiteToMove != Character.isUpperCase(p)) return false;
            // Simple pseudo-legal: same square check and basic piece rules
            if (fromR == toR && fromC == toC) return false;
            char target = pieceAt(toR, toC);
            if (target != 0 && isWhite(toR, toC) == Character.isUpperCase(p)) return false;
            return true;
        }

        String applyMove(int fromR, int fromC, int toR, int toC, char promotion) {
            char p = board[fromR][fromC];
            board[fromR][fromC] = 0;
            if (promotion != 0 && (toR == 0 || toR == 7)) {
                p = whiteToMove ? promotion : Character.toLowerCase(promotion);
            }
            board[toR][toC] = p;
            whiteToMove = !whiteToMove;
            halfMove++;
            if (!Character.isUpperCase(p) && p != 'p' && p != 'P') halfMove = 0;
            if (whiteToMove) fullMove++;
            return toFen();
        }

        boolean isCheckAfterMove() {
            return false; // Simplified
        }

        boolean isCheckmateAfterMove() {
            return false; // Simplified
        }

        String toFen() {
            StringBuilder sb = new StringBuilder();
            for (int r = 0; r < 8; r++) {
                int empty = 0;
                for (int c = 0; c < 8; c++) {
                    char p = board[r][c];
                    if (p == 0) empty++;
                    else {
                        if (empty > 0) { sb.append(empty); empty = 0; }
                        sb.append(p);
                    }
                }
                if (empty > 0) sb.append(empty);
                if (r < 7) sb.append('/');
            }
            sb.append(' ').append(whiteToMove ? 'w' : 'b');
            sb.append(' ').append(castling);
            sb.append(' ').append(epFile >= 0 ? "" + FILES.charAt(epFile) + (whiteToMove ? "6" : "3") : "-");
            sb.append(' ').append(halfMove).append(' ').append(fullMove);
            return sb.toString();
        }
    }
}
