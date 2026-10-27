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
import androidx.compose.material.icons.filled.KeyboardArrowLeft
import androidx.compose.material.icons.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.Timer
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
import androidx.compose.runtime.mutableFloatStateOf
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
import androidx.compose.ui.graphics.Path
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

enum class PowerUpType { TRIPLE_SHOT, SHIELD, EXTRA_LIFE, BONUS_POINTS }

data class PlayerLaser(var x: Float, var y: Float, val vx: Float = 0f)
data class EnemyShip(
    var x: Float,
    var y: Float,
    var vx: Float,
    val type: Int, // 0 = Vanguard (Red), 1 = Interceptor (Cyan), 2 = Commander (Gold)
    var isDiving: Boolean = false,
    var diveAngle: Float = 0f
)
data class EnemyBullet(var x: Float, var y: Float, val vx: Float = 0f)
data class ExplosionParticle(
    var x: Float,
    var y: Float,
    var vx: Float,
    var vy: Float,
    var alpha: Float,
    val color: Color
)
data class DefenderPowerUp(var x: Float, var y: Float, val type: PowerUpType)

@Composable
fun QuestDefenderScreen(
    viewModel: MainViewModel,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = QuestlyThemeTokens.colors
    val personalBest by viewModel.defenderHighScore.collectAsState()

    var isPlaying by remember { mutableStateOf(false) }
    var isPaused by remember { mutableStateOf(false) }
    var isGameOver by remember { mutableStateOf(false) }

    var score by remember { mutableIntStateOf(0) }
    var lives by remember { mutableIntStateOf(3) }
    var wave by remember { mutableIntStateOf(1) }
    var enemiesDefeated by remember { mutableIntStateOf(0) }
    var hasShield by remember { mutableStateOf(false) }
    var tripleShotTimer by remember { mutableIntStateOf(0) } // in ticks

    var playerX by remember { mutableFloatStateOf(0.5f) } // normalized 0..1
    var startTime by remember { mutableStateOf(0L) }
    var elapsedSeconds by remember { mutableIntStateOf(0) }

    val lasers = remember { mutableStateListOf<PlayerLaser>() }
    val enemies = remember { mutableStateListOf<EnemyShip>() }
    val enemyBullets = remember { mutableStateListOf<EnemyBullet>() }
    val particles = remember { mutableStateListOf<ExplosionParticle>() }
    val powerUps = remember { mutableStateListOf<DefenderPowerUp>() }

    fun spawnExplosion(x: Float, y: Float, baseColor: Color, count: Int = 12) {
        for (i in 0 until count) {
            val angle = Random.nextFloat() * 2f * Math.PI.toFloat()
            val speed = 0.004f + Random.nextFloat() * 0.009f
            particles.add(
                ExplosionParticle(
                    x = x,
                    y = y,
                    vx = kotlin.math.cos(angle) * speed,
                    vy = kotlin.math.sin(angle) * speed,
                    alpha = 1f,
                    color = if (i % 2 == 0) baseColor else Color.White
                )
            )
        }
    }

    fun spawnWave(currentWave: Int) {
        enemies.clear()
        enemyBullets.clear()
        powerUps.clear()
        val count = (4 + currentWave * 2).coerceAtMost(16)
        for (i in 0 until count) {
            val ex = 0.12f + ((i % 6) * 0.15f)
            val ey = 0.10f + ((i / 6) * 0.09f)
            val vx = if ((i / 6) % 2 == 0) 0.007f + (currentWave * 0.0008f) else -(0.007f + (currentWave * 0.0008f))
            val type = when {
                i == 0 || i == 5 -> 2 // Commander
                i % 2 == 0 -> 1       // Interceptor
                else -> 0             // Vanguard
            }
            enemies.add(EnemyShip(ex, ey, vx, type))
        }
    }

    fun restartGame() {
        score = 0
        lives = 3
        wave = 1
        enemiesDefeated = 0
        hasShield = false
        tripleShotTimer = 0
        playerX = 0.5f
        lasers.clear()
        enemies.clear()
        enemyBullets.clear()
        particles.clear()
        powerUps.clear()
        isGameOver = false
        isPaused = false
        isPlaying = true
        startTime = System.currentTimeMillis()
        elapsedSeconds = 0
        spawnWave(1)
    }

    // Main Game Loop (~30 FPS tick)
    LaunchedEffect(isPlaying, isPaused, isGameOver) {
        if (isPlaying && !isPaused && !isGameOver) {
            var fireCooldown = 0
            var timeAccumulator = 0
            while (isPlaying && !isPaused && !isGameOver) {
                delay(33) // ~30 FPS

                timeAccumulator += 33
                if (timeAccumulator >= 1000) {
                    elapsedSeconds++
                    timeAccumulator = 0
                }

                if (tripleShotTimer > 0) {
                    tripleShotTimer--
                }

                // 1. Auto-fire lasers
                fireCooldown++
                if (fireCooldown >= 7) { // every ~230ms
                    if (tripleShotTimer > 0) {
                        lasers.add(PlayerLaser(playerX, 0.85f, vx = 0f))
                        lasers.add(PlayerLaser(playerX - 0.02f, 0.85f, vx = -0.004f))
                        lasers.add(PlayerLaser(playerX + 0.02f, 0.85f, vx = 0.004f))
                    } else {
                        lasers.add(PlayerLaser(playerX - 0.015f, 0.85f))
                        lasers.add(PlayerLaser(playerX + 0.015f, 0.85f))
                    }
                    fireCooldown = 0
                }

                // 2. Move player lasers
                val laserIterator = lasers.iterator()
                while (laserIterator.hasNext()) {
                    val laser = laserIterator.next()
                    laser.y -= 0.045f
                    laser.x += laser.vx
                    if (laser.y < 0f || laser.x < 0f || laser.x > 1f) {
                        laserIterator.remove()
                    }
                }

                // 3. Move enemies & swoop diving logic
                enemies.forEach { enemy ->
                    if (!enemy.isDiving) {
                        enemy.x += enemy.vx
                        if (enemy.x <= 0.06f || enemy.x >= 0.94f) {
                            enemy.vx = -enemy.vx
                            enemy.y += 0.018f
                        }

                        // Commanders occasionally swoop dive
                        if (enemy.type == 2 && Random.nextFloat() < 0.005f + (wave * 0.002f)) {
                            enemy.isDiving = true
                            enemy.diveAngle = if (enemy.x > playerX) -0.01f else 0.01f
                        }

                        // Random enemy plasma firing
                        val fireRate = when (enemy.type) {
                            2 -> 0.035f + (wave * 0.005f) // Commander fires often
                            1 -> 0.020f + (wave * 0.004f)
                            else -> 0.010f + (wave * 0.002f)
                        }
                        if (Random.nextFloat() < fireRate) {
                            enemyBullets.add(EnemyBullet(enemy.x, enemy.y + 0.03f))
                        }
                    } else {
                        // Swooping dive
                        enemy.y += 0.018f
                        enemy.x += enemy.diveAngle
                        if (enemy.y > 0.95f) {
                            // Swoop loop: reset to top
                            enemy.y = 0.08f
                            enemy.isDiving = false
                        }
                    }
                }

                // 4. Move enemy bullets
                val bulletIterator = enemyBullets.iterator()
                while (bulletIterator.hasNext()) {
                    val bullet = bulletIterator.next()
                    bullet.y += 0.024f + (wave * 0.001f)
                    // Collision with player
                    if (bullet.y >= 0.84f && bullet.y <= 0.90f && kotlin.math.abs(bullet.x - playerX) < 0.07f) {
                        bulletIterator.remove()
                        if (hasShield) {
                            hasShield = false
                            spawnExplosion(playerX, 0.88f, colors.secondaryAccent, count = 8)
                        } else {
                            lives--
                            spawnExplosion(playerX, 0.88f, colors.error, count = 14)
                            if (lives <= 0) {
                                isGameOver = true
                                isPlaying = false
                                val durationSec = ((System.currentTimeMillis() - startTime) / 1000).toInt()
                                viewModel.recordGameScore(GameType.QUEST_DEFENDER, score, wave, durationSec)
                            }
                        }
                    } else if (bullet.y > 1f) {
                        bulletIterator.remove()
                    }
                }

                // 5. Move power-ups & check player collection
                val powerUpIterator = powerUps.iterator()
                while (powerUpIterator.hasNext()) {
                    val p = powerUpIterator.next()
                    p.y += 0.014f
                    if (p.y >= 0.84f && p.y <= 0.90f && kotlin.math.abs(p.x - playerX) < 0.08f) {
                        when (p.type) {
                            PowerUpType.TRIPLE_SHOT -> tripleShotTimer = 300 // ~10 seconds
                            PowerUpType.SHIELD -> hasShield = true
                            PowerUpType.EXTRA_LIFE -> if (lives < 5) lives++
                            PowerUpType.BONUS_POINTS -> score += 150
                        }
                        spawnExplosion(p.x, p.y, colors.gold, count = 6)
                        powerUpIterator.remove()
                    } else if (p.y > 1f) {
                        powerUpIterator.remove()
                    }
                }

                // 6. Collision: Laser -> Enemy
                val hitLasers = mutableSetOf<PlayerLaser>()
                val hitEnemies = mutableSetOf<EnemyShip>()

                for (laser in lasers) {
                    for (enemy in enemies) {
                        if (kotlin.math.abs(laser.x - enemy.x) < 0.065f && kotlin.math.abs(laser.y - enemy.y) < 0.055f) {
                            hitLasers.add(laser)
                            hitEnemies.add(enemy)
                            enemiesDefeated++
                            val enemyColor = when (enemy.type) {
                                2 -> colors.gold
                                1 -> colors.secondaryAccent
                                else -> colors.error
                            }
                            spawnExplosion(enemy.x, enemy.y, enemyColor, count = 12)
                            score += (25 + enemy.type * 15) * wave

                            // 22% chance to drop power-up
                            if (Random.nextFloat() < 0.22f) {
                                val puType = PowerUpType.values().random()
                                powerUps.add(DefenderPowerUp(enemy.x, enemy.y, puType))
                            }
                        }
                    }
                }
                lasers.removeAll(hitLasers)
                enemies.removeAll(hitEnemies)

                // 7. Update Particles
                val particleIterator = particles.iterator()
                while (particleIterator.hasNext()) {
                    val part = particleIterator.next()
                    part.x += part.vx
                    part.y += part.vy
                    part.alpha -= 0.04f
                    if (part.alpha <= 0f) {
                        particleIterator.remove()
                    }
                }

                // 8. Wave completed check
                if (enemies.isEmpty()) {
                    wave++
                    score += 100 * wave
                    spawnWave(wave)
                }

                // 9. Enemy bottom breach
                if (enemies.any { it.y >= 0.88f && kotlin.math.abs(it.x - playerX) < 0.07f }) {
                    if (hasShield) {
                        hasShield = false
                        spawnWave(wave)
                    } else {
                        lives--
                        spawnExplosion(playerX, 0.88f, colors.error, count = 16)
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
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(colors.background)
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Header Bar
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
                    text = "Quest Defender",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = colors.primaryText
                )
                Text(
                    text = "WAVE $wave • BEST: $personalBest",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = colors.gold,
                    letterSpacing = 1.sp
                )
            }

            Row(verticalAlignment = Alignment.CenterVertically) {
                if (isPlaying && !isGameOver) {
                    IconButton(onClick = { isPaused = !isPaused }) {
                        Icon(
                            imageVector = if (isPaused) Icons.Default.PlayArrow else Icons.Default.Pause,
                            contentDescription = if (isPaused) "Resume" else "Pause",
                            tint = colors.primaryAccent
                        )
                    }
                }

                // Lives Indicator
                Row(verticalAlignment = Alignment.CenterVertically) {
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
                }
                Spacer(modifier = Modifier.width(10.dp))
                // Score Box
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(colors.primaryAccent.copy(alpha = 0.18f))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = "$score pts",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = colors.primaryAccent
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
                .clip(RoundedCornerShape(20.dp))
                .background(Color(0xFF070914))
                .border(
                    2.dp,
                    if (isGameOver) colors.error else colors.primaryAccent.copy(alpha = 0.4f),
                    RoundedCornerShape(20.dp)
                )
                .pointerInput(Unit) {
                    detectDragGestures { _, dragAmount ->
                        if (isPlaying && !isPaused && !isGameOver) {
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

                // 1. Parallax Stars Layer 1 (Distant faint stars)
                for (s in 0..30) {
                    val sx = (s * 73) % w
                    val sy = (s * 47 + elapsedSeconds * 8f) % h
                    drawCircle(
                        color = Color.White.copy(alpha = 0.35f),
                        radius = 1.0f,
                        center = Offset(sx, sy)
                    )
                }

                // 2. Parallax Stars Layer 2 (Closer brighter stars)
                for (s in 0..20) {
                    val sx = (s * 113) % w
                    val sy = (s * 89 + elapsedSeconds * 22f) % h
                    drawCircle(
                        color = Color(0xFFC0D5FF).copy(alpha = 0.8f),
                        radius = 1.8f,
                        center = Offset(sx, sy)
                    )
                }

                // 3. Power-Ups
                powerUps.forEach { p ->
                    val px = p.x * w
                    val py = p.y * h
                    val puColor = when (p.type) {
                        PowerUpType.TRIPLE_SHOT -> Color(0xFF8B7CFF)
                        PowerUpType.SHIELD -> Color(0xFF67B8FF)
                        PowerUpType.EXTRA_LIFE -> Color(0xFFFF6B7D)
                        PowerUpType.BONUS_POINTS -> Color(0xFFF5C96A)
                    }
                    drawCircle(color = puColor, radius = 9f, center = Offset(px, py))
                    drawCircle(color = Color.White, radius = 4f, center = Offset(px, py))
                }

                // 4. Lasers (Violet & Cyan)
                lasers.forEach { laser ->
                    drawRoundRect(
                        color = if (tripleShotTimer > 0) Color(0xFF8B7CFF) else Color(0xFF67B8FF),
                        topLeft = Offset(laser.x * w - 3f, laser.y * h),
                        size = Size(6f, 18f),
                        cornerRadius = CornerRadius(3f, 3f)
                    )
                }

                // 5. Enemy Bullets
                enemyBullets.forEach { bullet ->
                    drawCircle(
                        color = Color(0xFFFF6B7D),
                        radius = 4.5f,
                        center = Offset(bullet.x * w, bullet.y * h)
                    )
                    drawCircle(
                        color = Color(0xFFFFA6B0),
                        radius = 2f,
                        center = Offset(bullet.x * w, bullet.y * h)
                    )
                }

                // 6. Geometric Enemy Ships
                enemies.forEach { enemy ->
                    val ex = enemy.x * w
                    val ey = enemy.y * h
                    val enemyColor = when (enemy.type) {
                        2 -> Color(0xFFF5C96A) // Commander Gold
                        1 -> Color(0xFF67B8FF) // Interceptor Cyan
                        else -> Color(0xFFFF6B7D) // Vanguard Red
                    }

                    val enemyPath = Path().apply {
                        if (enemy.type == 2) {
                            // Winged Commander
                            moveTo(ex, ey + 16f)
                            lineTo(ex + 18f, ey - 6f)
                            lineTo(ex + 8f, ey - 14f)
                            lineTo(ex, ey - 4f)
                            lineTo(ex - 8f, ey - 14f)
                            lineTo(ex - 18f, ey - 6f)
                            close()
                        } else {
                            // Sleek Dart / Fighter
                            moveTo(ex, ey + 15f)
                            lineTo(ex + 13f, ey - 10f)
                            lineTo(ex, ey - 3f)
                            lineTo(ex - 13f, ey - 10f)
                            close()
                        }
                    }
                    drawPath(enemyPath, enemyColor)
                    // Cockpit eye
                    drawCircle(
                        color = Color.White.copy(alpha = 0.9f),
                        radius = 2.5f,
                        center = Offset(ex, ey)
                    )
                }

                // 7. Particles
                particles.forEach { part ->
                    drawCircle(
                        color = part.color.copy(alpha = part.alpha.coerceIn(0f, 1f)),
                        radius = 3.5f * part.alpha,
                        center = Offset(part.x * w, part.y * h)
                    )
                }

                // 8. Player Spacecraft
                val px = playerX * w
                val py = 0.88f * h

                // Shield Aura if active
                if (hasShield) {
                    drawCircle(
                        color = Color(0xFF67B8FF).copy(alpha = 0.35f),
                        radius = 28f,
                        center = Offset(px, py)
                    )
                }

                val shipPath = Path().apply {
                    moveTo(px, py - 22f) // Nose
                    lineTo(px + 20f, py + 14f) // Right wing tip
                    lineTo(px + 8f, py + 8f)  // Inner right
                    lineTo(px, py + 14f)      // Thruster
                    lineTo(px - 8f, py + 8f)  // Inner left
                    lineTo(px - 20f, py + 14f) // Left wing tip
                    close()
                }
                drawPath(shipPath, Color(0xFF69D8A5))

                // Wing Cannon Accents
                drawRect(
                    color = Color(0xFF8B7CFF),
                    topLeft = Offset(px - 18f, py + 2f),
                    size = Size(4f, 10f)
                )
                drawRect(
                    color = Color(0xFF8B7CFF),
                    topLeft = Offset(px + 14f, py + 2f),
                    size = Size(4f, 10f)
                )

                // Cockpit
                drawCircle(
                    color = Color.White,
                    radius = 3.5f,
                    center = Offset(px, py - 6f)
                )

                // Engine flame exhaust
                drawCircle(
                    color = Color(0xFF67B8FF),
                    radius = 5f,
                    center = Offset(px, py + 16f)
                )
            }

            // Start Overlay
            if (!isPlaying && !isGameOver) {
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    modifier = Modifier
                        .clip(RoundedCornerShape(18.dp))
                        .background(Color(0xFF0B0D14).copy(alpha = 0.90f))
                        .padding(24.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.EmojiEvents,
                        contentDescription = "Arcade",
                        tint = colors.gold,
                        modifier = Modifier.size(36.dp)
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "QUEST DEFENDER",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = colors.primaryText,
                        letterSpacing = 1.sp
                    )
                    Text(
                        text = "Galaga-inspired retro space shooter",
                        fontSize = 12.sp,
                        color = colors.secondaryText,
                        modifier = Modifier.padding(top = 4.dp, bottom = 16.dp)
                    )
                    Button(
                        onClick = { restartGame() },
                        colors = ButtonDefaults.buttonColors(containerColor = colors.primaryAccent),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.testTag("defender_start_button")
                    ) {
                        Icon(imageVector = Icons.Default.PlayArrow, contentDescription = "Play")
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Launch Mission", fontWeight = FontWeight.Bold)
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
                        text = "MISSION PAUSED",
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
                        Text("Resume Flight", fontWeight = FontWeight.Bold)
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
                        text = "SHIP DESTROYED",
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
                            Text("Enemies Defeated", fontSize = 11.sp, color = colors.mutedText)
                            Text("$enemiesDefeated", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = colors.secondaryAccent)
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(0.85f),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Text("Highest Wave", fontSize = 11.sp, color = colors.mutedText)
                            Text("Wave $wave", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = colors.gold)
                        }
                        Column {
                            Text("Survived", fontSize = 11.sp, color = colors.mutedText)
                            Text("${elapsedSeconds}s", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = colors.primaryText)
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
                            Text("Deploy Again", fontWeight = FontWeight.Bold)
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

        Spacer(modifier = Modifier.height(10.dp))

        // Horizontal Steering Controls
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                onClick = { if (isPlaying && !isPaused && !isGameOver) playerX = (playerX - 0.08f).coerceAtLeast(0.08f) },
                modifier = Modifier
                    .size(52.dp)
                    .clip(CircleShape)
                    .background(colors.elevatedSurface)
            ) {
                Icon(
                    Icons.Default.KeyboardArrowLeft,
                    contentDescription = "Steer Left",
                    tint = colors.primaryText,
                    modifier = Modifier.size(32.dp)
                )
            }

            Text(
                text = "Drag canvas or use thruster arrows",
                fontSize = 12.sp,
                color = colors.secondaryText
            )

            IconButton(
                onClick = { if (isPlaying && !isPaused && !isGameOver) playerX = (playerX + 0.08f).coerceAtMost(0.92f) },
                modifier = Modifier
                    .size(52.dp)
                    .clip(CircleShape)
                    .background(colors.elevatedSurface)
            ) {
                Icon(
                    Icons.Default.KeyboardArrowRight,
                    contentDescription = "Steer Right",
                    tint = colors.primaryText,
                    modifier = Modifier.size(32.dp)
                )
            }
        }
    }
}
