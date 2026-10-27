package com.example.ui.feature.profile

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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.core.model.QuestCategory
import com.example.ui.MainViewModel
import com.example.ui.components.QuestlyCard
import com.example.ui.theme.QuestlyThemeTokens

@Composable
fun AnalyticsScreen(
    viewModel: MainViewModel,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = QuestlyThemeTokens.colors
    val analytics by viewModel.analytics.collectAsState()
    var selectedRange by remember { mutableStateOf("7 Days") }
    val ranges = listOf("7 Days", "30 Days", "90 Days")

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(colors.background)
            .padding(16.dp)
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBack) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                    contentDescription = "Back",
                    tint = colors.primaryText
                )
            }
            Spacer(modifier = Modifier.width(8.dp))
            Column {
                Text(
                    text = "Productivity Intelligence",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = colors.primaryText
                )
                Text(
                    text = "Explainable metrics comparing you against your own goals",
                    fontSize = 12.sp,
                    color = colors.secondaryText
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Range selector
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            ranges.forEach { range ->
                val isSelected = selectedRange == range
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(8.dp))
                        .background(if (isSelected) colors.primaryAccent else colors.elevatedSurface)
                        .clickable { selectedRange = range }
                        .padding(vertical = 8.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = range,
                        fontSize = 12.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                        color = if (isSelected) Color.White else colors.secondaryText
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        LazyColumn(
            modifier = Modifier
                .weight(1f)
                .testTag("analytics_column"),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Productivity Score Breakdown Card
            item {
                val score = analytics?.productivityScore
                QuestlyCard(
                    modifier = Modifier.fillMaxWidth(),
                    backgroundColor = colors.cardSurface,
                    borderColor = colors.primaryAccent.copy(alpha = 0.4f)
                ) {
                    Column(modifier = Modifier.padding(18.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = "PRODUCTIVITY SCORE",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = colors.primaryAccent,
                                    letterSpacing = 1.sp
                                )
                                Text(
                                    text = "${score?.totalScore ?: 85} / 100",
                                    fontSize = 26.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = colors.primaryText
                                )
                            }

                            Box(
                                modifier = Modifier
                                    .size(54.dp)
                                    .clip(CircleShape)
                                    .background(colors.primaryAccent.copy(alpha = 0.15f)),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = "${score?.totalScore ?: 85}",
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = colors.primaryAccent
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        Text(
                            text = score?.formulaExplanation ?: "Score = 0.35C + 0.30F + 0.20G + 0.15S",
                            fontSize = 11.sp,
                            color = colors.mutedText
                        )

                        Spacer(modifier = Modifier.height(14.dp))

                        // Component bars
                        ScoreComponentBar("C: Task Completion (35%)", score?.completionScore ?: 80f, colors.success)
                        Spacer(modifier = Modifier.height(8.dp))
                        ScoreComponentBar("F: Focus Duration (30%)", score?.focusScore ?: 70f, colors.secondaryAccent)
                        Spacer(modifier = Modifier.height(8.dp))
                        ScoreComponentBar("G: Goal Execution (20%)", score?.goalScore ?: 75f, colors.gold)
                        Spacer(modifier = Modifier.height(8.dp))
                        ScoreComponentBar("S: Streak Cadence (15%)", score?.streakScore ?: 85f, colors.warning)
                    }
                }
            }

            // Summary stats grid
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    QuestlyCard(
                        modifier = Modifier.weight(1f),
                        backgroundColor = colors.cardSurface,
                        borderColor = colors.border
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Text(text = "Total Focus", fontSize = 11.sp, color = colors.secondaryText)
                            Text(
                                text = String.format("%.1fh", analytics?.totalFocusHours ?: 0f),
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = colors.primaryText
                            )
                            Text(text = "Verified sessions", fontSize = 10.sp, color = colors.mutedText)
                        }
                    }

                    QuestlyCard(
                        modifier = Modifier.weight(1f),
                        backgroundColor = colors.cardSurface,
                        borderColor = colors.border
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Text(text = "Completion Rate", fontSize = 11.sp, color = colors.secondaryText)
                            Text(
                                text = "${analytics?.completionRatePercent?.toInt() ?: 0}%",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = colors.success
                            )
                            Text(text = "${analytics?.completedQuestsCount ?: 0} quests done", fontSize = 10.sp, color = colors.mutedText)
                        }
                    }

                    QuestlyCard(
                        modifier = Modifier.weight(1f),
                        backgroundColor = colors.cardSurface,
                        borderColor = colors.border
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Text(text = "Streak Record", fontSize = 11.sp, color = colors.secondaryText)
                            Text(
                                text = "${analytics?.longestStreakDays ?: 1}d",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.Bold,
                                color = colors.warning
                            )
                            Text(text = "Personal best", fontSize = 10.sp, color = colors.mutedText)
                        }
                    }
                }
            }

            // Category breakdown
            item {
                QuestlyCard(
                    modifier = Modifier.fillMaxWidth(),
                    backgroundColor = colors.cardSurface,
                    borderColor = colors.border
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "Category Distribution",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = colors.primaryText
                        )
                        Spacer(modifier = Modifier.height(12.dp))

                        val dist = analytics?.categoryDistribution ?: emptyMap()
                        if (dist.isEmpty()) {
                            Text(text = "No category data recorded yet.", fontSize = 12.sp, color = colors.secondaryText)
                        } else {
                            dist.forEach { (cat, count) ->
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 4.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Text(text = cat.displayName, fontSize = 13.sp, color = colors.secondaryText)
                                    Text(text = "$count quests", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = colors.primaryAccent)
                                }
                            }
                        }
                    }
                }
            }

            item {
                Spacer(modifier = Modifier.height(24.dp))
            }
        }
    }
}

@Composable
private fun ScoreComponentBar(label: String, value: Float, color: Color) {
    val colors = QuestlyThemeTokens.colors
    Column {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(text = label, fontSize = 11.sp, color = colors.secondaryText)
            Text(text = "${value.toInt()}%", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = color)
        }
        Spacer(modifier = Modifier.height(3.dp))
        LinearProgressIndicator(
            progress = { (value / 100f).coerceIn(0f, 1f) },
            modifier = Modifier
                .fillMaxWidth()
                .height(4.dp)
                .clip(RoundedCornerShape(2.dp)),
            color = color,
            trackColor = colors.elevatedSurface
        )
    }
}
