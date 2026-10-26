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
import kotlin.random.Random

enum class Direction { UP, DOWN, LEFT, RIGHT }
data class GridPoint(val x: Int, val y: Int)

@Composable
fun SnakeGameScreen(
    viewModel: MainViewModel,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = QuestlyThemeTokens.colors
    val highScore by viewModel.snakeHighScore.collectAsState()

    val gridSize = 16
    val snake = remember {
        mutableStateListOf(
            GridPoint(8, 8),
            GridPoint(8, 9),
            GridPoint(8, 10)
        )
    }
    var food by remember { mutableStateOf(GridPoint(5, 5)) }
    var currentDirection by remember { mutableStateOf(Direction.UP) }
    var nextDirection by remember { mutableStateOf(Direction.UP) }
    var score by remember { mutableIntStateOf(0) }
    var isPlaying by remember { mutableStateOf(false) }
    var isGameOver by remember { mutableStateOf(false) }
    var startTime by remember { mutableStateOf(0L) }

    fun spawnFood() {
        var newFood: GridPoint
        do {
            newFood = GridPoint(Random.nextInt(gridSize), Random.nextInt(gridSize))
        } while (snake.contains(newFood))
        food = newFood
    }

    fun restartGame() {
        snake.clear()
        snake.addAll(listOf(GridPoint(8, 8), GridPoint(8, 9), GridPoint(8, 10)))
        currentDirection = Direction.UP
        nextDirection = Direction.UP
        score = 0
        isGameOver = false
        isPlaying = true
        startTime = System.currentTimeMillis()
        spawnFood()
    }

    LaunchedEffect(isPlaying, isGameOver) {
        if (isPlaying && !isGameOver) {
            while (isPlaying && !isGameOver) {
                delay(150)
                currentDirection = nextDirection

                val head = snake.first()
                val newHead = when (currentDirection) {
                    Direction.UP -> GridPoint(head.x, head.y - 1)
                    Direction.DOWN -> GridPoint(head.x, head.y + 1)
                    Direction.LEFT -> GridPoint(head.x - 1, head.y)
                    Direction.RIGHT -> GridPoint(head.x + 1, head.y)
                }

                // Wall collision
                if (newHead.x !in 0 until gridSize || newHead.y !in 0 until gridSize) {
                    isGameOver = true
                    isPlaying = false
                    val durationSec = ((System.currentTimeMillis() - startTime) / 1000).toInt()
                    viewModel.recordGameScore(GameType.SNAKE, score, snake.size, durationSec)
                    break
                }

                // Self collision
                if (snake.contains(newHead)) {
                    isGameOver = true
                    isPlaying = false
                    val durationSec = ((System.currentTimeMillis() - startTime) / 1000).toInt()
                    viewModel.recordGameScore(GameType.SNAKE, score, snake.size, durationSec)
                    break
                }

                snake.add(0, newHead)

                // Check food
                if (newHead == food) {
                    score += 10
                    spawnFood()
                } else {
                    snake.removeAt(snake.size - 1)
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
        // Top Bar
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
            Text(
                text = "Cyber Snake",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = colors.primaryText
            )
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .background(colors.gold.copy(alpha = 0.15f))
                    .padding(horizontal = 10.dp, vertical = 4.dp)
            ) {
                Text(
                    text = "Score: $score (Best: $highScore)",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = colors.gold
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Game Board
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(1f)
                .clip(RoundedCornerShape(16.dp))
                .background(Color(0xFF070914))
                .border(2.dp, colors.primaryAccent.copy(alpha = 0.4f), RoundedCornerShape(16.dp))
                .pointerInput(Unit) {
                    detectDragGestures { _, dragAmount ->
                        if (isPlaying && !isGameOver) {
                            if (kotlin.math.abs(dragAmount.x) > kotlin.math.abs(dragAmount.y)) {
                                if (dragAmount.x > 0 && currentDirection != Direction.LEFT) {
                                    nextDirection = Direction.RIGHT
                                } else if (dragAmount.x < 0 && currentDirection != Direction.RIGHT) {
                                    nextDirection = Direction.LEFT
                                }
                            } else {
                                if (dragAmount.y > 0 && currentDirection != Direction.UP) {
                                    nextDirection = Direction.DOWN
                                } else if (dragAmount.y < 0 && currentDirection != Direction.DOWN) {
                                    nextDirection = Direction.UP
                                }
                            }
                        }
                    }
                }
                .testTag("snake_canvas_board"),
            contentAlignment = Alignment.Center
        ) {
            Canvas(modifier = Modifier.fillMaxSize()) {
                val cellSize = size.width / gridSize

                // Draw Food
                val foodOffset = Offset(food.x * cellSize + cellSize * 0.15f, food.y * cellSize + cellSize * 0.15f)
                drawRoundRect(
                    color = Color(0xFFF5C96A),
                    topLeft = foodOffset,
                    size = Size(cellSize * 0.7f, cellSize * 0.7f),
                    cornerRadius = CornerRadius(cellSize * 0.2f, cellSize * 0.2f)
                )

                // Draw Snake
                snake.forEachIndexed { index, segment ->
                    val segOffset = Offset(segment.x * cellSize + cellSize * 0.08f, segment.y * cellSize + cellSize * 0.08f)
                    val color = if (index == 0) Color(0xFF69D8A5) else Color(0xFF8B7CFF)
                    drawRoundRect(
                        color = color,
                        topLeft = segOffset,
                        size = Size(cellSize * 0.84f, cellSize * 0.84f),
                        cornerRadius = CornerRadius(cellSize * 0.25f, cellSize * 0.25f)
                    )
                }
            }

            if (!isPlaying && !isGameOver) {
                Button(
                    onClick = { restartGame() },
                    colors = ButtonDefaults.buttonColors(containerColor = colors.primaryAccent),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.testTag("snake_play_button")
                ) {
                    Icon(imageVector = Icons.Default.PlayArrow, contentDescription = "Play")
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Start Game", fontWeight = FontWeight.Bold)
                }
            }

            if (isGameOver) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier
                        .clip(RoundedCornerShape(16.dp))
                        .background(Color(0xFF0B0D14).copy(alpha = 0.92f))
                        .padding(24.dp)
                ) {
                    Text(
                        text = "Game Over",
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold,
                        color = colors.error
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Final Score: $score",
                        fontSize = 15.sp,
                        color = colors.primaryText
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(
                        onClick = { restartGame() },
                        colors = ButtonDefaults.buttonColors(containerColor = colors.primaryAccent),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Icon(imageVector = Icons.Default.Refresh, contentDescription = "Restart")
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Play Again", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // On-screen D-Pad Controls
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.padding(bottom = 8.dp)
        ) {
            IconButton(
                onClick = { if (currentDirection != Direction.DOWN) nextDirection = Direction.UP },
                modifier = Modifier
                    .size(48.dp)
                    .clip(CircleShape)
                    .background(colors.elevatedSurface)
            ) {
                Icon(Icons.Default.KeyboardArrowUp, contentDescription = "Up", tint = colors.primaryText)
            }

            Row(horizontalArrangement = Arrangement.spacedBy(36.dp)) {
                IconButton(
                    onClick = { if (currentDirection != Direction.RIGHT) nextDirection = Direction.LEFT },
                    modifier = Modifier
                        .size(48.dp)
                        .clip(CircleShape)
                        .background(colors.elevatedSurface)
                ) {
                    Icon(Icons.Default.KeyboardArrowLeft, contentDescription = "Left", tint = colors.primaryText)
                }
                IconButton(
                    onClick = { if (currentDirection != Direction.LEFT) nextDirection = Direction.RIGHT },
                    modifier = Modifier
                        .size(48.dp)
                        .clip(CircleShape)
                        .background(colors.elevatedSurface)
                ) {
                    Icon(Icons.Default.KeyboardArrowRight, contentDescription = "Right", tint = colors.primaryText)
                }
            }

            IconButton(
                onClick = { if (currentDirection != Direction.UP) nextDirection = Direction.DOWN },
                modifier = Modifier
                    .size(48.dp)
                    .clip(CircleShape)
                    .background(colors.elevatedSurface)
            ) {
                Icon(Icons.Default.KeyboardArrowDown, contentDescription = "Down", tint = colors.primaryText)
            }
        }
    }
}
