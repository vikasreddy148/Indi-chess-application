package com.indichess.match.service;

import com.indichess.match.dto.MatchResponse;
import com.indichess.match.model.GameType;
import com.indichess.match.model.Match;
import com.indichess.match.model.MatchQueue;
import com.indichess.match.model.MatchStatus;
import com.indichess.match.repo.MatchQueueRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class MatchQueueService {

    private static final int RATING_TOLERANCE = 200;

    private final MatchQueueRepository matchQueueRepository;
    private final MatchService matchService;
    private final RatingService ratingService;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public Optional<Match> joinQueue(Long userId, GameType gameType) {
        Optional<MatchQueue> existing = matchQueueRepository.findByUserId(userId);
        if (existing.isPresent()) {
            MatchQueue eq = existing.get();
            if (eq.getGameType() == gameType) {
                return Optional.empty(); // already in queue for this game type
            }
            matchQueueRepository.delete(eq);
        }
        int rating = ratingService.getRating(userId, gameType);
        MatchQueue entry = new MatchQueue();
        entry.setUserId(userId);
        entry.setGameType(gameType);
        entry.setRating(rating);
        matchQueueRepository.save(entry);
        log.debug("User {} joined queue for {}", userId, gameType);
        return tryMatch(gameType);
    }

    @Transactional
    public void leaveQueue(Long userId) {
        matchQueueRepository.findByUserId(userId).ifPresent(matchQueueRepository::delete);
        log.debug("User {} left queue", userId);
    }

    @Transactional
    public Optional<Match> tryMatch(GameType gameType) {
        List<MatchQueue> entries = matchQueueRepository.findByGameTypeOrderByJoinedAtAsc(gameType);
        if (entries.size() < 2) return Optional.empty();

        entries.sort(Comparator.comparingInt(MatchQueue::getRating));
        for (int i = 0; i < entries.size(); i++) {
            for (int j = i + 1; j < entries.size(); j++) {
                MatchQueue a = entries.get(i);
                MatchQueue b = entries.get(j);
                if (Math.abs(a.getRating() - b.getRating()) <= RATING_TOLERANCE) {
                    matchQueueRepository.delete(a);
                    matchQueueRepository.delete(b);
                    Match match = matchService.createMatch(a.getUserId(), b.getUserId(), gameType);
                    log.info("Matched users {} and {} for {}", a.getUserId(), b.getUserId(), gameType);
                    MatchResponse response = matchService.toMatchResponse(match);
                    messagingTemplate.convertAndSend("/topic/matchmaking/" + a.getUserId(), response);
                    messagingTemplate.convertAndSend("/topic/matchmaking/" + b.getUserId(), response);
                    return Optional.of(match);
                }
            }
        }
        return Optional.empty();
    }
}
