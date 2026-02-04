package com.indichess.match.service;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * Validates chess moves and applies them to FEN positions.
 * Supports standard moves, castling, en passant, promotion.
 * Detects Checkmate, Stalemate, Insufficient Material, and 50-Move Rule.
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
            return p == 'q' || p == 'r' || p == 'b' || p == 'n';
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
     * checks turn and that the move can be applied; returns new FEN if valid.
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
            // Must not leave own king in check
            FenBoard copy = board.copy();
            copy.applyMove(fromRank, fromFile, toRank, toFile, promotion);
            if (copy.isKingInCheck(!copy.whiteToMove)) {
                return ValidationResult.invalid("Move leaves king in check");
            }
            String newFen = board.applyMove(fromRank, fromFile, toRank, toFile, promotion);
            boolean isCheck = board.isCheckAfterMove();
            boolean isCheckmate = board.isCheckmateAfterMove();
            boolean isStalemate = board.isStalemateAfterMove();
            boolean isInsufficientMaterial = board.isInsufficientMaterial();
            boolean isFiftyMoveRule = board.isFiftyMoveRule();
            
            return ValidationResult.valid(newFen, isCheck, isCheckmate, isStalemate, isInsufficientMaterial, isFiftyMoveRule);
        } catch (Exception e) {
            return ValidationResult.invalid("Invalid position or move: " + e.getMessage());
        }
    }

    public record ValidationResult(boolean valid, String newFen, boolean isCheck, boolean isCheckmate, boolean isStalemate, boolean isInsufficientMaterial, boolean isFiftyMoveRule, String error) {
        static ValidationResult valid(String newFen, boolean isCheck, boolean isCheckmate, boolean isStalemate, boolean isInsufficientMaterial, boolean isFiftyMoveRule) {
            return new ValidationResult(true, newFen, isCheck, isCheckmate, isStalemate, isInsufficientMaterial, isFiftyMoveRule, null);
        }
        static ValidationResult invalid(String error) {
            return new ValidationResult(false, null, false, false, false, false, false, error);
        }
    }

    /**
     * FEN board with full chess rules: piece movement, check, castling, en passant, standard draws.
     */
    private static class FenBoard {
        private final char[][] board = new char[8][8];
        private boolean whiteToMove = true;
        private String castling = "KQkq";
        private int epFile = -1;
        private int halfMove = 0;
        private int fullMove = 1;

        FenBoard() {}

        FenBoard copy() {
            FenBoard b = new FenBoard();
            for (int r = 0; r < 8; r++) System.arraycopy(board[r], 0, b.board[r], 0, 8);
            b.whiteToMove = whiteToMove;
            b.castling = castling;
            b.epFile = epFile;
            b.halfMove = halfMove;
            b.fullMove = fullMove;
            return b;
        }

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

        /** Path clear between (fromR,fromC) and (toR,toC) exclusive. */
        boolean pathClear(int fromR, int fromC, int toR, int toC) {
            int dr = Integer.compare(toR - fromR, 0);
            int dc = Integer.compare(toC - fromC, 0);
            int r = fromR + dr;
            int c = fromC + dc;
            while (r != toR || c != toC) {
                if (pieceAt(r, c) != 0) return false;
                r += dr;
                c += dc;
            }
            return true;
        }

        /** Checks if castling move is valid (rights, path clear, no checks). */
        boolean isValidCastling(int fromR, int fromC, int toR, int toC) {
            char p = pieceAt(fromR, fromC);
            if (Character.toUpperCase(p) != 'K') return false;
            boolean white = Character.isUpperCase(p);
            
            // Check castling rights
            if (white) {
                if (fromR != 7 || fromC != 4) return false;
                if (toC == 6) { // Kingside
                    if (!castling.contains("K")) return false;
                    if (!pathClear(7, 4, 7, 7)) return false;
                    if (isSquareAttackedBy(7, 4, false) || isSquareAttackedBy(7, 5, false) || isSquareAttackedBy(7, 6, false)) return false;
                } else if (toC == 2) { // Queenside
                    if (!castling.contains("Q")) return false;
                    if (!pathClear(7, 4, 7, 0)) return false;
                    if (isSquareAttackedBy(7, 4, false) || isSquareAttackedBy(7, 3, false) || isSquareAttackedBy(7, 2, false)) return false;
                } else return false;
            } else {
                if (fromR != 0 || fromC != 4) return false;
                if (toC == 6) { // Kingside
                    if (!castling.contains("k")) return false;
                    if (!pathClear(0, 4, 0, 7)) return false;
                    if (isSquareAttackedBy(0, 4, true) || isSquareAttackedBy(0, 5, true) || isSquareAttackedBy(0, 6, true)) return false;
                } else if (toC == 2) { // Queenside
                    if (!castling.contains("q")) return false;
                    if (!pathClear(0, 4, 0, 0)) return false;
                    if (isSquareAttackedBy(0, 4, true) || isSquareAttackedBy(0, 3, true) || isSquareAttackedBy(0, 2, true)) return false;
                } else return false;
            }
            return true;
        }

        boolean pieceCanMove(int fromR, int fromC, int toR, int toC, char promotion) {
            char p = pieceAt(fromR, fromC);
            if (p == 0) return false;
            boolean white = Character.isUpperCase(p);
            char target = pieceAt(toR, toC);
            boolean capturing = target != 0;

            switch (Character.toUpperCase(p)) {
                case 'P': // Pawn
                    int dir = white ? -1 : 1;
                    int startRank = white ? 6 : 1;
                    if (fromC == toC) {
                        if (capturing) return false;
                        if (toR == fromR + dir) {
                            if ((white && toR == 0) || (!white && toR == 7)) return promotion == 'Q' || promotion == 'R' || promotion == 'B' || promotion == 'N';
                            return true;
                        }
                        if (fromR == startRank && toR == fromR + 2 * dir && pathClear(fromR, fromC, toR, toC)) return true;
                        return false;
                    }
                    if (Math.abs(fromC - toC) != 1 || toR != fromR + dir) return false;
                    if (!capturing) {
                        // En passant
                        if (epFile >= 0 && toC == epFile && toR == (white ? 2 : 5)) return true;
                        return false;
                    }
                    if (white && toR == 0) return promotion == 'Q' || promotion == 'R' || promotion == 'B' || promotion == 'N';
                    if (!white && toR == 7) return promotion == 'Q' || promotion == 'R' || promotion == 'B' || promotion == 'N';
                    return true;
                case 'N': // Knight
                    int dr = Math.abs(toR - fromR);
                    int dc = Math.abs(toC - fromC);
                    return (dr == 2 && dc == 1) || (dr == 1 && dc == 2);
                case 'B': // Bishop
                    if (Math.abs(toR - fromR) != Math.abs(toC - fromC)) return false;
                    return pathClear(fromR, fromC, toR, toC);
                case 'R': // Rook
                    if (fromR != toR && fromC != toC) return false;
                    return pathClear(fromR, fromC, toR, toC);
                case 'Q': // Queen
                    boolean diag = Math.abs(toR - fromR) == Math.abs(toC - fromC);
                    boolean line = fromR == toR || fromC == toC;
                    if (!diag && !line) return false;
                    return pathClear(fromR, fromC, toR, toC);
                case 'K': // King
                    if (Math.abs(toR - fromR) <= 1 && Math.abs(toC - fromC) <= 1) return true;
                    // Castling
                    if (Math.abs(toC - fromC) == 2 && fromR == toR) {
                        return isValidCastling(fromR, fromC, toR, toC);
                    }
                    return false;
                default:
                    return false;
            }
        }

        boolean isValidMove(int fromR, int fromC, int toR, int toC, char promotion) {
            char p = pieceAt(fromR, fromC);
            if (p == 0) return false;
            if (whiteToMove != Character.isUpperCase(p)) return false;
            if (fromR == toR && fromC == toC) return false;
            char target = pieceAt(toR, toC);
            if (target != 0 && isWhite(toR, toC) == Character.isUpperCase(p)) return false;
            
            // Pawn promotion check
            char up = Character.toUpperCase(p);
            if (up == 'P') {
                if (whiteToMove && toR == 0 && promotion == 0) return false;
                if (!whiteToMove && toR == 7 && promotion == 0) return false;
            }
            return pieceCanMove(fromR, fromC, toR, toC, promotion);
        }

        boolean isSquareAttackedBy(int r, int c, boolean byWhite) {
            for (int pr = 0; pr < 8; pr++) {
                for (int pc = 0; pc < 8; pc++) {
                    char piece = pieceAt(pr, pc);
                    if (piece == 0) continue;
                    if (Character.isUpperCase(piece) != byWhite) continue;
                    // Use basic attacks, exclude castling logic for king attacks
                    if (pieceCanAttack(pr, pc, r, c)) return true;
                }
            }
            return false;
        }

        boolean pieceCanAttack(int fromR, int fromC, int toR, int toC) {
            char p = pieceAt(fromR, fromC);
            if (p == 0) return false;
            boolean white = Character.isUpperCase(p);
            switch (Character.toUpperCase(p)) {
                case 'P':
                    int dir = white ? -1 : 1;
                    return toR == fromR + dir && Math.abs(toC - fromC) == 1;
                case 'N':
                    int dr = Math.abs(toR - fromR);
                    int dc = Math.abs(toC - fromC);
                    return (dr == 2 && dc == 1) || (dr == 1 && dc == 2);
                case 'B':
                    if (Math.abs(toR - fromR) != Math.abs(toC - fromC)) return false;
                    return pathClear(fromR, fromC, toR, toC);
                case 'R':
                    if (fromR != toR && fromC != toC) return false;
                    return pathClear(fromR, fromC, toR, toC);
                case 'Q':
                    boolean diag = Math.abs(toR - fromR) == Math.abs(toC - fromC);
                    boolean line = fromR == toR || fromC == toC;
                    if (!diag && !line) return false;
                    return pathClear(fromR, fromC, toR, toC);
                case 'K':
                    return Math.abs(toR - fromR) <= 1 && Math.abs(toC - fromC) <= 1;
                default:
                    return false;
            }
        }

        int[] findKing(boolean white) {
            char k = white ? 'K' : 'k';
            for (int r = 0; r < 8; r++)
                for (int c = 0; c < 8; c++)
                    if (board[r][c] == k) return new int[]{r, c};
            return null;
        }

        boolean isKingInCheck(boolean forWhite) {
            int[] king = findKing(forWhite);
            if (king == null) return false;
            return isSquareAttackedBy(king[0], king[1], !forWhite);
        }

        boolean isCheckAfterMove() {
            return isKingInCheck(whiteToMove);
        }

        boolean hasLegalMoves() {
            for (int fromR = 0; fromR < 8; fromR++) {
                for (int fromC = 0; fromC < 8; fromC++) {
                    char p = pieceAt(fromR, fromC);
                    if (p == 0 || Character.isUpperCase(p) != whiteToMove) continue;
                    for (int toR = 0; toR < 8; toR++) {
                        for (int toC = 0; toC < 8; toC++) {
                            if (fromR == toR && fromC == toC) continue;
                            char prom = (Character.toUpperCase(p) == 'P' && (toR == 0 || toR == 7)) ? 'Q' : 0;
                            if (!isValidMove(fromR, fromC, toR, toC, prom)) continue;
                            FenBoard copy = copy();
                            copy.applyMove(fromR, fromC, toR, toC, prom);
                            if (!copy.isKingInCheck(!copy.whiteToMove)) return true;
                        }
                    }
                }
            }
            return false;
        }

        boolean isCheckmateAfterMove() {
            return isKingInCheck(whiteToMove) && !hasLegalMoves();
        }

        boolean isStalemateAfterMove() {
            return !isKingInCheck(whiteToMove) && !hasLegalMoves();
        }

        boolean isFiftyMoveRule() {
            return halfMove >= 100;
        }

        boolean isInsufficientMaterial() {
            Map<Character, Integer> pieces = new HashMap<>();
            for (int r = 0; r < 8; r++) {
                for (int c = 0; c < 8; c++) {
                    char p = board[r][c];
                    if (p != 0) {
                        pieces.put(p, pieces.getOrDefault(p, 0) + 1);
                    }
                }
            }
            // K vs K
            if (pieces.size() == 2 && pieces.containsKey('K') && pieces.containsKey('k')) return true;
            
            // K+N vs K or K+B vs K
            if (pieces.size() == 3) {
                if (pieces.containsKey('N') || pieces.containsKey('B') || pieces.containsKey('n') || pieces.containsKey('b')) return true;
            }
            // K+N vs K+N etc not automatically drawn by FIDE (can have helpmate), but often treated as draw by engines.
            // Strict FIDE: K+B vs K+B (same color bishops) is draw? No, actually not forced.
            // Simplified insufficient: K, KN, KB vs K, KN, KB involved.
            // Let's stick to minimal: K vs K, KN vs K, KB vs K.
            return false;
        }

        String applyMove(int fromR, int fromC, int toR, int toC, char promotion) {
            char p = board[fromR][fromC];
            char captured = board[toR][toC];
            board[fromR][fromC] = 0;
            
            // Castling Move Rook
            if (Character.toUpperCase(p) == 'K' && Math.abs(toC - fromC) == 2) {
                if (toC == 6) { // Kingside
                    board[toR][5] = board[toR][7];
                    board[toR][7] = 0;
                } else if (toC == 2) { // Queenside
                    board[toR][3] = board[toR][0];
                    board[toR][0] = 0;
                }
            }

            // En passant capture
            if (Character.toUpperCase(p) == 'P' && epFile >= 0 && toC == epFile && captured == 0) {
                board[whiteToMove ? toR + 1 : toR - 1][toC] = 0; // Remove pawn
                captured = 'P'; // Mark as capture for halfmove
            }

            if (promotion != 0 && (toR == 0 || toR == 7)) {
                p = whiteToMove ? promotion : Character.toLowerCase(promotion);
            }
            board[toR][toC] = p;

            // Update castling rights
            if (whiteToMove) {
                if (p == 'K') castling = castling.replace("K", "").replace("Q", "");
                if (p == 'R') {
                    if (fromR == 7 && fromC == 0) castling = castling.replace("Q", "");
                    if (fromR == 7 && fromC == 7) castling = castling.replace("K", "");
                }
            } else {
                if (p == 'k') castling = castling.replace("k", "").replace("q", "");
                if (p == 'r') {
                    if (fromR == 0 && fromC == 0) castling = castling.replace("q", "");
                    if (fromR == 0 && fromC == 7) castling = castling.replace("k", "");
                }
            }
            // If rook is captured, remove rights
            if (captured != 0) {
                 if (toR == 0 && toC == 0) castling = castling.replace("q", "");
                 if (toR == 0 && toC == 7) castling = castling.replace("k", "");
                 if (toR == 7 && toC == 0) castling = castling.replace("Q", "");
                 if (toR == 7 && toC == 7) castling = castling.replace("K", "");
            }
            if (castling.isEmpty()) castling = "-";

            // Update en passant target
            epFile = -1;
            if (Character.toUpperCase(p) == 'P' && Math.abs(toR - fromR) == 2) {
                epFile = fromC;
            }

            whiteToMove = !whiteToMove;
            if (Character.toUpperCase(p) == 'P' || captured != 0) halfMove = 0;
            else halfMove++;
            if (whiteToMove) fullMove++; // After black moves, fullmove increments
            
            return toFen();
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
