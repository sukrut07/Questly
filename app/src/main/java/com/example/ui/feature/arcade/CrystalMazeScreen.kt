package com.example.ui.feature.arcade

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowLeft
import androidx.compose.material.icons.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Stars
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.core.model.GameType
import com.example.ui.MainViewModel
import com.example.ui.theme.QuestlyThemeTokens
import kotlinx.coroutines.delay

data class MazePos(val x: Int, val y: Int)
data class MazeChaser(
    var x: Int,
    var y: Int,
    var dir: Direction,
    val color: Color,
    val name: String,
    var isBanished: Boolean = false
)

@Composable
fun CrystalMazeScreen(
    viewModel: MainViewModel,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = QuestlyThemeTokens.colors
    val personalBest by viewModel.mazeHighScore.collectAsState()

    // 11 x 11 Maze Layout (1 = Wall, 0 = Open Path)
    val mazeLayout = remember {
        listOf(
            listOf(1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1),
            listOf(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
            listOf(1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1),
            listOf(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1),
            listOf(1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1),
            listOf(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1),
            listOf(1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1),
            listOf(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1),
            listOf(1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1),
            listOf(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1),
            listOf(1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1)
        )
    }

    val rows = mazeLayout.size
    val cols = mazeLayout[0].size

    // 4 Super Crystal (Power Pellet) positions in corners
    val superCrystalPositions = remember {
        setOf(MazePos(1, 1), MazePos(9, 1), MazePos(1, 9), MazePos(9, 9))
    }

    val regularCrystals = remember { mutableStateListOf<MazePos>() }
    val superCrystals = remember { mutableStateListOf<MazePos>() }

    var playerPos by remember { mutableStateOf(MazePos(5, 5)) }
    var currentDir by remember { mutableStateOf(Direction.RIGHT) }
    var nextDir by remember { mutableStateOf(Direction.RIGHT) }

    val chasers = remember {
        mutableStateListOf(
            MazeChaser(1, 1, Direction.RIGHT, Color(0xFFFF6B7D), "Shadow"),
            MazeChaser(9, 1, Direction.DOWN, Color(0xFFF5C96A), "Speedy"),
            MazeChaser(1, 9, Direction.UP, Color(0xFF8B7CFF), "Phantom"),
            MazeChaser(9, 9, Direction.LEFT, Color(0xFF67B8FF), "Azure")
        )
    }

    var score by remember { mutableIntStateOf(0) }
    var lives by remember { mutableIntStateOf(3) }
    var level by remember { mutableIntStateOf(1) }
    var crystalsGathered by remember { mutableIntStateOf(0) }
    var chasersBanished by remember { mutableIntStateOf(0) }

    var vulnerableTimer by remember { mutableIntStateOf(0) } // in ticks

    var isPlaying by remember { mutableStateOf(false) }
    var isPaused by remember { mutableStateOf(false) }
    var isGameOver by remember { mutableStateOf(false) }
    var isVictory by remember { mutableStateOf(false) }
    var startTime by remember { mutableStateOf(0L) }
    var elapsedSeconds by remember { mutableIntStateOf(0) }

    fun canMove(x: Int, y: Int): Boolean {
        if (x !in 0 until cols || y !in 0 until rows) return false
        return mazeLayout[y][x] == 0
    }

    fun initMazeForLevel(lvl: Int) {
        regularCrystals.clear()
        superCrystals.clear()

        for (r in 0 until rows) {
            for (c in 0 until cols) {
                if (mazeLayout[r][c] == 0) {
                    val pos = MazePos(c, r)
                    if (superCrystalPositions.contains(pos)) {
                        superCrystals.add(pos)
                    } else if (pos != MazePos(5, 5)) {
                        regularCrystals.add(pos)
                    }
                }
            }
        }

        playerPos = MazePos(5, 5)
        currentDir = Direction.RIGHT
        nextDir = Direction.RIGHT

        chasers.clear()
        chasers.add(MazeChaser(1, 1, Direction.RIGHT, Color(0xFFFF6B7D), "Shadow"))
        chasers.add(MazeChaser(9, 1, Direction.DOWN, Color(0xFFF5C96A), "Speedy"))
        chasers.add(MazeChaser(1, 9, Direction.UP, Color(0xFF8B7CFF), "Phantom"))
        chasers.add(MazeChaser(9, 9, Direction.LEFT, Color(0xFF67B8FF), "Azure"))
        vulnerableTimer = 0
    }

    fun restartGame() {
        score = 0
        lives = 3
        level = 1
        crystalsGathered = 0
        chasersBanished = 0
        isGameOver = false
        isVictory = false
        isPaused = false
        isPlaying = true
        startTime = System.currentTimeMillis()
        elapsedSeconds = 0
        initMazeForLevel(1)
    }

    fun advanceToNextLevel() {
        level++
        score += 250 * level
        initMazeForLevel(level)
    }

    // Main Game Loop
    LaunchedEffect(isPlaying, isPaused, isGameOver, isVictory) {
        if (isPlaying && !isPaused && !isGameOver && !isVictory) {
            var chaserTick = 0
            var secondAccumulator = 0
            while (isPlaying && !isPaused && !isGameOver && !isVictory) {
                val tickDelay = (210 - (level * 10)).coerceAtLeast(140).toLong()
                delay(tickDelay)

                secondAccumulator += tickDelay.toInt()
                if (secondAccumulator >= 1000) {
                    elapsedSeconds++
                    secondAccumulator = 0
                }

                if (vulnerableTimer > 0) {
                    vulnerableTimer--
                }

                // 1. Move Player in desired (queued) direction or maintain current direction
                val targetNext = when (nextDir) {
                    Direction.UP -> MazePos(playerPos.x, playerPos.y - 1)
                    Direction.DOWN -> MazePos(playerPos.x, playerPos.y + 1)
                    Direction.LEFT -> MazePos(playerPos.x - 1, playerPos.y)
                    Direction.RIGHT -> MazePos(playerPos.x + 1, playerPos.y)
                }

                if (canMove(targetNext.x, targetNext.y)) {
                    currentDir = nextDir
                    playerPos = targetNext
                } else {
                    val targetCurrent = when (currentDir) {
                        Direction.UP -> MazePos(playerPos.x, playerPos.y - 1)
                        Direction.DOWN -> MazePos(playerPos.x, playerPos.y + 1)
                        Direction.LEFT -> MazePos(playerPos.x - 1, playerPos.y)
                        Direction.RIGHT -> MazePos(playerPos.x + 1, playerPos.y)
                    }
                    if (canMove(targetCurrent.x, targetCurrent.y)) {
                        playerPos = targetCurrent
                    }
                }

                // 2. Collect Regular Crystals
                if (regularCrystals.contains(playerPos)) {
                    regularCrystals.remove(playerPos)
                    score += 10
                    crystalsGathered++
                }

                // 3. Collect Super Crystals (Power Energizer)
                if (superCrystals.contains(playerPos)) {
                    superCrystals.remove(playerPos)
                    score += 50
                    crystalsGathered++
                    vulnerableTimer = 35 // ~7-8 seconds of vulnerable state
                }

                // Check Level Cleared (All crystals collected)
                if (regularCrystals.isEmpty() && superCrystals.isEmpty()) {
                    advanceToNextLevel()
                }

                // 4. Move Chasers
                chaserTick++
                // Chasers move every 1 or 2 ticks (slower when vulnerable)
                val chaserFrequency = if (vulnerableTimer > 0) 3 else 2
                if (chaserTick % chaserFrequency == 0) {
                    chasers.forEach { chaser ->
                        val possibleDirs = mutableListOf<Direction>()
                        listOf(Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT).forEach { d ->
                            val nx = when (d) {
                                Direction.LEFT -> chaser.x - 1
                                Direction.RIGHT -> chaser.x + 1
                                else -> chaser.x
                            }
                            val ny = when (d) {
                                Direction.UP -> chaser.y - 1
                                Direction.DOWN -> chaser.y + 1
                                else -> chaser.y
                            }
                            if (canMove(nx, ny)) {
                                possibleDirs.add(d)
                            }
                        }

                        // Pathfinding: If vulnerable, flee player. Otherwise, chase player!
                        val isVulnerable = vulnerableTimer > 0
                        val chosenDir = if (isVulnerable) {
                            // Maximize distance to player
                            possibleDirs.maxByOrNull { d ->
                                val nx = when (d) {
                                    Direction.LEFT -> chaser.x - 1
                                    Direction.RIGHT -> chaser.x + 1
                                    else -> chaser.x
                                }
                                val ny = when (d) {
                                    Direction.UP -> chaser.y - 1
                                    Direction.DOWN -> chaser.y + 1
                                    else -> chaser.y
                                }
                                kotlin.math.abs(nx - playerPos.x) + kotlin.math.abs(ny - playerPos.y)
                            } ?: chaser.dir
                        } else {
                            // Minimize distance to player
                            possibleDirs.minByOrNull { d ->
                                val nx = when (d) {
                                    Direction.LEFT -> chaser.x - 1
                                    Direction.RIGHT -> chaser.x + 1
                                    else -> chaser.x
                                }
                                val ny = when (d) {
                                    Direction.UP -> chaser.y - 1
                                    Direction.DOWN -> chaser.y + 1
                                    else -> chaser.y
                                }
                                kotlin.math.abs(nx - playerPos.x) + kotlin.math.abs(ny - playerPos.y)
                            } ?: chaser.dir
                        }

                        chaser.dir = chosenDir
                        when (chosenDir) {
                            Direction.UP -> chaser.y -= 1
                            Direction.DOWN -> chaser.y += 1
                            Direction.LEFT -> chaser.x -= 1
                            Direction.RIGHT -> chaser.x += 1
                        }

                        // Check Collision with Player
                        if (chaser.x == playerPos.x && chaser.y == playerPos.y) {
                            if (vulnerableTimer > 0) {
                                // Player banishes chaser!
                                score += 150
                                chasersBanished++
                                // Send chaser back to corner
                                chaser.x = 1
                                chaser.y = 1
                            } else {
                                // Player loses life
                                lives--
                                if (lives <= 0) {
                                    isGameOver = true
                                    isPlaying = false
                                    val durationSec = ((System.currentTimeMillis() - startTime) / 1000).toInt()
                                    viewModel.recordGameScore(GameType.CRYSTAL_MAZE, score, level, durationSec)
                                } else {
                                    playerPos = MazePos(5, 5)
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(colors.background)
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBack) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                    contentDescription = "Back",
                    tint = colors.primaryText
                )
            }

            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = "Crystal Maze",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = colors.primaryText
                )
                Text(
                    text = "LEVEL $level • BEST: $personalBest",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = colors.gold,
                    letterSpacing = 1.sp
                )
            }

            Row(verticalAlignment = Alignment.CenterVertically) {
                if (isPlaying && !isGameOver && !isVictory) {
                    IconButton(onClick = { isPaused = !isPaused }) {
                        Icon(
                            imageVector = if (isPaused) Icons.Default.PlayArrow else Icons.Default.Pause,
                            contentDescription = if (isPaused) "Resume" else "Pause",
                            tint = colors.primaryAccent
                        )
                    }
                }

                Icon(
                    imageVector = Icons.Default.Favorite,
                    contentDescription = "Lives",
                    tint = colors.error,
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(3.dp))
                Text(
                    text = "$lives",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = colors.error
                )
                Spacer(modifier = Modifier.width(10.dp))
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(colors.gold.copy(alpha = 0.2f))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = "$score pts",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = colors.gold
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(6.dp))

        // Maze Canvas Playfield
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(1f)
                .clip(RoundedCornerShape(20.dp))
                .background(Color(0xFF070914))
                .border(
                    2.dp,
                    if (vulnerableTimer > 0) Color(0xFF67B8FF) else colors.primaryAccent.copy(alpha = 0.4f),
                    RoundedCornerShape(20.dp)
                )
                .pointerInput(Unit) {
                    detectDragGestures { _, dragAmount ->
                        if (isPlaying && !isPaused && !isGameOver && !isVictory) {
                            if (kotlin.math.abs(dragAmount.x) > kotlin.math.abs(dragAmount.y)) {
                                nextDir = if (dragAmount.x > 0) Direction.RIGHT else Direction.LEFT
                            } else {
                                nextDir = if (dragAmount.y > 0) Direction.DOWN else Direction.UP
                            }
                        }
                    }
                }
                .testTag("crystal_maze_canvas"),
            contentAlignment = Alignment.Center
        ) {
            Canvas(modifier = Modifier.fillMaxSize()) {
                val cellW = size.width / cols
                val cellH = size.height / rows

                // 1. Draw Neon Labyrinth Walls
                for (r in 0 until rows) {
                    for (c in 0 until cols) {
                        if (mazeLayout[r][c] == 1) {
                            drawRoundRect(
                                color = Color(0xFF14192B),
                                topLeft = Offset(c * cellW, r * cellH),
                                size = Size(cellW, cellH),
                                cornerRadius = CornerRadius(5f, 5f)
                            )
                            drawRoundRect(
                                color = Color(0xFF283457),
                                topLeft = Offset(c * cellW + 1.5f, r * cellH + 1.5f),
                                size = Size(cellW - 3f, cellH - 3f),
                                cornerRadius = CornerRadius(4f, 4f)
                            )
                        }
                    }
                }

                // 2. Draw Regular Crystals
                regularCrystals.forEach { crystal ->
                    drawCircle(
                        color = Color(0xFFF5C96A),
                        radius = cellW * 0.16f,
                        center = Offset((crystal.x + 0.5f) * cellW, (crystal.y + 0.5f) * cellH)
                    )
                }

                // 3. Draw Super Crystals (Power Energizers with glowing aura)
                superCrystals.forEach { sc ->
                    val cx = (sc.x + 0.5f) * cellW
                    val cy = (sc.y + 0.5f) * cellH
                    drawCircle(
                        color = Color(0xFF8B7CFF).copy(alpha = 0.4f),
                        radius = cellW * 0.35f,
                        center = Offset(cx, cy)
                    )
                    drawCircle(
                        color = Color(0xFF8B7CFF),
                        radius = cellW * 0.22f,
                        center = Offset(cx, cy)
                    )
                    drawCircle(
                        color = Color.White,
                        radius = cellW * 0.10f,
                        center = Offset(cx, cy)
                    )
                }

                // 4. Draw Player (Luminous Energy Orb with direction indicator)
                val px = (playerPos.x + 0.5f) * cellW
                val py = (playerPos.y + 0.5f) * cellH

                drawCircle(
                    color = Color(0xFF67B8FF).copy(alpha = 0.35f),
                    radius = cellW * 0.44f,
                    center = Offset(px, py)
                )
                drawCircle(
                    color = Color(0xFF67B8FF),
                    radius = cellW * 0.34f,
                    center = Offset(px, py)
                )
                drawCircle(
                    color = Color.White,
                    radius = cellW * 0.16f,
                    center = Offset(px, py)
                )

                // 5. Draw Chasers (Specters)
                chasers.forEach { chaser ->
                    val cx = (chaser.x + 0.5f) * cellW
                    val cy = (chaser.y + 0.5f) * cellH
                    val isVulnerable = vulnerableTimer > 0

                    val specterColor = if (isVulnerable) Color(0xFF45A0E6) else chaser.color

                    drawCircle(
                        color = specterColor,
                        radius = cellW * 0.36f,
                        center = Offset(cx, cy)
                    )
                    // Specter Eye pointing in direction
                    val eyeDx = when (chaser.dir) {
                        Direction.LEFT -> -cellW * 0.08f
                        Direction.RIGHT -> cellW * 0.08f
                        else -> 0f
                    }
                    val eyeDy = when (chaser.dir) {
                        Direction.UP -> -cellH * 0.08f
                        Direction.DOWN -> cellH * 0.08f
                        else -> 0f
                    }
                    drawCircle(
                        color = if (isVulnerable) Color(0xFF10284A) else Color.White,
                        radius = cellW * 0.12f,
                        center = Offset(cx + eyeDx, cy + eyeDy - 2f)
                    )
                }
            }

            // Start Overlay
            if (!isPlaying && !isGameOver && !isVictory) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier
                        .clip(RoundedCornerShape(18.dp))
                        .background(Color(0xFF0B0D14).copy(alpha = 0.90f))
                        .padding(24.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Stars,
                        contentDescription = "Maze",
                        tint = colors.gold,
                        modifier = Modifier.size(36.dp)
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "CRYSTAL MAZE",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = colors.primaryText,
                        letterSpacing = 1.sp
                    )
                    Text(
                        text = "Collect all crystals • Power crystals banish chasers",
                        fontSize = 12.sp,
                        color = colors.secondaryText,
                        modifier = Modifier.padding(top = 4.dp, bottom = 16.dp)
                    )
                    Button(
                        onClick = { restartGame() },
                        colors = ButtonDefaults.buttonColors(containerColor = colors.primaryAccent),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.testTag("maze_start_button")
                    ) {
                        Icon(imageVector = Icons.Default.PlayArrow, contentDescription = "Play")
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Enter Labyrinth", fontWeight = FontWeight.Bold)
                    }
                }
            }

            // Pause Overlay
            if (isPaused && !isGameOver) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier
                        .clip(RoundedCornerShape(18.dp))
                        .background(Color(0xFF0B0D14).copy(alpha = 0.90f))
                        .padding(24.dp)
                ) {
                    Text(
                        text = "LABYRINTH PAUSED",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = colors.primaryText,
                        letterSpacing = 1.sp
                    )
                    Spacer(modifier = Modifier.height(14.dp))
                    Button(
                        onClick = { isPaused = false },
                        colors = ButtonDefaults.buttonColors(containerColor = colors.primaryAccent),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Text("Resume Labyrinth", fontWeight = FontWeight.Bold)
                    }
                }
            }

            // Game Over Modal with Full Performance Stats
            if (isGameOver) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier
                        .clip(RoundedCornerShape(18.dp))
                        .background(Color(0xFF0B0D14).copy(alpha = 0.95f))
                        .border(1.dp, colors.border, RoundedCornerShape(18.dp))
                        .padding(24.dp)
                ) {
                    Text(
                        text = "TRAPPED IN THE MAZE",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = colors.error,
                        letterSpacing = 1.sp
                    )
                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(0.85f),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text("Final Score", fontSize = 11.sp, color = colors.mutedText)
                            Text("$score", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = colors.primaryText)
                        }
                        Column {
                            Text("Level Reached", fontSize = 11.sp, color = colors.mutedText)
                            Text("Level $level", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = colors.gold)
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(0.85f),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text("Crystals Gathered", fontSize = 11.sp, color = colors.mutedText)
                            Text("$crystalsGathered", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = colors.secondaryAccent)
                        }
                        Column {
                            Text("Chasers Banished", fontSize = 11.sp, color = colors.mutedText)
                            Text("$chasersBanished", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = colors.primaryAccent)
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        Button(
                            onClick = { restartGame() },
                            colors = ButtonDefaults.buttonColors(containerColor = colors.primaryAccent),
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Icon(imageVector = Icons.Default.Refresh, contentDescription = "Retry", modifier = Modifier.size(16.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Retry Maze", fontWeight = FontWeight.Bold)
                        }
                        OutlinedButton(
                            onClick = onBack,
                            shape = RoundedCornerShape(10.dp)
                        ) {
                            Text("Exit Arcade", color = colors.secondaryText)
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // D-Pad Directional Controls
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            IconButton(
                onClick = { nextDir = Direction.UP },
                modifier = Modifier
                    .size(42.dp)
                    .clip(CircleShape)
                    .background(colors.elevatedSurface)
            ) {
                Icon(
                    Icons.Default.KeyboardArrowUp,
                    contentDescription = "Move Up",
                    tint = colors.primaryText
                )
            }
            Row(horizontalArrangement = Arrangement.spacedBy(28.dp)) {
                IconButton(
                    onClick = { nextDir = Direction.LEFT },
                    modifier = Modifier
                        .size(42.dp)
                        .clip(CircleShape)
                        .background(colors.elevatedSurface)
                ) {
                    Icon(
                        Icons.Default.KeyboardArrowLeft,
                        contentDescription = "Move Left",
                        tint = colors.primaryText
                    )
                }
                IconButton(
                    onClick = { nextDir = Direction.RIGHT },
                    modifier = Modifier
                        .size(42.dp)
                        .clip(CircleShape)
                        .background(colors.elevatedSurface)
                ) {
                    Icon(
                        Icons.Default.KeyboardArrowRight,
                        contentDescription = "Move Right",
                        tint = colors.primaryText
                    )
                }
            }
            IconButton(
                onClick = { nextDir = Direction.DOWN },
                modifier = Modifier
                    .size(42.dp)
                    .clip(CircleShape)
                    .background(colors.elevatedSurface)
            ) {
                Icon(
                    Icons.Default.KeyboardArrowDown,
                    contentDescription = "Move Down",
                    tint = colors.primaryText
                )
            }
        }
    }
}
