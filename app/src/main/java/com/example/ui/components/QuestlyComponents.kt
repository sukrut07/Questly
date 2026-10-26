package com.example.ui.components

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Code
import androidx.compose.material.icons.filled.FitnessCenter
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.Palette
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.Stars
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material.icons.filled.Work
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.core.model.ProgressionStage
import com.example.core.model.Quest
import com.example.core.model.QuestCategory
import com.example.core.model.QuestDifficulty
import com.example.core.model.QuestPriority
import com.example.core.model.QuestStatus
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
import com.example.ui.theme.WarningOrange

import com.example.ui.theme.QuestlyThemeTokens

@Composable
fun QuestlyCard(
    modifier: Modifier = Modifier,
    backgroundColor: Color = QuestlyThemeTokens.colors.cardSurface,
    borderColor: Color = QuestlyThemeTokens.colors.border,
    onClick: (() -> Unit)? = null,
    content: @Composable () -> Unit
) {
    val shape = RoundedCornerShape(20.dp)
    Surface(
        modifier = modifier
            .clip(shape)
            .border(1.dp, borderColor, shape)
            .then(if (onClick != null) Modifier.clickable { onClick() } else Modifier),
        color = backgroundColor,
        shape = shape
    ) {
        content()
    }
}

@Composable
fun XpProgressBar(
    level: Int,
    currentXp: Int,
    requiredXp: Int,
    progressPercent: Float,
    stage: ProgressionStage,
    modifier: Modifier = Modifier
) {
    val colors = QuestlyThemeTokens.colors
    val animatedProgress by animateFloatAsState(targetValue = progressPercent, label = "xp_progress")

    QuestlyCard(
        modifier = modifier.fillMaxWidth(),
        backgroundColor = colors.cardSurface,
        borderColor = colors.primaryAccent.copy(alpha = 0.35f)
    ) {
        Column(modifier = Modifier.padding(18.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(8.dp))
                            .background(Brush.horizontalGradient(listOf(colors.primaryAccent, colors.secondaryAccent)))
                            .padding(horizontal = 8.dp, vertical = 4.dp)
                    ) {
                        Text(
                            text = "LVL ${level.toString().padStart(2, '0')}",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        text = stage.stageName.uppercase(),
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = colors.secondaryAccent,
                        letterSpacing = 1.sp
                    )
                }
                Text(
                    text = "$currentXp / $requiredXp XP",
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Medium,
                    color = colors.secondaryText
                )
            }

            Spacer(modifier = Modifier.height(10.dp))

            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(8.dp)
                    .clip(RoundedCornerShape(4.dp))
                    .background(colors.elevatedSurface)
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth(animatedProgress)
                        .height(8.dp)
                        .clip(RoundedCornerShape(4.dp))
                        .background(
                            Brush.horizontalGradient(
                                listOf(colors.primaryAccent, colors.secondaryAccent, colors.success)
                            )
                        )
                )
            }

            Spacer(modifier = Modifier.height(6.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "${(animatedProgress * 100).toInt()}% towards Level ${level + 1}",
                    fontSize = 11.sp,
                    color = colors.mutedText
                )
                Text(
                    text = "+${(requiredXp - currentXp).coerceAtLeast(0)} XP needed",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = colors.primaryAccent
                )
            }
        }
    }
}

@Composable
fun StreakFlameBadge(
    currentStreak: Int,
    longestStreak: Int,
    modifier: Modifier = Modifier
) {
    val colors = QuestlyThemeTokens.colors
    QuestlyCard(
        modifier = modifier,
        backgroundColor = colors.cardSurface,
        borderColor = colors.warning.copy(alpha = 0.4f)
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(CircleShape)
                    .background(colors.warning.copy(alpha = 0.15f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.LocalFireDepartment,
                    contentDescription = "Streak flame",
                    tint = colors.warning,
                    modifier = Modifier.size(22.dp)
                )
            }
            Spacer(modifier = Modifier.width(10.dp))
            Column {
                Text(
                    text = "$currentStreak Day Streak",
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    color = colors.primaryText
                )
                Text(
                    text = "Best: $longestStreak days",
                    fontSize = 11.sp,
                    color = colors.secondaryText
                )
            }
        }
    }
}

@Composable
fun CategoryBadge(category: QuestCategory, modifier: Modifier = Modifier) {
    val colors = QuestlyThemeTokens.colors
    val icon = when (category) {
        QuestCategory.CODING -> Icons.Default.Code
        QuestCategory.STUDY -> Icons.Default.School
        QuestCategory.WORK -> Icons.Default.Work
        QuestCategory.FITNESS -> Icons.Default.FitnessCenter
        QuestCategory.READING -> Icons.Default.MenuBook
        QuestCategory.CREATIVITY -> Icons.Default.Palette
        QuestCategory.PERSONAL -> Icons.Default.Person
        QuestCategory.CUSTOM -> Icons.Default.Stars
    }

    Row(
        modifier = modifier
            .clip(RoundedCornerShape(6.dp))
            .background(colors.elevatedSurface)
            .padding(horizontal = 6.dp, vertical = 2.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(
            imageVector = icon,
            contentDescription = category.displayName,
            tint = colors.secondaryAccent,
            modifier = Modifier.size(12.dp)
        )
        Spacer(modifier = Modifier.width(4.dp))
        Text(
            text = category.displayName,
            fontSize = 10.sp,
            color = colors.secondaryText,
            fontWeight = FontWeight.Medium
        )
    }
}

@Composable
fun DifficultyBadge(difficulty: QuestDifficulty, modifier: Modifier = Modifier) {
    val colors = QuestlyThemeTokens.colors
    val color = when (difficulty) {
        QuestDifficulty.EASY -> colors.success
        QuestDifficulty.MEDIUM -> colors.secondaryAccent
        QuestDifficulty.HARD -> colors.warning
        QuestDifficulty.EPIC -> colors.gold
    }

    Text(
        text = difficulty.displayName.uppercase(),
        fontSize = 10.sp,
        fontWeight = FontWeight.Bold,
        color = color,
        modifier = modifier
            .clip(RoundedCornerShape(4.dp))
            .background(color.copy(alpha = 0.15f))
            .padding(horizontal = 6.dp, vertical = 2.dp)
    )
}

@Composable
fun QuestItemCard(
    quest: Quest,
    onCompleteToggle: () -> Unit,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = QuestlyThemeTokens.colors
    val isCompleted = quest.status == QuestStatus.COMPLETED

    QuestlyCard(
        modifier = modifier
            .fillMaxWidth()
            .testTag("quest_card_${quest.id}"),
        onClick = onClick,
        backgroundColor = if (isCompleted) colors.cardSurface.copy(alpha = 0.65f) else colors.cardSurface,
        borderColor = if (isCompleted) colors.success.copy(alpha = 0.35f) else colors.border
    ) {
        Row(
            modifier = Modifier.padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Checkmark button
            Box(
                modifier = Modifier
                    .size(28.dp)
                    .clip(CircleShape)
                    .background(if (isCompleted) colors.success else colors.elevatedSurface)
                    .border(
                        1.dp,
                        if (isCompleted) colors.success else colors.primaryAccent.copy(alpha = 0.5f),
                        CircleShape
                    )
                    .clickable { onCompleteToggle() }
                    .testTag("quest_check_${quest.id}"),
                contentAlignment = Alignment.Center
            ) {
                if (isCompleted) {
                    Icon(
                        imageVector = Icons.Default.Check,
                        contentDescription = "Completed",
                        tint = if (colors.isDark) colors.background else Color.White,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    CategoryBadge(category = quest.category)
                    DifficultyBadge(difficulty = quest.difficulty)
                    if (quest.priority == QuestPriority.URGENT) {
                        Text(
                            text = "URGENT",
                            fontSize = 9.sp,
                            fontWeight = FontWeight.Bold,
                            color = colors.error,
                            modifier = Modifier
                                .clip(RoundedCornerShape(4.dp))
                                .background(colors.error.copy(alpha = 0.15f))
                                .padding(horizontal = 5.dp, vertical = 1.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = quest.title,
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 15.sp,
                    color = if (isCompleted) colors.mutedText else colors.primaryText,
                    textDecoration = if (isCompleted) TextDecoration.LineThrough else TextDecoration.None,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )

                if (quest.description.isNotEmpty()) {
                    Spacer(modifier = Modifier.height(2.dp))
                    Text(
                        text = quest.description,
                        fontSize = 12.sp,
                        color = colors.secondaryText,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }

                Spacer(modifier = Modifier.height(6.dp))

                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Timer,
                            contentDescription = "Duration",
                            tint = colors.mutedText,
                            modifier = Modifier.size(12.dp)
                        )
                        Spacer(modifier = Modifier.width(3.dp))
                        Text(
                            text = "${quest.estimatedMinutes}m",
                            fontSize = 11.sp,
                            color = colors.mutedText
                        )
                    }

                    Text(
                        text = "+${quest.xpReward} XP",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = if (isCompleted) colors.success else colors.gold
                    )
                }
            }
        }
    }
}
