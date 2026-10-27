package com.example.core.model

enum class GameType(val displayName: String, val shortDesc: String, val iconName: String) {
    QUEST_DEFENDER("Quest Defender", "Galaga-style space shooter defending the galaxy", "rocket_launch"),
    CRYSTAL_MAZE("Crystal Maze", "Arcane maze chase collecting luminous crystals", "grid_view"),
    SNAKE("Cyber Snake", "Retro arcade snake with speed boosts and crystal fruit", "sports_esports"),
    MEMORY_MATCH("Rune Memory", "Arcane memory flip game with time & move tracking", "dashboard_customize")
}

data class GameRecord(
    val id: Long = 0,
    val gameType: GameType,
    val score: Int,
    val moves: Int = 0,
    val durationSeconds: Int = 0,
    val playedAt: Long = System.currentTimeMillis()
)
