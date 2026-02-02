package com.indichess.match.service;

import com.indichess.match.model.GameType;
import com.indichess.match.model.Match;
import com.indichess.match.model.MatchStatus;
import com.indichess.match.model.Rating;
import com.indichess.match.repo.RatingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RatingService {

    private static final int K_FACTOR = 32;
    private static final int DEFAULT_RATING = 1200;

    private final RatingRepository ratingRepository;

    public int getRating(Long userId, GameType gameType) {
        return ratingRepository.findByUserIdAndGameType(userId, gameType)
                .map(Rating::getRating)
                .orElse(DEFAULT_RATING);
    }

    @Transactional
    public void updateRatingsAfterMatch(Match match) {
        if (match.getStatus() == MatchStatus.ONGOING || match.getStatus() == MatchStatus.ABANDONED) {
            return;
        }
        Long p1 = match.getPlayer1Id();
        Long p2 = match.getPlayer2Id();
        GameType gameType = match.getGameType();
        int r1 = getRating(p1, gameType);
        int r2 = getRating(p2, gameType);

        double score1;
        double score2;
        if (match.getStatus() == MatchStatus.DRAW) {
            score1 = 0.5;
            score2 = 0.5;
        } else if (match.getStatus() == MatchStatus.PLAYER1_WON) {
            score1 = 1.0;
            score2 = 0.0;
        } else {
            score1 = 0.0;
            score2 = 1.0;
        }

        double e1 = expectedScore(r1, r2);
        double e2 = expectedScore(r2, r1);
        int delta1 = (int) Math.round(K_FACTOR * (score1 - e1));
        int delta2 = (int) Math.round(K_FACTOR * (score2 - e2));

        updateRating(p1, gameType, r1, delta1, match.getStatus() == MatchStatus.PLAYER1_WON,
                match.getStatus() == MatchStatus.PLAYER2_WON, match.getStatus() == MatchStatus.DRAW);
        updateRating(p2, gameType, r2, delta2, match.getStatus() == MatchStatus.PLAYER2_WON,
                match.getStatus() == MatchStatus.PLAYER1_WON, match.getStatus() == MatchStatus.DRAW);
    }

    private static double expectedScore(int ratingA, int ratingB) {
        return 1.0 / (1.0 + Math.pow(10, (ratingB - ratingA) / 400.0));
    }

    private void updateRating(Long userId, GameType gameType, int currentRating, int delta,
                             boolean win, boolean loss, boolean draw) {
        Rating rating = ratingRepository.findByUserIdAndGameType(userId, gameType)
                .orElseGet(() -> {
                    Rating r = new Rating();
                    r.setUserId(userId);
                    r.setGameType(gameType);
                    r.setRating(DEFAULT_RATING);
                    r.setGamesPlayed(0);
                    r.setWins(0);
                    r.setLosses(0);
                    r.setDraws(0);
                    return r;
                });
        rating.setRating(rating.getRating() + delta);
        rating.setGamesPlayed(rating.getGamesPlayed() + 1);
        if (win) rating.setWins(rating.getWins() + 1);
        else if (loss) rating.setLosses(rating.getLosses() + 1);
        else if (draw) rating.setDraws(rating.getDraws() + 1);
        ratingRepository.save(rating);
    }
}
