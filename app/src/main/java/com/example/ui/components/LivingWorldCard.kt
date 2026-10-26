package com.example.ui.components

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.LinearEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.core.model.StreakInfo
import com.example.core.model.WorldStage
import com.example.ui.theme.DarkBorder
import com.example.ui.theme.DarkCardSurface
import com.example.ui.theme.DarkElevatedSurface
import com.example.ui.theme.GoldAchievement
import com.example.ui.theme.PrimaryViolet
import com.example.ui.theme.SecondaryBlue
import com.example.ui.theme.SuccessGreen
import com.example.ui.theme.TextMuted
import com.example.ui.theme.TextPrimary
import com.example.ui.theme.TextSecondary
import com.example.ui.theme.WarningOrange

import com.example.ui.theme.QuestlyThemeTokens

@Composable
fun LivingWorldCard(
    streakInfo: StreakInfo,
    modifier: Modifier = Modifier
) {
    val worldStage = streakInfo.worldStage
    val colors = QuestlyThemeTokens.colors

    // Particle and glow animations
    val infiniteTransition = rememberInfiniteTransition(label = "world_anim")
    val pulseGlow by infiniteTransition.animateFloat(
        initialValue = 0.45f,
        targetValue = 0.95f,
        animationSpec = infiniteRepeatable(
            animation = tween(2200, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulse_glow"
    )
    val floatOffset by infiniteTransition.animateFloat(
        initialValue = -5f,
        targetValue = 5f,
        animationSpec = infiniteRepeatable(
            animation = tween(2600, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "floating"
    )

    QuestlyCard(
        modifier = modifier
            .fillMaxWidth()
            .testTag("living_world_hero_card"),
        backgroundColor = colors.cardSurface,
        borderColor = when (worldStage) {
            WorldStage.FORGOTTEN_OUTPOST -> colors.border
            WorldStage.THE_AWAKENING -> colors.primaryAccent.copy(alpha = 0.5f)
            WorldStage.THE_GROWING_REALM -> colors.secondaryAccent.copy(alpha = 0.6f)
            WorldStage.THE_RADIANT_CITADEL -> colors.gold.copy(alpha = 0.7f)
            WorldStage.THE_CELESTIAL_KINGDOM -> colors.primaryAccent.copy(alpha = 0.9f)
        }
    ) {
        Column {
            // Interactive Living World Canvas Illustration
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(180.dp)
                    .clip(RoundedCornerShape(topStart = 20.dp, topEnd = 20.dp))
                    .background(
                        when (worldStage) {
                            WorldStage.FORGOTTEN_OUTPOST -> Brush.verticalGradient(
                                listOf(Color(0xFF0D101C), Color(0xFF141A2E))
                            )
                            WorldStage.THE_AWAKENING -> Brush.verticalGradient(
                                listOf(Color(0xFF12142B), Color(0xFF221A44))
                            )
                            WorldStage.THE_GROWING_REALM -> Brush.verticalGradient(
                                listOf(Color(0xFF0F1B2E), Color(0xFF183350))
                            )
                            WorldStage.THE_RADIANT_CITADEL -> Brush.verticalGradient(
                                listOf(Color(0xFF24163B), Color(0xFF452B1E))
                            )
                            WorldStage.THE_CELESTIAL_KINGDOM -> Brush.verticalGradient(
                                listOf(Color(0xFF1A0E38), Color(0xFF38155A), Color(0xFF10284A))
                            )
                        }
                    )
            ) {
                Canvas(modifier = Modifier.fillMaxSize()) {
                    val w = size.width
                    val h = size.height

                    // 1. Stars / Stardust
                    val starCount = when (worldStage) {
                        WorldStage.FORGOTTEN_OUTPOST -> 12
                        WorldStage.THE_AWAKENING -> 22
                        WorldStage.THE_GROWING_REALM -> 32
                        WorldStage.THE_RADIANT_CITADEL -> 45
                        WorldStage.THE_CELESTIAL_KINGDOM -> 65
                    }
                    for (i in 0 until starCount) {
                        val sx = (i * 47) % w
                        val sy = (i * 29) % (h * 0.65f)
                        val radius = if (i % 5 == 0) 2.2f else 1.2f
                        val alpha = ((i % 7) / 7f) * pulseGlow
                        drawCircle(
                            color = Color.White.copy(alpha = alpha.coerceIn(0.2f, 0.95f)),
                            radius = radius,
                            center = Offset(sx, sy)
                        )
                    }

                    // 2. Distant Mountains / Hills
                    val backMountainPath = Path().apply {
                        moveTo(0f, h * 0.72f)
                        lineTo(w * 0.25f, h * 0.48f)
                        lineTo(w * 0.55f, h * 0.68f)
                        lineTo(w * 0.8f, h * 0.42f)
                        lineTo(w, h * 0.65f)
                        lineTo(w, h)
                        lineTo(0f, h)
                        close()
                    }
                    drawPath(
                        path = backMountainPath,
                        color = when (worldStage) {
                            WorldStage.FORGOTTEN_OUTPOST -> Color(0xFF111524)
                            WorldStage.THE_AWAKENING -> Color(0xFF1D1B36)
                            WorldStage.THE_GROWING_REALM -> Color(0xFF132238)
                            WorldStage.THE_RADIANT_CITADEL -> Color(0xFF301E3E)
                            WorldStage.THE_CELESTIAL_KINGDOM -> Color(0xFF281347)
                        }
                    )

                    // 3. Foreground Terrain
                    val foreTerrainPath = Path().apply {
                        moveTo(0f, h * 0.78f)
                        quadraticTo(w * 0.35f, h * 0.70f, w * 0.65f, h * 0.76f)
                        quadraticTo(w * 0.85f, h * 0.80f, w, h * 0.74f)
                        lineTo(w, h)
                        lineTo(0f, h)
                        close()
                    }
                    drawPath(
                        path = foreTerrainPath,
                        color = when (worldStage) {
                            WorldStage.FORGOTTEN_OUTPOST -> Color(0xFF171D2F)
                            WorldStage.THE_AWAKENING -> Color(0xFF242247)
                            WorldStage.THE_GROWING_REALM -> Color(0xFF182C49)
                            WorldStage.THE_RADIANT_CITADEL -> Color(0xFF3B254E)
                            WorldStage.THE_CELESTIAL_KINGDOM -> Color(0xFF321858)
                        }
                    )

                    // 4. World Structures & Environmental Elements
                    when (worldStage) {
                        WorldStage.FORGOTTEN_OUTPOST -> {
                            // Small tent & dim campfire
                            val cx = w * 0.48f
                            val cy = h * 0.75f
                            // Tent
                            val tentPath = Path().apply {
                                moveTo(cx - 30f, cy)
                                lineTo(cx, cy - 26f)
                                lineTo(cx + 30f, cy)
                                close()
                            }
                            drawPath(tentPath, Color(0xFF2C324B))

                            // Small campfire ember
                            drawCircle(
                                color = WarningOrange.copy(alpha = pulseGlow * 0.6f),
                                radius = 7f,
                                center = Offset(cx + 42f, cy - 2f)
                            )
                        }
                        WorldStage.THE_AWAKENING -> {
                            // Campfire with bright embers and glowing crystals
                            val cx = w * 0.45f
                            val cy = h * 0.74f

                            // Awakening Outpost Cabin
                            drawRoundRect(
                                color = Color(0xFF3D3468),
                                topLeft = Offset(cx - 35f, cy - 35f),
                                size = Size(50f, 35f),
                                cornerRadius = CornerRadius(4f, 4f)
                            )
                            // Glowing window
                            drawRect(
                                color = GoldAchievement.copy(alpha = pulseGlow),
                                topLeft = Offset(cx - 20f, cy - 25f),
                                size = Size(12f, 12f)
                            )

                            // Campfire with glowing flame
                            drawCircle(
                                color = WarningOrange.copy(alpha = pulseGlow),
                                radius = 12f,
                                center = Offset(cx + 40f, cy - 6f)
                            )

                            // Glowing Crystal
                            val crystalPath = Path().apply {
                                moveTo(cx + 80f, cy - 24f + floatOffset)
                                lineTo(cx + 90f, cy - 8f + floatOffset)
                                lineTo(cx + 80f, cy + 4f + floatOffset)
                                lineTo(cx + 70f, cy - 8f + floatOffset)
                                close()
                            }
                            drawPath(crystalPath, PrimaryViolet.copy(alpha = pulseGlow))
                        }
                        WorldStage.THE_GROWING_REALM -> {
                            // Watchtower & stone archways
                            val cx = w * 0.5f
                            val cy = h * 0.73f

                            // Watchtower
                            drawRoundRect(
                                color = Color(0xFF2A4265),
                                topLeft = Offset(cx - 20f, cy - 58f),
                                size = Size(36f, 60f),
                                cornerRadius = CornerRadius(4f, 4f)
                            )
                            // Tower beacon
                            drawCircle(
                                color = SecondaryBlue.copy(alpha = pulseGlow),
                                radius = 16f,
                                center = Offset(cx - 2f, cy - 58f)
                            )

                            // Stone Settlement Houses
                            drawRoundRect(
                                color = Color(0xFF1F3553),
                                topLeft = Offset(cx - 75f, cy - 30f),
                                size = Size(45f, 30f),
                                cornerRadius = CornerRadius(4f, 4f)
                            )
                            drawRoundRect(
                                color = Color(0xFF1F3553),
                                topLeft = Offset(cx + 30f, cy - 28f),
                                size = Size(40f, 28f),
                                cornerRadius = CornerRadius(4f, 4f)
                            )

                            // Floating energy crystals
                            for (c in 0..2) {
                                val kx = cx + (c * 38f) - 60f
                                val ky = cy - 40f + (c * 6f) + floatOffset
                                drawCircle(
                                    color = SuccessGreen.copy(alpha = pulseGlow * 0.8f),
                                    radius = 6f,
                                    center = Offset(kx, ky)
                                )
                            }
                        }
                        WorldStage.THE_RADIANT_CITADEL -> {
                            // Radiant Citadel Spire & floating obelisks
                            val cx = w * 0.5f
                            val cy = h * 0.72f

                            // Citadel main tower
                            val spirePath = Path().apply {
                                moveTo(cx, cy - 85f)
                                lineTo(cx + 30f, cy)
                                lineTo(cx - 30f, cy)
                                close()
                            }
                            drawPath(spirePath, Color(0xFF5B347A))

                            // Golden pinnacle beacon
                            drawCircle(
                                color = GoldAchievement.copy(alpha = pulseGlow),
                                radius = 22f,
                                center = Offset(cx, cy - 85f)
                            )

                            // Floating obelisks left and right
                            val leftObelisk = Path().apply {
                                moveTo(cx - 65f, cy - 55f + floatOffset)
                                lineTo(cx - 55f, cy - 35f + floatOffset)
                                lineTo(cx - 65f, cy - 15f + floatOffset)
                                lineTo(cx - 75f, cy - 35f + floatOffset)
                                close()
                            }
                            drawPath(leftObelisk, PrimaryViolet.copy(alpha = pulseGlow))

                            val rightObelisk = Path().apply {
                                moveTo(cx + 65f, cy - 50f - floatOffset)
                                lineTo(cx + 75f, cy - 30f - floatOffset)
                                lineTo(cx + 65f, cy - 10f - floatOffset)
                                lineTo(cx + 55f, cy - 30f - floatOffset)
                                close()
                            }
                            drawPath(rightObelisk, SecondaryBlue.copy(alpha = pulseGlow))
                        }
                        WorldStage.THE_CELESTIAL_KINGDOM -> {
                            // Grand Celestial Kingdom with aurora and celestial crystal ring
                            val cx = w * 0.5f
                            val cy = h * 0.70f

                            // Celestial palace spires
                            val palaceCentral = Path().apply {
                                moveTo(cx, cy - 95f)
                                lineTo(cx + 35f, cy)
                                lineTo(cx - 35f, cy)
                                close()
                            }
                            drawPath(palaceCentral, Color(0xFF552585))

                            // Outer spires
                            val leftSpire = Path().apply {
                                moveTo(cx - 50f, cy - 70f)
                                lineTo(cx - 25f, cy)
                                lineTo(cx - 75f, cy)
                                close()
                            }
                            drawPath(leftSpire, Color(0xFF43196E))

                            val rightSpire = Path().apply {
                                moveTo(cx + 50f, cy - 70f)
                                lineTo(cx + 75f, cy)
                                lineTo(cx + 25f, cy)
                                close()
                            }
                            drawPath(rightSpire, Color(0xFF43196E))

                            // Grand celestial core aura
                            drawCircle(
                                color = GoldAchievement.copy(alpha = pulseGlow * 0.9f),
                                radius = 28f,
                                center = Offset(cx, cy - 95f)
                            )
                            drawCircle(
                                color = Color.White.copy(alpha = pulseGlow * 0.7f),
                                radius = 10f,
                                center = Offset(cx, cy - 95f)
                            )

                            // Stardust rings
                            for (s in 0..6) {
                                val ang = (s * 55f + floatOffset * 4f) * (Math.PI / 180f).toFloat()
                                val rx = cx + kotlin.math.cos(ang) * 55f
                                val ry = (cy - 65f) + kotlin.math.sin(ang) * 22f
                                drawCircle(
                                    color = PrimaryViolet.copy(alpha = pulseGlow),
                                    radius = 4f,
                                    center = Offset(rx, ry)
                                )
                            }
                        }
                    }
                }

                // Overlay pill for Stage badge & Streak
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(colors.cardSurface.copy(alpha = 0.90f))
                            .border(1.dp, colors.border.copy(alpha = 0.4f), RoundedCornerShape(8.dp))
                            .padding(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.AutoAwesome,
                                contentDescription = "Stage",
                                tint = colors.gold,
                                modifier = Modifier.size(14.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Text(
                                text = "MY WORLD • STAGE ${worldStage.stageNumber}",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = colors.primaryText,
                                letterSpacing = 0.5.sp
                            )
                        }
                    }

                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(colors.warning.copy(alpha = 0.18f))
                            .border(1.dp, colors.warning.copy(alpha = 0.5f), RoundedCornerShape(8.dp))
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.LocalFireDepartment,
                                contentDescription = "Streak",
                                tint = colors.warning,
                                modifier = Modifier.size(14.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "${streakInfo.currentStreak}d Streak",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = colors.warning
                            )
                        }
                    }
                }
            }

            // Information and milestone text below canvas
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = worldStage.title.uppercase(),
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = colors.primaryText,
                    letterSpacing = 0.5.sp
                )
                Text(
                    text = "\"${worldStage.subtitle}\"",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Medium,
                    color = colors.primaryAccent,
                    modifier = Modifier.padding(top = 2.dp)
                )
                Text(
                    text = worldStage.description,
                    fontSize = 12.sp,
                    color = colors.secondaryText,
                    modifier = Modifier.padding(top = 4.dp, bottom = 12.dp)
                )

                // Progress to next stage
                val nextThreshold = when (worldStage) {
                    WorldStage.FORGOTTEN_OUTPOST -> 3
                    WorldStage.THE_AWAKENING -> 7
                    WorldStage.THE_GROWING_REALM -> 14
                    WorldStage.THE_RADIANT_CITADEL -> 30
                    WorldStage.THE_CELESTIAL_KINGDOM -> 30
                }
                val prevThreshold = worldStage.minStreakDays
                val streakProgress = if (nextThreshold > prevThreshold) {
                    ((streakInfo.currentStreak - prevThreshold).toFloat() / (nextThreshold - prevThreshold).toFloat()).coerceIn(0f, 1f)
                } else 1f

                LinearProgressIndicator(
                    progress = { streakProgress },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(6.dp)
                        .clip(RoundedCornerShape(3.dp)),
                    color = colors.primaryAccent,
                    trackColor = colors.elevatedSurface
                )

                Spacer(modifier = Modifier.height(6.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = worldStage.nextMilestoneDesc,
                        fontSize = 11.sp,
                        color = colors.mutedText
                    )
                    Text(
                        text = "${streakInfo.currentStreak}/$nextThreshold days",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = colors.secondaryAccent
                    )
                }
            }
        }
    }
}
