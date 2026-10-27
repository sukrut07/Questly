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
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.Architecture
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Psychology
import androidx.compose.material.icons.filled.SelfImprovement
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.core.model.SkillBranch
import com.example.core.model.SkillNode
import com.example.ui.MainViewModel
import com.example.ui.components.QuestlyCard
import com.example.ui.theme.QuestlyThemeTokens

@Composable
fun SkillTreeScreen(
    viewModel: MainViewModel,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val colors = QuestlyThemeTokens.colors
    val skills by viewModel.skills.collectAsState()
    var selectedBranch by remember { mutableStateOf<SkillBranch?>(null) }

    val filteredSkills = remember(skills, selectedBranch) {
        if (selectedBranch == null) skills else skills.filter { it.branch == selectedBranch }
    }

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
                    text = "Skill Tree & Mastery",
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    color = colors.primaryText
                )
                Text(
                    text = "Unlock nodes through real productivity milestones",
                    fontSize = 12.sp,
                    color = colors.secondaryText
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Branch Selector Chips
        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            item {
                val isAll = selectedBranch == null
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(if (isAll) colors.primaryAccent else colors.elevatedSurface)
                        .clickable { selectedBranch = null }
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = "All Branches",
                        fontSize = 12.sp,
                        fontWeight = if (isAll) FontWeight.Bold else FontWeight.Medium,
                        color = if (isAll) Color.White else colors.secondaryText
                    )
                }
            }

            items(SkillBranch.values()) { branch ->
                val isSelected = selectedBranch == branch
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(if (isSelected) colors.primaryAccent else colors.elevatedSurface)
                        .clickable { selectedBranch = branch }
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = branch.displayName,
                        fontSize = 12.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                        color = if (isSelected) Color.White else colors.secondaryText
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Skills List
        LazyColumn(
            modifier = Modifier
                .weight(1f)
                .testTag("skill_tree_list"),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(filteredSkills) { node ->
                val branchIcon = when (node.branch) {
                    SkillBranch.FOCUS -> Icons.Default.SelfImprovement
                    SkillBranch.CONSISTENCY -> Icons.Default.TrendingUp
                    SkillBranch.PLANNING -> Icons.Default.Architecture
                    SkillBranch.LEARNING -> Icons.Default.Psychology
                    SkillBranch.CREATIVITY -> Icons.Default.AutoAwesome
                    SkillBranch.EXECUTION -> Icons.Default.Bolt
                }

                QuestlyCard(
                    modifier = Modifier.fillMaxWidth(),
                    backgroundColor = colors.cardSurface,
                    borderColor = if (node.isUnlocked) colors.success.copy(alpha = 0.5f) else colors.border
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(44.dp)
                                .clip(CircleShape)
                                .background(
                                    if (node.isUnlocked) colors.success.copy(alpha = 0.2f)
                                    else colors.elevatedSurface
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = if (node.isUnlocked) Icons.Default.Check else branchIcon,
                                contentDescription = node.name,
                                tint = if (node.isUnlocked) colors.success else colors.secondaryAccent,
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
                                    text = node.name,
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = colors.primaryText
                                )
                                Text(
                                    text = if (node.isUnlocked) "UNLOCKED" else "LVL ${node.requiredLevel}",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (node.isUnlocked) colors.success else colors.gold
                                )
                            }

                            Text(
                                text = node.description,
                                fontSize = 12.sp,
                                color = colors.secondaryText,
                                modifier = Modifier.padding(vertical = 4.dp)
                            )

                            // Progress bar
                            LinearProgressIndicator(
                                progress = { node.progressPercent },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(4.dp)
                                    .clip(RoundedCornerShape(2.dp)),
                                color = if (node.isUnlocked) colors.success else colors.primaryAccent,
                                trackColor = colors.elevatedSurface
                            )

                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(top = 4.dp),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text(
                                    text = node.branch.displayName,
                                    fontSize = 10.sp,
                                    color = colors.mutedText
                                )
                                Text(
                                    text = "${node.currentProgress} / ${node.maxProgress}",
                                    fontSize = 10.sp,
                                    color = colors.secondaryText
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}
