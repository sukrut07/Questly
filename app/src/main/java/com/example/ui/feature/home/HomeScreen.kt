package com.example.ui.feature.home

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.RocketLaunch
import androidx.compose.material.icons.filled.SportsEsports
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.core.model.Quest
import com.example.core.model.QuestPriority
import com.example.core.model.QuestStatus
import com.example.ui.MainViewModel
import com.example.ui.components.CategoryBadge
import com.example.ui.components.DifficultyBadge
import com.example.ui.components.LivingWorldCard
import com.example.ui.components.QuestlyCard
import com.example.ui.components.XpProgressBar
import com.example.ui.theme.DarkBackground
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
import java.time.LocalTime

@Composable
fun HomeScreen(
    viewModel: MainViewModel,
    onNavigateToQuests: () -> Unit,
    onNavigateToFocus: () -> Unit,
    onNavigateToArcade: () -> Unit,
    onNavigateToAchievements: () -> Unit,
    onNavigateToAnalytics: () -> Unit,
    modifier: Modifier = Modifier
) {
    val profile by viewModel.profile.collectAsState()
    val levelInfo by viewModel.levelInfo.collectAsState()
    val streak by viewModel.streak.collectAsState()
    val activeQuests by viewModel.activeQuests.collectAsState()
    val achievements by viewModel.achievements.collectAsState()
    val analytics by viewModel.analytics.collectAsState()
    val defenderBest by viewModel.defenderHighScore.collectAsState()

    val greeting = when (LocalTime.now().hour) {
        in 5..11 -> "Good morning"
        in 12..17 -> "Good afternoon"
        else -> "Good evening"
    }

    // Recommended "Quest of the Day" is the highest priority or first active quest
    val questOfTheDay = activeQuests.maxByOrNull { it.priority.level }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(horizontal = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // A. Compact Profile Header
        item {
            Spacer(modifier = Modifier.height(6.dp))
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 6.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(46.dp)
                            .clip(CircleShape)
                            .background(
                                Brush.radialGradient(
                                    listOf(PrimaryViolet, DarkElevatedSurface)
                                )
                            ),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = profile.displayName.take(1).uppercase(),
                            fontSize = 20.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }

                    Spacer(modifier = Modifier.width(12.dp))

                    Column {
                        Text(
                            text = "$greeting, Adventurer",
                            fontSize = 12.sp,
                            color = TextSecondary
                        )
                        Text(
                            text = profile.displayName,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                    }
                }

                // Streak Flame Counter Header Pill
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(10.dp))
                        .background(WarningOrange.copy(alpha = 0.18f))
                        .padding(horizontal = 10.dp, vertical = 6.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.LocalFireDepartment,
                            contentDescription = "Streak",
                            tint = WarningOrange,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(
                            text = "${streak.currentStreak}d Streak",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = WarningOrange
                        )
                    }
                }
            }
        }

        // B. Hero Section: The Living World (Evolves with Streaks)
        item {
            LivingWorldCard(streakInfo = streak)
        }

        // C. XP & Level Progression Card
        item {
            XpProgressBar(
                level = levelInfo.currentLevel,
                currentXp = levelInfo.currentLevelXp,
                requiredXp = levelInfo.requiredLevelXp,
                progressPercent = levelInfo.progressPercent,
                stage = levelInfo.stage
            )
        }

        // D. TODAY'S MOMENTUM (Unified Daily Progress)
        item {
            val dailyMins = analytics?.dailyFocusMinutes ?: 0
            val targetMins = 60
            val focusPercent = (dailyMins.toFloat() / targetMins.toFloat()).coerceIn(0f, 1f)
            val completedCount = analytics?.completedQuestsCount ?: 0

            QuestlyCard(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onNavigateToAnalytics() }
                    .testTag("home_momentum_card"),
                backgroundColor = DarkCardSurface,
                borderColor = SecondaryBlue.copy(alpha = 0.4f)
            ) {
                Row(
                    modifier = Modifier.padding(18.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "TODAY'S MOMENTUM",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = SecondaryBlue,
                            letterSpacing = 1.sp
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "$dailyMins / $targetMins mins focused",
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Text(
                            text = "$completedCount quests completed today • ${streak.currentStreak} day streak active",
                            fontSize = 12.sp,
                            color = TextSecondary,
                            modifier = Modifier.padding(top = 2.dp)
                        )
                    }

                    // Circular Progress Ring
                    Box(
                        modifier = Modifier.size(62.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator(
                            progress = { focusPercent },
                            modifier = Modifier.fillMaxSize(),
                            color = SecondaryBlue,
                            trackColor = DarkElevatedSurface,
                            strokeWidth = 6.dp
                        )
                        Text(
                            text = "${(focusPercent * 100).toInt()}%",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                    }
                }
            }
        }

        // E. Highlighted QUEST OF THE DAY
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Quest of the Day",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
                Text(
                    text = "View all (${activeQuests.size})",
                    fontSize = 12.sp,
                    color = PrimaryViolet,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.clickable { onNavigateToQuests() }
                )
            }
        }

        item {
            if (questOfTheDay != null) {
                QuestlyCard(
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("quest_of_the_day_card"),
                    backgroundColor = DarkCardSurface,
                    borderColor = GoldAchievement.copy(alpha = 0.5f)
                ) {
                    Column(modifier = Modifier.padding(18.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                CategoryBadge(category = questOfTheDay.category)
                                DifficultyBadge(difficulty = questOfTheDay.difficulty)
                            }
                            Text(
                                text = "+${questOfTheDay.xpReward} XP",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = GoldAchievement
                            )
                        }

                        Spacer(modifier = Modifier.height(10.dp))

                        Text(
                            text = questOfTheDay.title,
                            fontSize = 17.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )

                        if (questOfTheDay.description.isNotEmpty()) {
                            Text(
                                text = questOfTheDay.description,
                                fontSize = 13.sp,
                                color = TextSecondary,
                                maxLines = 2,
                                modifier = Modifier.padding(top = 4.dp)
                            )
                        }

                        Spacer(modifier = Modifier.height(14.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Default.Timer,
                                    contentDescription = "Duration",
                                    tint = TextMuted,
                                    modifier = Modifier.size(14.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = "${questOfTheDay.estimatedMinutes}m target",
                                    fontSize = 12.sp,
                                    color = TextMuted
                                )
                            }

                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                Button(
                                    onClick = onNavigateToFocus,
                                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryViolet),
                                    shape = RoundedCornerShape(10.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.PlayArrow,
                                        contentDescription = "Start Focus",
                                        modifier = Modifier.size(16.dp)
                                    )
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("Start Focus", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                                }

                                OutlinedButton(
                                    onClick = { viewModel.completeQuest(questOfTheDay.id) },
                                    shape = RoundedCornerShape(10.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Check,
                                        contentDescription = "Complete",
                                        tint = SuccessGreen,
                                        modifier = Modifier.size(16.dp)
                                    )
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text("Done", color = SuccessGreen, fontSize = 12.sp)
                                }
                            }
                        }
                    }
                }
            } else {
                QuestlyCard(modifier = Modifier.fillMaxWidth()) {
                    Column(
                        modifier = Modifier.padding(20.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text("No active quests remaining today!", color = TextPrimary, fontWeight = FontWeight.Bold)
                        Spacer(modifier = Modifier.height(8.dp))
                        Button(
                            onClick = onNavigateToQuests,
                            colors = ButtonDefaults.buttonColors(containerColor = PrimaryViolet)
                        ) {
                            Icon(Icons.Default.Add, contentDescription = "Add")
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Commission New Quest")
                        }
                    }
                }
            }
        }

        // F. Arcade Entry Feature Card (Quest Defender)
        item {
            QuestlyCard(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { onNavigateToArcade() }
                    .testTag("home_arcade_card"),
                backgroundColor = DarkCardSurface,
                borderColor = PrimaryViolet.copy(alpha = 0.4f)
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(44.dp)
                                .clip(CircleShape)
                                .background(PrimaryViolet.copy(alpha = 0.2f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.RocketLaunch,
                                contentDescription = "Arcade",
                                tint = PrimaryViolet,
                                modifier = Modifier.size(24.dp)
                            )
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text(
                                text = "Arcade: Quest Defender",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary
                            )
                            Text(
                                text = "Take a break • Best: $defenderBest pts",
                                fontSize = 12.sp,
                                color = TextSecondary
                            )
                        }
                    }

                    Icon(
                        imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                        contentDescription = "Play",
                        tint = PrimaryViolet
                    )
                }
            }
        }

        // G. Recent Achievements Preview
        item {
            val unlockedAchievements = achievements.filter { it.isUnlocked }.take(2)
            val nextAchievement = achievements.firstOrNull { !it.isUnlocked }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Recent Badges",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
                Text(
                    text = "View Hall (${achievements.count { it.isUnlocked }}/${achievements.size})",
                    fontSize = 12.sp,
                    color = GoldAchievement,
                    fontWeight = FontWeight.SemiBold,
                    modifier = Modifier.clickable { onNavigateToAchievements() }
                )
            }
        }

        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                achievements.take(2).forEach { ach ->
                    QuestlyCard(
                        modifier = Modifier
                            .weight(1f)
                            .clickable { onNavigateToAchievements() }
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Icon(
                                    imageVector = Icons.Default.EmojiEvents,
                                    contentDescription = ach.title,
                                    tint = if (ach.isUnlocked) GoldAchievement else TextMuted,
                                    modifier = Modifier.size(18.dp)
                                )
                                Text(
                                    text = if (ach.isUnlocked) "UNLOCKED" else "${ach.currentValue}/${ach.targetValue}",
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (ach.isUnlocked) SuccessGreen else TextMuted
                                )
                            }
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = ach.title,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextPrimary,
                                maxLines = 1
                            )
                            Text(
                                text = ach.description,
                                fontSize = 10.sp,
                                color = TextSecondary,
                                maxLines = 1
                            )
                        }
                    }
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}
