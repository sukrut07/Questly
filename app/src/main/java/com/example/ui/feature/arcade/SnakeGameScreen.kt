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
import com.example.ui.components.QuestlyCard
import com.example.ui.theme.DarkBackground
import com.example.ui.theme.DarkBorder
import com.example.ui.theme.DarkCardSurface
import com.example.ui.theme.DarkElevatedSurface
import com.example.ui.theme.ErrorRed
import com.example.ui.theme.GoldAchievement
import com.example.ui.theme.PrimaryViolet
import com.example.ui.theme.SecondaryBlue
import com.example.ui.theme.SuccessGreen
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary
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
    var isGameOver by remember { mutableStateOf(false) }
    var isPlaying by remember { mutableStateOf(false) }
    var score by remember { mutableIntStateOf(0) }
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

    // Game loop
    LaunchedEffect(isPlaying, isGameOver) {
        if (isPlaying && !isGameOver) {
            while (isPlaying && !isGameOver) {
                delay(180) // Game speed
                currentDirection = nextDirection
                val head = snake.first()
                val newHead = when (currentDirection) {
                    Direction.UP -> GridPoint(head.x, (head.y - 1 + gridSize) % gridSize)
                    Direction.DOWN -> GridPoint(head.x, (head.y + 1) % gridSize)
                    Direction.LEFT -> GridPoint((head.x - 1 + gridSize) % gridSize, head.y)
                    Direction.RIGHT -> GridPoint((head.x + 1) % gridSize, head.y)
                }

                // Self collision check
                if (snake.dropLast(1).contains(newHead)) {
                    isGameOver = true
                    isPlaying = false
                    val durationSec = ((System.currentTimeMillis() - startTime) / 1000).toInt()
                    viewModel.recordGameScore(GameType.SNAKE, score, snake.size, durationSec)
                } else {
                    snake.add(0, newHead)
                    if (newHead == food) {
                        score += 10
                        spawnFood()
                    } else {
                        snake.removeAt(snake.lastIndex)
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
                text = "Cyber Snake",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(8.dp))
                    .background(PrimaryViolet.copy(alpha = 0.2f))
                    .padding(horizontal = 10.dp, vertical = 4.dp)
            ) {
                Text(
                    text = "Score: $score",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = PrimaryViolet
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Game Board Canvas
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(1f)
                .clip(RoundedCornerShape(16.dp))
                .background(DarkCardSurface)
                .border(2.dp, if (isGameOver) ErrorRed else PrimaryViolet.copy(alpha = 0.4f), RoundedCornerShape(16.dp))
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
                    color = GoldAchievement,
                    topLeft = foodOffset,
                    size = Size(cellSize * 0.7f, cellSize * 0.7f),
                    cornerRadius = CornerRadius(cellSize * 0.2f, cellSize * 0.2f)
                )

                // Draw Snake
                snake.forEachIndexed { index, segment ->
                    val segOffset = Offset(segment.x * cellSize + cellSize * 0.08f, segment.y * cellSize + cellSize * 0.08f)
                    val color = if (index == 0) SuccessGreen else PrimaryViolet
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
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryViolet),
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
                        .background(DarkBackground.copy(alpha = 0.9f))
                        .padding(24.dp)
                ) {
                    Text(
                        text = "Game Over",
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold,
                        color = ErrorRed
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Final Score: $score",
                        fontSize = 15.sp,
                        color = TextPrimary
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(
                        onClick = { restartGame() },
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryViolet),
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
                    .background(DarkElevatedSurface)
            ) {
                Icon(Icons.Default.KeyboardArrowUp, contentDescription = "Up", tint = TextPrimary)
            }

            Row(horizontalArrangement = Arrangement.spacedBy(36.dp)) {
                IconButton(
                    onClick = { if (currentDirection != Direction.RIGHT) nextDirection = Direction.LEFT },
                    modifier = Modifier
                        .size(48.dp)
                        .clip(CircleShape)
                        .background(DarkElevatedSurface)
                ) {
                    Icon(Icons.Default.KeyboardArrowLeft, contentDescription = "Left", tint = TextPrimary)
                }
                IconButton(
                    onClick = { if (currentDirection != Direction.LEFT) nextDirection = Direction.RIGHT },
                    modifier = Modifier
                        .size(48.dp)
                        .clip(CircleShape)
                        .background(DarkElevatedSurface)
                ) {
                    Icon(Icons.Default.KeyboardArrowRight, contentDescription = "Right", tint = TextPrimary)
                }
            }

            IconButton(
                onClick = { if (currentDirection != Direction.UP) nextDirection = Direction.DOWN },
                modifier = Modifier
                    .size(48.dp)
                    .clip(CircleShape)
                    .background(DarkElevatedSurface)
            ) {
                Icon(Icons.Default.KeyboardArrowDown, contentDescription = "Down", tint = TextPrimary)
            }
        }
    }
}
