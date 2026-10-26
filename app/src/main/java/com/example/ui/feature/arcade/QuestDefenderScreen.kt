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
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.Favorite
import androidx.compose.material.icons.filled.KeyboardArrowLeft
import androidx.compose.material.icons.filled.KeyboardArrowRight
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
import androidx.compose.runtime.mutableFloatStateOf
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.core.model.GameType
import com.example.ui.MainViewModel
import com.example.ui.theme.DarkBackground
import com.example.ui.theme.DarkBorder
import com.example.ui.theme.DarkCardSurface
import com.example.ui.theme.DarkElevatedSurface
import com.example.ui.theme.ErrorRed
import com.example.ui.theme.GoldAchievement
import com.example.ui.theme.PrimaryViolet
import com.example.ui.theme.SecondaryBlue
import com.example.ui.theme.SuccessGreen
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary
import kotlinx.coroutines.delay
import kotlin.random.Random

data class PlayerLaser(var x: Float, var y: Float)
data class EnemyShip(var x: Float, var y: Float, var vx: Float, val type: Int)
data class EnemyBullet(var x: Float, var y: Float)

@Composable
fun QuestDefenderScreen(
    viewModel: MainViewModel,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    var isPlaying by remember { mutableStateOf(false) }
    var isGameOver by remember { mutableStateOf(false) }
    var score by remember { mutableIntStateOf(0) }
    var lives by remember { mutableIntStateOf(3) }
    var wave by remember { mutableIntStateOf(1) }
    var playerX by remember { mutableFloatStateOf(0.5f) } // normalized 0..1
    var startTime by remember { mutableStateOf(0L) }

    val lasers = remember { mutableStateListOf<PlayerLaser>() }
    val enemies = remember { mutableStateListOf<EnemyShip>() }
    val enemyBullets = remember { mutableStateListOf<EnemyBullet>() }

    fun spawnWave(currentWave: Int) {
        enemies.clear()
        enemyBullets.clear()
        val count = 4 + currentWave * 2
        for (i in 0 until count) {
            val ex = 0.15f + ((i % 5) * 0.17f)
            val ey = 0.12f + ((i / 5) * 0.10f)
            val vx = if (i % 2 == 0) 0.008f else -0.008f
            enemies.add(EnemyShip(ex, ey, vx, i % 3))
        }
    }

    fun restartGame() {
        score = 0
        lives = 3
        wave = 1
        playerX = 0.5f
        lasers.clear()
        enemies.clear()
        enemyBullets.clear()
        isGameOver = false
        isPlaying = true
        startTime = System.currentTimeMillis()
        spawnWave(1)
    }

    // Main Game Loop (60 FPS tick)
    LaunchedEffect(isPlaying, isGameOver) {
        if (isPlaying && !isGameOver) {
            var fireCooldown = 0
            while (isPlaying && !isGameOver) {
                delay(33) // ~30 FPS for solid mobile performance

                // 1. Auto-fire lasers
                fireCooldown++
                if (fireCooldown >= 7) { // every ~230ms
                    lasers.add(PlayerLaser(playerX, 0.85f))
                    fireCooldown = 0
                }

                // 2. Move player lasers
                val iterator = lasers.iterator()
                while (iterator.hasNext()) {
                    val laser = iterator.next()
                    laser.y -= 0.04f
                    if (laser.y < 0f) {
                        iterator.remove()
                    }
                }

                // 3. Move enemies
                enemies.forEach { enemy ->
                    enemy.x += enemy.vx
                    if (enemy.x <= 0.08f || enemy.x >= 0.92f) {
                        enemy.vx = -enemy.vx
                        enemy.y += 0.02f
                    }

                    // Random enemy firing
                    if (Random.nextFloat() < 0.02f) {
                        enemyBullets.add(EnemyBullet(enemy.x, enemy.y + 0.03f))
                    }
                }

                // 4. Move enemy bullets
                val bulletIterator = enemyBullets.iterator()
                while (bulletIterator.hasNext()) {
                    val bullet = bulletIterator.next()
                    bullet.y += 0.025f
                    // Collision with player
                    if (bullet.y >= 0.84f && bullet.y <= 0.90f && kotlin.math.abs(bullet.x - playerX) < 0.07f) {
                        bulletIterator.remove()
                        lives--
                        if (lives <= 0) {
                            isGameOver = true
                            isPlaying = false
                            val durationSec = ((System.currentTimeMillis() - startTime) / 1000).toInt()
                            viewModel.recordGameScore(GameType.QUEST_DEFENDER, score, wave, durationSec)
                        }
                    } else if (bullet.y > 1f) {
                        bulletIterator.remove()
                    }
                }

                // 5. Collision: Laser -> Enemy
                val hitLasers = mutableSetOf<PlayerLaser>()
                val hitEnemies = mutableSetOf<EnemyShip>()

                for (laser in lasers) {
                    for (enemy in enemies) {
                        if (kotlin.math.abs(laser.x - enemy.x) < 0.06f && kotlin.math.abs(laser.y - enemy.y) < 0.05f) {
                            hitLasers.add(laser)
                            hitEnemies.add(enemy)
                            score += 20 * wave
                        }
                    }
                }
                lasers.removeAll(hitLasers)
                enemies.removeAll(hitEnemies)

                // 6. Wave completed check
                if (enemies.isEmpty()) {
                    wave++
                    spawnWave(wave)
                }

                // 7. Enemy reached bottom check
                if (enemies.any { it.y >= 0.85f }) {
                    lives--
                    if (lives <= 0) {
                        isGameOver = true
                        isPlaying = false
                        val durationSec = ((System.currentTimeMillis() - startTime) / 1000).toInt()
                        viewModel.recordGameScore(GameType.QUEST_DEFENDER, score, wave, durationSec)
                    } else {
                        spawnWave(wave)
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
                text = "Quest Defender",
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
                        .background(PrimaryViolet.copy(alpha = 0.2f))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = "Score: $score",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = PrimaryViolet
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Playfield Canvas
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
                .clip(RoundedCornerShape(18.dp))
                .background(Color(0xFF070913))
                .border(2.dp, if (isGameOver) ErrorRed else PrimaryViolet.copy(alpha = 0.4f), RoundedCornerShape(18.dp))
                .pointerInput(Unit) {
                    detectDragGestures { _, dragAmount ->
                        if (isPlaying && !isGameOver) {
                            val deltaNorm = dragAmount.x / size.width
                            playerX = (playerX + deltaNorm).coerceIn(0.08f, 0.92f)
                        }
                    }
                }
                .testTag("quest_defender_canvas"),
            contentAlignment = Alignment.Center
        ) {
            Canvas(modifier = Modifier.fillMaxSize()) {
                val w = size.width
                val h = size.height

                // Draw Stars
                for (s in 0..35) {
                    val sx = (s * 83) % w
                    val sy = (s * 59) % h
                    drawCircle(
                        color = Color.White.copy(alpha = if (s % 3 == 0) 0.8f else 0.3f),
                        radius = if (s % 5 == 0) 2f else 1f,
                        center = Offset(sx, sy)
                    )
                }

                // Draw Lasers
                lasers.forEach { laser ->
                    drawRoundRect(
                        color = SecondaryBlue,
                        topLeft = Offset(laser.x * w - 3f, laser.y * h),
                        size = Size(6f, 18f),
                        cornerRadius = androidx.compose.ui.geometry.CornerRadius(3f, 3f)
                    )
                }

                // Draw Enemy Bullets
                enemyBullets.forEach { bullet ->
                    drawCircle(
                        color = ErrorRed,
                        radius = 4.5f,
                        center = Offset(bullet.x * w, bullet.y * h)
                    )
                }

                // Draw Enemies (Geometric Alien Ships)
                enemies.forEach { enemy ->
                    val ex = enemy.x * w
                    val ey = enemy.y * h
                    val enemyColor = when (enemy.type) {
                        0 -> ErrorRed
                        1 -> GoldAchievement
                        else -> PrimaryViolet
                    }
                    val enemyPath = Path().apply {
                        moveTo(ex, ey + 14f)
                        lineTo(ex + 14f, ey - 10f)
                        lineTo(ex, ey - 4f)
                        lineTo(ex - 14f, ey - 10f)
                        close()
                    }
                    drawPath(enemyPath, enemyColor)
                }

                // Draw Player Spacecraft
                val px = playerX * w
                val py = 0.88f * h
                val shipPath = Path().apply {
                    moveTo(px, py - 20f) // nose
                    lineTo(px + 18f, py + 14f) // right wing
                    lineTo(px + 6f, py + 8f) // inner right
                    lineTo(px, py + 12f) // engine
                    lineTo(px - 6f, py + 8f) // inner left
                    lineTo(px - 18f, py + 14f) // left wing
                    close()
                }
                drawPath(shipPath, SuccessGreen)
                // Engine thrust glow
                drawCircle(
                    color = SecondaryBlue,
                    radius = 4f,
                    center = Offset(px, py + 12f)
                )
            }

            if (!isPlaying && !isGameOver) {
                Button(
                    onClick = { restartGame() },
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryViolet),
                    shape = RoundedCornerShape(12.dp),
                    modifier = Modifier.testTag("defender_start_button")
                ) {
                    Icon(imageVector = Icons.Default.PlayArrow, contentDescription = "Play")
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Launch Defender", fontWeight = FontWeight.Bold)
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
                    Text(
                        text = "Ship Destroyed!",
                        fontSize = 22.sp,
                        fontWeight = FontWeight.Bold,
                        color = ErrorRed
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                    Text(
                        text = "Wave: $wave • Final Score: $score",
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
                        Text("Deploy Again", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Horizontal Steering Controls
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                onClick = { if (isPlaying && !isGameOver) playerX = (playerX - 0.08f).coerceAtLeast(0.08f) },
                modifier = Modifier
                    .size(54.dp)
                    .clip(CircleShape)
                    .background(DarkElevatedSurface)
            ) {
                Icon(Icons.Default.KeyboardArrowLeft, contentDescription = "Left", tint = TextPrimary, modifier = Modifier.size(32.dp))
            }

            Text(
                text = "Drag canvas or use arrows",
                fontSize = 12.sp,
                color = TextSecondary
            )

            IconButton(
                onClick = { if (isPlaying && !isGameOver) playerX = (playerX + 0.08f).coerceAtMost(0.92f) },
                modifier = Modifier
                    .size(54.dp)
                    .clip(CircleShape)
                    .background(DarkElevatedSurface)
            ) {
                Icon(Icons.Default.KeyboardArrowRight, contentDescription = "Right", tint = TextPrimary, modifier = Modifier.size(32.dp))
            }
        }
    }
}
