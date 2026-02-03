package com.indichess.match.service;

import com.indichess.match.model.GameType;
import com.indichess.match.model.Rating;
import com.indichess.match.repo.RatingRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RatingServiceTest {

    @Mock
    private RatingRepository ratingRepository;

    @InjectMocks
    private RatingService ratingService;

    @BeforeEach
    void setUp() {
    }

    @Test
    void getRating_returnsStoredRating() {
        Long userId = 1L;
        GameType gameType = GameType.RAPID;
        Rating rating = new Rating();
        rating.setUserId(userId);
        rating.setGameType(gameType);
        rating.setRating(1500);
        when(ratingRepository.findByUserIdAndGameType(userId, gameType)).thenReturn(Optional.of(rating));

        int result = ratingService.getRating(userId, gameType);

        assertThat(result).isEqualTo(1500);
    }

    @Test
    void getRating_returnsDefaultWhenNotFound() {
        Long userId = 1L;
        GameType gameType = GameType.BLITZ;
        when(ratingRepository.findByUserIdAndGameType(userId, gameType)).thenReturn(Optional.empty());

        int result = ratingService.getRating(userId, gameType);

        assertThat(result).isEqualTo(1200);
    }

    @Test
    void getRatingsForUser_returnsListFromRepository() {
        Long userId = 1L;
        Rating r1 = new Rating();
        r1.setGameType(GameType.RAPID);
        r1.setRating(1400);
        Rating r2 = new Rating();
        r2.setGameType(GameType.BLITZ);
        r2.setRating(1300);
        when(ratingRepository.findAllByUserIdOrderByGameType(userId)).thenReturn(List.of(r1, r2));

        var result = ratingService.getRatingsForUser(userId);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getGameType()).isEqualTo(GameType.RAPID);
        assertThat(result.get(0).getRating()).isEqualTo(1400);
        assertThat(result.get(1).getGameType()).isEqualTo(GameType.BLITZ);
        assertThat(result.get(1).getRating()).isEqualTo(1300);
    }
}
