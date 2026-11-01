package com.example.ui.feature.adventure

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Explore
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.MilitaryTech
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.scale
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.core.model.AdventureLevel
import com.example.core.model.AdventureLevelStatus
import com.example.core.model.AdventureLevelType
import com.example.core.model.DefaultAdventureLevels
import com.example.ui.MainViewModel
import com.example.ui.components.QuestlyCard
import com.example.ui.theme.QuestlyThemeTokens
import kotlin.math.cos
import kotlin.math.sin

@Composable
fun AdventureMapScreen(
    viewModel: MainViewModel,
    onNavigateToFocus: () -> Unit,
    onNavigateToQuests: () -> Unit,
    modifier: Modifier = Modifier
) {
    val levels by viewModel.adventureLevels.collectAsState()
    val completedQuests by viewModel.completedQuests.collectAsState()
    val focusSessions by viewModel.focusSessions.collectAsState()
    val streak by viewModel.streak.collectAsState()
    val colors = QuestlyThemeTokens.colors

    var selectedLevel by remember { mutableStateOf<AdventureLevel?>(null) }
    var showClaimCelebration by remember { mutableStateOf(false) }

    val listState = rememberLazyListState()

    // Aggregate statistics
    val totalStars = levels.sumOf { it.starsEarned }
    val completedCount = levels.count { it.status == AdventureLevelStatus.COMPLETED || it.status == AdventureLevelStatus.PERFECT }

    // Pulsing animation for available nodes
    val infiniteTransition = rememberInfiniteTransition(label = "map_glow")
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 0.95f,
        targetValue = 1.08f,
        animationSpec = infiniteRepeatable(
            animation = tween(1200, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulse_scale"
    )

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(colors.background)
            .testTag("adventure_map_screen")
    ) {
        Column(modifier = Modifier.fillMaxSize()) {
            // Header Stats Bar
            AdventureHeaderBar(
                totalStars = totalStars,
                completedCount = completedCount,
                totalLevels = if (levels.isNotEmpty()) levels.size else 20
            )

            // Vertically Explorable Winding Path
            if (levels.isEmpty()) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Text("Loading Adventure Map...", color = colors.secondaryText)
                }
            } else {
                LazyColumn(
                    state = listState,
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(bottom = 120.dp, top = 16.dp)
                ) {
                    // Group levels into zones
                    val grouped = levels.groupBy { it.zoneId }
                    DefaultAdventureLevels.ZONES.forEach { zone ->
                        val zoneLevels = grouped[zone.id] ?: emptyList()
                        if (zoneLevels.isNotEmpty()) {
                            item(key = "header_${zone.id}") {
                                ZoneHeaderBanner(zone = zone)
                            }

                            itemsIndexed(zoneLevels, key = { _, level -> "level_${level.levelNumber}" }) { index, level ->
                                WindingLevelNodeRow(
                                    level = level,
                                    indexInZone = index,
                                    pulseScale = pulseScale,
                                    onNodeClick = { selectedLevel = level }
                                )
                            }
                        }
                    }
                }
            }
        }

        // Level Details Dialog
        selectedLevel?.let { level ->
            LevelDetailsDialog(
                level = level,
                streakDays = streak.currentStreak,
                completedQuestsCount = completedQuests.size,
                todayFocusMinutes = focusSessions.filter {
                    val today = java.time.LocalDate.now().toString()
                    val sessionDate = java.time.Instant.ofEpochMilli(it.startedAt)
                        .atZone(java.time.ZoneId.systemDefault())
                        .toLocalDate().toString()
                    sessionDate == today
                }.sumOf { it.elapsedSeconds / 60 },
                onDismiss = { selectedLevel = null },
                onClaim = {
                    viewModel.claimAdventureLevel(level, stars = 3)
                    showClaimCelebration = true
                    selectedLevel = null
                },
                onStartFocus = {
                    selectedLevel = null
                    onNavigateToFocus()
                },
                onOpenQuests = {
                    selectedLevel = null
                    onNavigateToQuests()
                }
            )
        }

        // Star Burst Celebration Overlay
        AnimatedVisibility(
            visible = showClaimCelebration,
            enter = fadeIn() + scaleIn(),
            exit = fadeOut(),
            modifier = Modifier.align(Alignment.Center)
        ) {
            StarCelebrationCard(onDismiss = { showClaimCelebration = false })
        }
    }
}

@Composable
private fun AdventureHeaderBar(
    totalStars: Int,
    completedCount: Int,
    totalLevels: Int
) {
    val colors = QuestlyThemeTokens.colors
    Surface(
        color = colors.cardSurface,
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, colors.border)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp, vertical = 14.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Explore,
                        contentDescription = "Adventure",
                        tint = colors.primaryAccent,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "ADVENTURE MAP",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold,
                        color = colors.primaryText,
                        letterSpacing = 0.5.sp
                    )
                }
                Text(
                    text = "$completedCount of $totalLevels levels conquered",
                    fontSize = 12.sp,
                    color = colors.secondaryText
                )
            }

            // Stars pill
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier
                    .clip(RoundedCornerShape(20.dp))
                    .background(colors.gold.copy(alpha = 0.15f))
                    .border(1.dp, colors.gold.copy(alpha = 0.4f), RoundedCornerShape(20.dp))
                    .padding(horizontal = 12.dp, vertical = 6.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.Star,
                    contentDescription = "Stars",
                    tint = colors.gold,
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = "$totalStars / ${totalLevels * 3}",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = colors.gold
                )
            }
        }
    }
}

@Composable
private fun ZoneHeaderBanner(zone: com.example.core.model.AdventureZone) {
    val colors = QuestlyThemeTokens.colors
    val zoneColor = Color(zone.themeColorHex)

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 20.dp)
            .clip(RoundedCornerShape(16.dp))
            .background(
                Brush.horizontalGradient(
                    listOf(
                        zoneColor.copy(alpha = 0.25f),
                        zoneColor.copy(alpha = 0.08f)
                    )
                )
            )
            .border(1.dp, zoneColor.copy(alpha = 0.4f), RoundedCornerShape(16.dp))
            .padding(16.dp)
    ) {
        Column {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = zone.name.uppercase(),
                    fontSize = 14.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = zoneColor,
                    letterSpacing = 1.sp
                )
                Text(
                    text = "Levels ${zone.levelRange.first}-${zone.levelRange.last}",
                    fontSize = 11.sp,
                    color = colors.mutedText,
                    fontWeight = FontWeight.SemiBold
                )
            }
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = zone.description,
                fontSize = 12.sp,
                color = colors.secondaryText,
                lineHeight = 16.sp
            )
        }
    }
}

@Composable
private fun WindingLevelNodeRow(
    level: AdventureLevel,
    indexInZone: Int,
    pulseScale: Float,
    onNodeClick: () -> Unit
) {
    val colors = QuestlyThemeTokens.colors

    // Serpentine horizontal offset calculated with a sine wave (-60dp to +60dp)
    val horizontalShift = when (indexInZone % 4) {
        0 -> 0.dp
        1 -> 65.dp
        2 -> 0.dp
        3 -> (-65).dp
        else -> 0.dp
    }

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .height(110.dp),
        contentAlignment = Alignment.Center
    ) {
        // Connecting curved trail line
        Canvas(modifier = Modifier.fillMaxSize()) {
            val cx = size.width / 2f + horizontalShift.toPx()
            val cy = size.height / 2f

            // Draw decorative path trail
            drawLine(
                color = colors.border.copy(alpha = 0.5f),
                start = Offset(cx, 0f),
                end = Offset(cx, size.height),
                strokeWidth = 3f,
                cap = StrokeCap.Round
            )
        }

        // Interactive Level Node Widget
        Box(
            modifier = Modifier
                .offset { IntOffset(horizontalShift.roundToPx(), 0) }
                .clickable { onNodeClick() }
                .testTag("adventure_node_${level.levelNumber}"),
            contentAlignment = Alignment.Center
        ) {
            when (level.status) {
                AdventureLevelStatus.LOCKED -> LockedNode(level = level)
                AdventureLevelStatus.AVAILABLE -> AvailableNode(level = level, scale = pulseScale)
                AdventureLevelStatus.COMPLETED, AdventureLevelStatus.PERFECT -> CompletedNode(level = level)
                AdventureLevelStatus.IN_PROGRESS -> AvailableNode(level = level, scale = 1.0f)
            }
        }
    }
}

@Composable
private fun AvailableNode(level: AdventureLevel, scale: Float) {
    val colors = QuestlyThemeTokens.colors
    val isBoss = level.levelType == AdventureLevelType.BOSS

    Column(
        horizontalAlignment = Alignment.CenterVertically,
        modifier = Modifier.scale(scale)
    ) {
        // Outer pulsing ring
        Box(
            modifier = Modifier
                .size(if (isBoss) 68.dp else 58.dp)
                .clip(CircleShape)
                .background(
                    if (isBoss) Brush.radialGradient(listOf(colors.coral, colors.gold))
                    else Brush.radialGradient(listOf(colors.primaryAccent, colors.secondaryAccent))
                )
                .padding(3.dp),
            contentAlignment = Alignment.Center
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .clip(CircleShape)
                    .background(colors.cardSurface),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterVertically) {
                    if (isBoss) {
                        Icon(
                            imageVector = Icons.Default.Security,
                            contentDescription = "Boss",
                            tint = colors.gold,
                            modifier = Modifier.size(18.dp)
                        )
                    } else {
                        Text(
                            text = "${level.levelNumber}",
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Bold,
                            color = colors.primaryText
                        )
                    }
                }
            }
        }

        // Active indicator banner
        Text(
            text = "PLAY",
            fontSize = 9.sp,
            fontWeight = FontWeight.ExtraBold,
            color = colors.primaryAccent,
            modifier = Modifier
                .offset(y = (-6).dp)
                .clip(RoundedCornerShape(8.dp))
                .background(colors.elevatedSurface)
                .border(1.dp, colors.primaryAccent, RoundedCornerShape(8.dp))
                .padding(horizontal = 6.dp, vertical = 1.dp)
        )
    }
}

@Composable
private fun CompletedNode(level: AdventureLevel) {
    val colors = QuestlyThemeTokens.colors
    val isBoss = level.levelType == AdventureLevelType.BOSS

    Column(horizontalAlignment = Alignment.CenterVertically) {
        Box(
            modifier = Modifier
                .size(if (isBoss) 64.dp else 54.dp)
                .clip(CircleShape)
                .background(
                    if (isBoss) colors.gold else colors.success
                )
                .padding(2.dp),
            contentAlignment = Alignment.Center
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .clip(CircleShape)
                    .background(colors.cardSurface),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Check,
                    contentDescription = "Completed",
                    tint = if (isBoss) colors.gold else colors.success,
                    modifier = Modifier.size(24.dp)
                )
            }
        }

        // 3-Star Rating Display
        Row(modifier = Modifier.padding(top = 2.dp)) {
            val stars = level.starsEarned.coerceIn(1, 3)
            repeat(3) { starIndex ->
                Icon(
                    imageVector = Icons.Default.Star,
                    contentDescription = "Star",
                    tint = if (starIndex < stars) colors.gold else colors.mutedText.copy(alpha = 0.4f),
                    modifier = Modifier.size(12.dp)
                )
            }
        }
    }
}

@Composable
private fun LockedNode(level: AdventureLevel) {
    val colors = QuestlyThemeTokens.colors
    Box(
        modifier = Modifier
            .size(48.dp)
            .clip(CircleShape)
            .background(colors.elevatedSurface)
            .border(1.dp, colors.border, CircleShape),
        contentAlignment = Alignment.Center
    ) {
        Icon(
            imageVector = Icons.Default.Lock,
            contentDescription = "Locked",
            tint = colors.mutedText,
            modifier = Modifier.size(18.dp)
        )
    }
}

@Composable
private fun LevelDetailsDialog(
    level: AdventureLevel,
    streakDays: Int,
    completedQuestsCount: Int,
    todayFocusMinutes: Int,
    onDismiss: () -> Unit,
    onClaim: () -> Unit,
    onStartFocus: () -> Unit,
    onOpenQuests: () -> Unit
) {
    val colors = QuestlyThemeTokens.colors
    val isCompleted = level.status == AdventureLevelStatus.COMPLETED || level.status == AdventureLevelStatus.PERFECT

    // Check if criteria are met
    val isCriteriaMet = when (level.levelType) {
        AdventureLevelType.FOCUS -> todayFocusMinutes >= level.targetRequirement
        AdventureLevelType.QUEST -> completedQuestsCount >= level.targetRequirement
        AdventureLevelType.CONSISTENCY -> streakDays >= level.targetRequirement
        AdventureLevelType.BOSS -> todayFocusMinutes >= level.targetRequirement && completedQuestsCount >= 2
        AdventureLevelType.SPECIAL -> todayFocusMinutes >= level.targetRequirement || completedQuestsCount >= level.targetRequirement
    }

    val canClaim = !isCompleted && level.status != AdventureLevelStatus.LOCKED && isCriteriaMet

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = colors.cardSurface,
        title = {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "LEVEL ${level.levelNumber}",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = colors.primaryAccent,
                        letterSpacing = 1.sp
                    )
                    Text(
                        text = level.title,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = colors.primaryText
                    )
                }
                IconButton(onClick = onDismiss) {
                    Icon(Icons.Default.Close, contentDescription = "Close", tint = colors.secondaryText)
                }
            }
        },
        text = {
            Column(modifier = Modifier.fillMaxWidth()) {
                // Zone Tag & Difficulty
                Row(modifier = Modifier.padding(bottom = 10.dp)) {
                    Text(
                        text = level.zoneName,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = colors.secondaryAccent,
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(colors.secondaryAccent.copy(alpha = 0.15f))
                            .padding(horizontal = 8.dp, vertical = 2.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = level.difficulty.uppercase(),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (level.difficulty == "Boss") colors.coral else colors.gold,
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(colors.elevatedSurface)
                            .padding(horizontal = 8.dp, vertical = 2.dp)
                    )
                }

                Text(
                    text = level.description,
                    fontSize = 13.sp,
                    color = colors.secondaryText,
                    lineHeight = 18.sp
                )

                Spacer(modifier = Modifier.height(14.dp))

                // Requirement card
                QuestlyCard(
                    modifier = Modifier.fillMaxWidth(),
                    backgroundColor = colors.elevatedSurface,
                    borderColor = colors.border
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text(
                            text = "CHALLENGE OBJECTIVE",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = colors.mutedText,
                            letterSpacing = 0.5.sp
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = level.requirementDescription,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = colors.primaryText
                        )
                        Spacer(modifier = Modifier.height(8.dp))

                        // Current live status indicator
                        val statusText = when (level.levelType) {
                            AdventureLevelType.FOCUS -> "Today's Focus: $todayFocusMinutes / ${level.targetRequirement} min"
                            AdventureLevelType.QUEST -> "Completed Quests: $completedQuestsCount / ${level.targetRequirement}"
                            AdventureLevelType.CONSISTENCY -> "Current Streak: $streakDays / ${level.targetRequirement} days"
                            AdventureLevelType.BOSS -> "Focus: $todayFocusMinutes/${level.targetRequirement} min • Quests: $completedQuestsCount/2"
                            AdventureLevelType.SPECIAL -> "Focus: $todayFocusMinutes min • Quests: $completedQuestsCount"
                        }

                        Text(
                            text = if (isCriteriaMet) "$statusText • Ready to Claim!" else statusText,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = if (isCriteriaMet) colors.success else colors.secondaryAccent
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Rewards
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.AutoAwesome,
                            contentDescription = "XP",
                            tint = colors.gold,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "+${level.xpReward} XP",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = colors.gold
                        )
                    }

                    level.badgeReward?.let { badge ->
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                imageVector = Icons.Default.MilitaryTech,
                                contentDescription = "Badge",
                                tint = colors.coral,
                                modifier = Modifier.size(16.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = badge,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = colors.coral
                            )
                        }
                    }
                }
            }
        },
        confirmButton = {
            if (isCompleted) {
                Text(
                    text = "COMPLETED",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = colors.success,
                    modifier = Modifier.padding(horizontal = 12.dp)
                )
            } else if (canClaim) {
                Button(
                    onClick = onClaim,
                    colors = ButtonDefaults.buttonColors(containerColor = colors.success)
                ) {
                    Text("CLAIM REWARD", fontWeight = FontWeight.Bold)
                }
            } else if (level.status != AdventureLevelStatus.LOCKED) {
                if (level.levelType == AdventureLevelType.FOCUS || level.levelType == AdventureLevelType.BOSS) {
                    Button(
                        onClick = onStartFocus,
                        colors = ButtonDefaults.buttonColors(containerColor = colors.primaryAccent)
                    ) {
                        Text("START FOCUS", fontWeight = FontWeight.Bold)
                    }
                } else {
                    Button(
                        onClick = onOpenQuests,
                        colors = ButtonDefaults.buttonColors(containerColor = colors.primaryAccent)
                    ) {
                        Text("VIEW QUESTS", fontWeight = FontWeight.Bold)
                    }
                }
            }
        },
        dismissButton = {
            OutlinedButton(onClick = onDismiss) {
                Text("CLOSE", color = colors.secondaryText)
            }
        }
    )
}

@Composable
private fun StarCelebrationCard(onDismiss: () -> Unit) {
    val colors = QuestlyThemeTokens.colors
    Box(
        modifier = Modifier
            .padding(24.dp)
            .clip(RoundedCornerShape(20.dp))
            .background(colors.cardSurface)
            .border(2.dp, colors.gold, RoundedCornerShape(20.dp))
            .padding(24.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(horizontalAlignment = Alignment.CenterVertically) {
            Icon(
                imageVector = Icons.Default.Star,
                contentDescription = "Triumph",
                tint = colors.gold,
                modifier = Modifier.size(48.dp)
            )
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = "VICTORY!",
                fontSize = 20.sp,
                fontWeight = FontWeight.Black,
                color = colors.gold,
                letterSpacing = 1.sp
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = "You conquered this level and earned 3 stars!",
                fontSize = 13.sp,
                color = colors.primaryText,
                textAlign = TextAlign.Center
            )
            Spacer(modifier = Modifier.height(16.dp))
            Button(
                onClick = onDismiss,
                colors = ButtonDefaults.buttonColors(containerColor = colors.primaryAccent)
            ) {
                Text("CONTINUE JOURNEY", fontWeight = FontWeight.Bold)
            }
        }
    }
}
