package com.indichess.match.service;

import com.indichess.match.dto.MatchResponse;
import com.indichess.match.model.GameType;
import com.indichess.match.model.Match;
import com.indichess.match.model.MatchStatus;
import com.indichess.match.repo.MatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatchService {
    
    private final MatchRepository matchRepository;
    
    @Transactional
    public Match createMatch(Long player1Id, Long player2Id, GameType gameType) {
        Match match = new Match();
        match.setPlayer1Id(player1Id);
        match.setPlayer2Id(player2Id);
        match.setGameType(gameType);
        match.setStatus(MatchStatus.ONGOING);
        match.setFenCurrent("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");
        match.setCurrentPly(0);
        
        return matchRepository.save(match);
    }
    
    public Match findById(Long matchId) {
        return matchRepository.findById(matchId)
                .orElseThrow(() -> new RuntimeException("Match not found"));
    }
    
    public List<MatchResponse> getUserMatches(Long userId) {
        List<Match> matches = matchRepository.findByPlayer1IdOrPlayer2Id(userId, userId);
        return matches.stream()
                .map(this::toMatchResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public void updateMatchStatus(Long matchId, MatchStatus status) {
        Match match = findById(matchId);
        match.setStatus(status);
        if (status != MatchStatus.ONGOING) {
            match.setFinishedAt(LocalDateTime.now());
        }
        matchRepository.save(match);
    }
    
    public MatchResponse toMatchResponse(Match match) {
        MatchResponse response = new MatchResponse();
        response.setId(match.getId());
        response.setPlayer1Id(match.getPlayer1Id());
        response.setPlayer2Id(match.getPlayer2Id());
        response.setStatus(match.getStatus());
        response.setCurrentPly(match.getCurrentPly());
        response.setFenCurrent(match.getFenCurrent());
        response.setLastMoveUci(match.getLastMoveUci());
        response.setGameType(match.getGameType());
        response.setStartedAt(match.getStartedAt());
        response.setFinishedAt(match.getFinishedAt());
        response.setCreatedAt(match.getCreatedAt());
        response.setDrawOfferedByPlayerId(match.getDrawOfferedByPlayerId());
        return response;
    }
}
