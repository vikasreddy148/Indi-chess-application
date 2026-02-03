package com.indichess.match.config;

import com.indichess.match.model.GameType;

import java.util.Map;

public final class TimeControlConfig {

    private static final Map<GameType, int[]> TIME_CONTROLS = Map.of(
            GameType.CLASSICAL, new int[]{1800, 0},   // 30+0
            GameType.RAPID, new int[]{600, 0},         // 10+0
            GameType.BLITZ, new int[]{180, 2},        // 3+2
            GameType.BULLET, new int[]{60, 1}         // 1+1
    );

    public static int getInitialSeconds(GameType gameType) {
        int[] tc = TIME_CONTROLS.get(gameType);
        return tc != null ? tc[0] : 600;
    }

    public static int getIncrementSeconds(GameType gameType) {
        int[] tc = TIME_CONTROLS.get(gameType);
        return tc != null ? tc[1] : 0;
    }
}
