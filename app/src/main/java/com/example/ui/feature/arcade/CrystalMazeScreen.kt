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
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
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
import com.example.ui.theme.DarkBackground
import com.example.ui.theme.DarkElevatedSurface
import com.example.ui.theme.ErrorRed
import com.example.ui.theme.GoldAchievement
import com.example.ui.theme.PrimaryViolet
import com.example.ui.theme.SecondaryBlue
import com.example.ui.theme.SuccessGreen
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary
import kotlinx.coroutines.delay

data class MazePos(val x: Int, val y: Int)
data class MazeChaser(var x: Int, var y: Int, var dir: Direction)

@Composable
fun CrystalMazeScreen(
    viewModel: MainViewModel,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    // 11 x 11 Maze Layout (1 = Wall, 0 = Path with Crystal)
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

    val crystals = remember { mutableStateListOf<MazePos>() }
    var playerPos by remember { mutableStateOf(MazePos(1, 1)) }
    var currentDir by remember { mutableStateOf(Direction.RIGHT) }
    var nextDir by remember { mutableStateOf(Direction.RIGHT) }

    val chasers = remember {
        mutableStateListOf(
            MazeChaser(9, 9, Direction.LEFT),
            MazeChaser(9, 1, Direction.DOWN)
        )
    }

    var score by remember { mutableIntStateOf(0) }
    var lives by remember { mutableIntStateOf(3) }
    var isPlaying by remember { mutableStateOf(false) }
    var isGameOver by remember { mutableStateOf(false) }
    var isVictory by remember { mutableStateOf(false) }
    var startTime by remember { mutableStateOf(0L) }

    fun canMove(x: Int, y: Int): Boolean {
        if (x !in 0 until cols || y !in 0 until rows) return false
        return mazeLayout[y][x] == 0
    }

    fun restartGame() {
        crystals.clear()
        for (r in 0 until rows) {
            for (c in 0 until cols) {
                if (mazeLayout[r][c] == 0) {
                    crystals.add(MazePos(c, r))
                }
            }
        }
        playerPos = MazePos(1, 1)
        crystals.remove(playerPos)
        currentDir = Direction.RIGHT
        nextDir = Direction.RIGHT
        chasers.clear()
        chasers.add(MazeChaser(9, 9, Direction.LEFT))
        chasers.add(MazeChaser(9, 1, Direction.DOWN))
        score = 0
        lives = 3
        isGameOver = false
        isVictory = false
        isPlaying = true
        startTime = System.currentTimeMillis()
    }

    // Game loop
    LaunchedEffect(isPlaying, isGameOver, isVictory) {
        if (isPlaying && !isGameOver && !isVictory) {
            var chaserTick = 0
            while (isPlaying && !isGameOver && !isVictory) {
                delay(220) // Game tick speed

                // 1. Move Player in desired or current direction
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

                // 2. Collect Crystal
                if (crystals.contains(playerPos)) {
                    crystals.remove(playerPos)
                    score += 10
                    if (crystals.isEmpty()) {
                        isVictory = true
                        isPlaying = false
                        val durationSec = ((System.currentTimeMillis() - startTime) / 1000).toInt()
                        viewModel.recordGameScore(GameType.CRYSTAL_MAZE, score + 200, 1, durationSec)
                    }
                }

                // 3. Move Chasers
                chaserTick++
                if (chaserTick % 2 == 0) {
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

                        // Try to head toward player or pick random valid dir
                        val chosenDir = possibleDirs.minByOrNull { d ->
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

                        chaser.dir = chosenDir
                        when (chosenDir) {
                            Direction.UP -> chaser.y -= 1
                            Direction.DOWN -> chaser.y += 1
                            Direction.LEFT -> chaser.x -= 1
                            Direction.RIGHT -> chaser.x += 1
                        }

                        // Collision with player
                        if (chaser.x == playerPos.x && chaser.y == playerPos.y) {
                            lives--
                            if (lives <= 0) {
                                isGameOver = true
                                isPlaying = false
                                val durationSec = ((System.currentTimeMillis() - startTime) / 1000).toInt()
                                viewModel.recordGameScore(GameType.CRYSTAL_MAZE, score, 0, durationSec)
                            } else {
                                playerPos = MazePos(1, 1)
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
            .background(DarkBackground)
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
                    tint = TextPrimary
                )
            }
            Text(
                text = "Crystal Maze",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Default.Favorite,
                    contentDescription = "Lives",
                    tint = ErrorRed,
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = "$lives",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Bold,
                    color = ErrorRed
                )
                Spacer(modifier = Modifier.width(12.dp))
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(GoldAchievement.copy(alpha = 0.2f))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = "Score: $score",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = GoldAchievement
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Maze Canvas
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(1f)
                .clip(RoundedCornerShape(16.dp))
                .background(Color(0xFF090C16))
                .border(2.dp, PrimaryViolet.copy(alpha = 0.4f), RoundedCornerShape(16.dp))
                .pointerInput(Unit) {
                    detectDragGestures { _, dragAmount ->
                        if (isPlaying && !isGameOver && !isVictory) {
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

                // Draw Walls
                for (r in 0 until rows) {
                    for (c in 0 until cols) {
                        if (mazeLayout[r][c] == 1) {
                            drawRoundRect(
                                color = Color(0xFF1E263D),
                                topLeft = Offset(c * cellW, r * cellH),
                                size = Size(cellW, cellH),
                                cornerRadius = CornerRadius(4f, 4f)
                            )
                            // Subtle blue grid outline
                            drawRoundRect(
                                color = SecondaryBlue.copy(alpha = 0.2f),
                                topLeft = Offset(c * cellW + 1f, r * cellH + 1f),
                                size = Size(cellW - 2f, cellH - 2f),
                                cornerRadius = CornerRadius(3f, 3f)
                            )
                        }
                    }
                }

                // Draw Crystals
                crystals.forEach { crystal ->
                    drawCircle(
                        color = GoldAchievement,
                        radius = cellW * 0.16f,
                        center = Offset((crystal.x + 0.5f) * cellW, (crystal.y + 0.5f) * cellH)
                    )
                }

                // Draw Player (Glowing Cyan/Violet Orb)
                drawCircle(
                    color = SecondaryBlue,
                    radius = cellW * 0.38f,
                    center = Offset((playerPos.x + 0.5f) * cellW, (playerPos.y + 0.5f) * cellH)
                )
                drawCircle(
                    color = Color.White,
                    radius = cellW * 0.18f,
                    center = Offset((playerPos.x + 0.5f) * cellW, (playerPos.y + 0.5f) * cellH)
                )

                // Draw Chasers (Red/Violet Specters)
                chasers.forEach { chaser ->
                    drawCircle(
                        color = ErrorRed,
                        radius = cellW * 0.36f,
                        center = Offset((chaser.x + 0.5f) * cellW, (chaser.y + 0.5f) * cellH)
                    )
                    // Specter eye
                    drawCircle(
                        color = Color.White,
                        radius = cellW * 0.12f,
                        center = Offset((chaser.x + 0.5f) * cellW, (chaser.y + 0.45f) * cellH)
                    )
                }
            }

            if (!isPlaying && !isGameOver && !isVictory) {
                Button(
                    onClick = { restartGame() },
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryViolet),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.testTag("maze_start_button")
                ) {
                    Icon(imageVector = Icons.Default.PlayArrow, contentDescription = "Play")
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Enter Maze", fontWeight = FontWeight.Bold)
                }
            }

            if (isGameOver) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier
                        .clip(RoundedCornerShape(16.dp))
                        .background(DarkBackground.copy(alpha = 0.92f))
                        .padding(24.dp)
                ) {
                    Text("Trapped!", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = ErrorRed)
                    Text("Final Score: $score", fontSize = 15.sp, color = TextPrimary, modifier = Modifier.padding(vertical = 4.dp))
                    Spacer(modifier = Modifier.height(12.dp))
                    Button(
                        onClick = { restartGame() },
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryViolet)
                    ) {
                        Icon(imageVector = Icons.Default.Refresh, contentDescription = "Restart")
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Retry Maze")
                    }
                }
            }

            if (isVictory) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier
                        .clip(RoundedCornerShape(16.dp))
                        .background(DarkBackground.copy(alpha = 0.92f))
                        .padding(24.dp)
                ) {
                    Icon(imageVector = Icons.Default.EmojiEvents, contentDescription = "Victory", tint = GoldAchievement, modifier = Modifier.size(36.dp))
                    Text("Maze Cleared!", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = GoldAchievement)
                    Text("All crystals gathered! Score: $score", fontSize = 14.sp, color = TextPrimary, modifier = Modifier.padding(vertical = 4.dp))
                    Spacer(modifier = Modifier.height(12.dp))
                    Button(
                        onClick = { restartGame() },
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryViolet)
                    ) {
                        Text("Play Next Realm")
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(10.dp))

        // D-Pad Controls
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            IconButton(
                onClick = { nextDir = Direction.UP },
                modifier = Modifier.size(44.dp).clip(CircleShape).background(DarkElevatedSurface)
            ) {
                Icon(Icons.Default.KeyboardArrowUp, contentDescription = "Up", tint = TextPrimary)
            }
            Row(horizontalArrangement = Arrangement.spacedBy(32.dp)) {
                IconButton(
                    onClick = { nextDir = Direction.LEFT },
                    modifier = Modifier.size(44.dp).clip(CircleShape).background(DarkElevatedSurface)
                ) {
                    Icon(Icons.Default.KeyboardArrowLeft, contentDescription = "Left", tint = TextPrimary)
                }
                IconButton(
                    onClick = { nextDir = Direction.RIGHT },
                    modifier = Modifier.size(44.dp).clip(CircleShape).background(DarkElevatedSurface)
                ) {
                    Icon(Icons.Default.KeyboardArrowRight, contentDescription = "Right", tint = TextPrimary)
                }
            }
            IconButton(
                onClick = { nextDir = Direction.DOWN },
                modifier = Modifier.size(44.dp).clip(CircleShape).background(DarkElevatedSurface)
            ) {
                Icon(Icons.Default.KeyboardArrowDown, contentDescription = "Down", tint = TextPrimary)
            }
        }
    }
}
