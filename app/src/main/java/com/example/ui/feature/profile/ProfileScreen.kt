package com.example.ui.feature.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.Architecture
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Palette
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.core.model.ProgressionStage
import com.example.ui.MainViewModel
import com.example.ui.components.QuestlyCard
import com.example.ui.theme.QuestlyThemeTokens

@Composable
fun ProfileScreen(
    viewModel: MainViewModel,
    onNavigateToSkillTree: () -> Unit,
    onNavigateToAchievements: () -> Unit,
    onNavigateToAnalytics: () -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = QuestlyThemeTokens.colors
    val profile by viewModel.profile.collectAsState()
    val levelInfo by viewModel.levelInfo.collectAsState()
    val streak by viewModel.streak.collectAsState()
    val analytics by viewModel.analytics.collectAsState()
    val cosmetics by viewModel.cosmetics.collectAsState()

    var showEditNameDialog by remember { mutableStateOf(false) }
    var editNameText by remember { mutableStateOf("") }
    var showResetDialog by remember { mutableStateOf(false) }

    // Edit Name Dialog
    if (showEditNameDialog) {
        AlertDialog(
            onDismissRequest = { showEditNameDialog = false },
            title = { Text("Update Adventurer Name", color = colors.primaryText) },
            text = {
                OutlinedTextField(
                    value = editNameText,
                    onValueChange = { editNameText = it },
                    singleLine = true,
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = colors.primaryText,
                        unfocusedTextColor = colors.primaryText,
                        focusedBorderColor = colors.primaryAccent
                    )
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        if (editNameText.isNotBlank()) {
                            viewModel.updateDisplayName(editNameText.trim())
                        }
                        showEditNameDialog = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = colors.primaryAccent)
                ) {
                    Text("Save")
                }
            },
            dismissButton = {
                TextButton(onClick = { showEditNameDialog = false }) {
                    Text("Cancel", color = colors.secondaryText)
                }
            },
            containerColor = colors.cardSurface
        )
    }

    // Reset Confirmation Dialog
    if (showResetDialog) {
        AlertDialog(
            onDismissRequest = { showResetDialog = false },
            icon = {
                Icon(
                    imageVector = Icons.Default.Warning,
                    contentDescription = "Warning",
                    tint = colors.error,
                    modifier = Modifier.size(36.dp)
                )
            },
            title = { Text("Reset Questly Data?", color = colors.primaryText) },
            text = {
                Text(
                    "This action resets all completed quests, focus history, and XP back to initial defaults. Your local preferences will be cleared.",
                    color = colors.secondaryText,
                    fontSize = 13.sp
                )
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.resetAllData()
                        showResetDialog = false
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = colors.error)
                ) {
                    Text("Confirm Reset")
                }
            },
            dismissButton = {
                TextButton(onClick = { showResetDialog = false }) {
                    Text("Cancel", color = colors.secondaryText)
                }
            },
            containerColor = colors.cardSurface
        )
    }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(colors.background)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Spacer(modifier = Modifier.height(8.dp))
            // Profile Card Header
            QuestlyCard(
                modifier = Modifier.fillMaxWidth(),
                backgroundColor = colors.cardSurface,
                borderColor = colors.primaryAccent.copy(alpha = 0.4f)
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(64.dp)
                                .clip(CircleShape)
                                .background(
                                    Brush.radialGradient(
                                        listOf(colors.primaryAccent, colors.elevatedSurface)
                                    )
                                )
                                .border(2.dp, colors.gold, CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = profile.displayName.take(1).uppercase(),
                                fontSize = 26.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        }

                        Spacer(modifier = Modifier.width(16.dp))

                        Column(modifier = Modifier.weight(1f)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = profile.displayName,
                                    fontSize = 20.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = colors.primaryText
                                )
                                IconButton(
                                    onClick = {
                                        editNameText = profile.displayName
                                        showEditNameDialog = true
                                    },
                                    modifier = Modifier.size(24.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Edit,
                                        contentDescription = "Edit name",
                                        tint = colors.mutedText,
                                        modifier = Modifier.size(14.dp)
                                    )
                                }
                            }

                            Text(
                                text = profile.title,
                                fontSize = 12.sp,
                                color = colors.secondaryText
                            )

                            Spacer(modifier = Modifier.height(4.dp))

                            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(colors.primaryAccent.copy(alpha = 0.2f))
                                        .padding(horizontal = 8.dp, vertical = 2.dp)
                                ) {
                                    Text(
                                        text = "LVL ${levelInfo.currentLevel}",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = colors.primaryAccent
                                    )
                                }

                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(colors.secondaryAccent.copy(alpha = 0.2f))
                                        .padding(horizontal = 8.dp, vertical = 2.dp)
                                ) {
                                    Text(
                                        text = profile.currentStage.stageName.uppercase(),
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = colors.secondaryAccent
                                    )
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Text(
                        text = "TOTAL PROGRESSION: ${profile.totalXp} XP",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = colors.gold,
                        letterSpacing = 1.sp
                    )
                    Text(
                        text = levelInfo.nextLevelUnlock,
                        fontSize = 12.sp,
                        color = colors.secondaryText,
                        modifier = Modifier.padding(top = 2.dp)
                    )
                }
            }
        }

        // Lifetime Stats 4-Grid
        item {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    StatCard(
                        title = "Quests Completed",
                        value = "${analytics?.completedQuestsCount ?: 0}",
                        sub = "Lifetime tasks",
                        color = colors.success,
                        modifier = Modifier.weight(1f)
                    )
                    StatCard(
                        title = "Focus Time",
                        value = String.format("%.1fh", analytics?.totalFocusHours ?: 0f),
                        sub = "Deep work sessions",
                        color = colors.primaryAccent,
                        modifier = Modifier.weight(1f)
                    )
                }
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    StatCard(
                        title = "Current Streak",
                        value = "${streak.currentStreak} Days",
                        sub = "Active cadence",
                        color = colors.warning,
                        modifier = Modifier.weight(1f)
                    )
                    StatCard(
                        title = "Longest Streak",
                        value = "${streak.longestStreak} Days",
                        sub = "Personal best",
                        color = colors.gold,
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }

        // Feature Navigation Portals
        item {
            Text(
                text = "Progression Portals",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = colors.primaryText
            )
        }

        item {
            PortalItem(
                title = "Interactive Skill Tree",
                description = "Six skill branches: Focus, Consistency, Planning, Execution...",
                icon = Icons.Default.Architecture,
                color = colors.secondaryAccent,
                onClick = onNavigateToSkillTree
            )
        }

        item {
            PortalItem(
                title = "Hall of Achievements",
                description = "Earn badges, milestone rewards, and cosmetic unlocks",
                icon = Icons.Default.EmojiEvents,
                color = colors.gold,
                onClick = onNavigateToAchievements
            )
        }

        item {
            PortalItem(
                title = "Productivity Intelligence",
                description = "Explainable score formula & category analytics",
                icon = Icons.Default.BarChart,
                color = colors.success,
                onClick = onNavigateToAnalytics
            )
        }

        // Visual Themes & Progression Stage Evolving Cosmetics
        item {
            QuestlyCard(
                modifier = Modifier.fillMaxWidth(),
                backgroundColor = colors.cardSurface,
                borderColor = colors.border
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.Palette,
                            contentDescription = "Themes",
                            tint = colors.primaryAccent,
                            modifier = Modifier.size(18.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Adaptive Themes (Stage Unlocks)",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = colors.primaryText
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    // Dark / Light / System Theme Mode Switcher
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        listOf(
                            Pair("dark", "Dark RPG"),
                            Pair("light", "Light Clean"),
                            Pair("system", "System")
                        ).forEach { (mode, label) ->
                            val isSelected = profile.visualTheme == mode
                            Box(
                                modifier = Modifier
                                    .weight(1f)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(if (isSelected) colors.primaryAccent else colors.elevatedSurface)
                                    .clickable { viewModel.updateTheme(mode) }
                                    .padding(vertical = 8.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = label,
                                    fontSize = 12.sp,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                    color = if (isSelected) Color.White else colors.secondaryText
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))
                    Text(
                        text = "Cosmetic Accents",
                        fontSize = 12.sp,
                        color = colors.secondaryText
                    )
                    Spacer(modifier = Modifier.height(6.dp))

                    LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        items(cosmetics.filter { it.type == "theme" }) { cosmetic ->
                            val isUnlocked = cosmetic.isUnlocked
                            val isSelected = profile.visualTheme == cosmetic.id

                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(colors.elevatedSurface)
                                    .border(
                                        1.dp,
                                        if (isSelected) colors.primaryAccent else colors.border,
                                        RoundedCornerShape(10.dp)
                                    )
                                    .clickable(enabled = isUnlocked) {
                                        viewModel.updateTheme(cosmetic.id)
                                    }
                                    .padding(horizontal = 12.dp, vertical = 8.dp)
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Box(
                                        modifier = Modifier
                                            .size(14.dp)
                                            .clip(CircleShape)
                                            .background(Color(cosmetic.previewColor))
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = cosmetic.name,
                                        fontSize = 12.sp,
                                        color = if (isUnlocked) colors.primaryText else colors.mutedText
                                    )
                                    if (!isUnlocked) {
                                        Spacer(modifier = Modifier.width(6.dp))
                                        Icon(
                                            imageVector = Icons.Default.Lock,
                                            contentDescription = "Locked",
                                            tint = colors.mutedText,
                                            modifier = Modifier.size(12.dp)
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        // Settings / Data Management
        item {
            QuestlyCard(
                modifier = Modifier.fillMaxWidth(),
                backgroundColor = colors.cardSurface,
                borderColor = colors.border
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Data & System",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = colors.primaryText
                    )
                    Spacer(modifier = Modifier.height(10.dp))

                    OutlinedButton(
                        onClick = { showResetDialog = true },
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = colors.error),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("reset_data_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Refresh,
                            contentDescription = "Reset",
                            tint = colors.error,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Reset All Data to Factory State", color = colors.error, fontSize = 12.sp)
                    }
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(48.dp))
        }
    }
}

@Composable
private fun StatCard(
    title: String,
    value: String,
    sub: String,
    color: Color,
    modifier: Modifier = Modifier
) {
    val colors = QuestlyThemeTokens.colors
    QuestlyCard(
        modifier = modifier,
        backgroundColor = colors.cardSurface,
        borderColor = colors.border
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Text(text = title, fontSize = 11.sp, color = colors.secondaryText)
            Text(text = value, fontSize = 18.sp, fontWeight = FontWeight.Bold, color = color)
            Text(text = sub, fontSize = 10.sp, color = colors.mutedText)
        }
    }
}

@Composable
private fun PortalItem(
    title: String,
    description: String,
    icon: ImageVector,
    color: Color,
    onClick: () -> Unit
) {
    val colors = QuestlyThemeTokens.colors
    QuestlyCard(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() },
        backgroundColor = colors.cardSurface,
        borderColor = colors.border
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(color.copy(alpha = 0.15f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = title,
                    tint = color,
                    modifier = Modifier.size(22.dp)
                )
            }

            Spacer(modifier = Modifier.width(14.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    text = title,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = colors.primaryText
                )
                Text(
                    text = description,
                    fontSize = 11.sp,
                    color = colors.secondaryText
                )
            }

            Icon(
                imageVector = Icons.AutoMirrored.Filled.ArrowForward,
                contentDescription = "Open",
                tint = colors.mutedText,
                modifier = Modifier.size(18.dp)
            )
        }
    }
}
