package com.example.ui.feature.profile

import androidx.compose.foundation.background
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
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.MainViewModel
import com.example.ui.components.QuestlyCard
import com.example.ui.theme.QuestlyThemeTokens

@Composable
fun AchievementsScreen(
    viewModel: MainViewModel,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = QuestlyThemeTokens.colors
    val achievements by viewModel.achievements.collectAsState()
    val unlockedCount = achievements.count { it.isUnlocked }

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
                    text = "Hall of Achievements",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = colors.primaryText
                )
                Text(
                    text = "$unlockedCount of ${achievements.size} badges unlocked",
                    fontSize = 12.sp,
                    color = colors.gold
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        LazyColumn(
            modifier = Modifier
                .weight(1f)
                .testTag("achievements_list"),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            items(achievements) { ach ->
                QuestlyCard(
                    modifier = Modifier.fillMaxWidth(),
                    backgroundColor = colors.cardSurface,
                    borderColor = if (ach.isUnlocked) colors.gold.copy(alpha = 0.5f) else colors.border
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(48.dp)
                                .clip(CircleShape)
                                .background(
                                    if (ach.isUnlocked) colors.gold.copy(alpha = 0.2f)
                                    else colors.elevatedSurface
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = if (ach.isUnlocked) Icons.Default.EmojiEvents else Icons.Default.Lock,
                                contentDescription = ach.title,
                                tint = if (ach.isUnlocked) colors.gold else colors.mutedText,
                                modifier = Modifier.size(24.dp)
                            )
                        }

                        Spacer(modifier = Modifier.width(14.dp))

                        Column(modifier = Modifier.weight(1f)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = ach.title,
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (ach.isUnlocked) colors.primaryText else colors.secondaryText
                                )
                                Text(
                                    text = "+${ach.xpReward} XP",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = colors.gold
                                )
                            }

                            Text(
                                text = ach.description,
                                fontSize = 12.sp,
                                color = colors.secondaryText,
                                modifier = Modifier.padding(vertical = 3.dp)
                            )

                            LinearProgressIndicator(
                                progress = { ach.progressPercent },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(4.dp)
                                    .clip(RoundedCornerShape(2.dp)),
                                color = if (ach.isUnlocked) colors.success else colors.secondaryAccent,
                                trackColor = colors.elevatedSurface
                            )

                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(top = 4.dp),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = ach.category.displayName,
                                    fontSize = 10.sp,
                                    color = colors.mutedText
                                )
                                Text(
                                    text = if (ach.isUnlocked) "UNLOCKED" else "${ach.currentValue} / ${ach.targetValue}",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.SemiBold,
                                    color = if (ach.isUnlocked) colors.success else colors.secondaryText
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
