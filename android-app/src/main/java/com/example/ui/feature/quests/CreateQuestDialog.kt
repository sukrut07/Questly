package com.example.ui.feature.quests

import androidx.compose.foundation.background
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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateListOf
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
import androidx.compose.ui.window.Dialog
import com.example.core.domain.XpProgressionEngine
import com.example.core.model.QuestCategory
import com.example.core.model.QuestDifficulty
import com.example.core.model.QuestPriority
import com.example.ui.theme.QuestlyThemeTokens

@Composable
fun CreateQuestDialog(
    onDismiss: () -> Unit,
    onCreateQuest: (
        title: String,
        description: String,
        category: QuestCategory,
        difficulty: QuestDifficulty,
        priority: QuestPriority,
        estimatedMinutes: Int,
        subtasks: List<String>
    ) -> Unit
) {
    val colors = QuestlyThemeTokens.colors
    var title by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf(QuestCategory.CODING) }
    var selectedDifficulty by remember { mutableStateOf(QuestDifficulty.MEDIUM) }
    var selectedPriority by remember { mutableStateOf(QuestPriority.MEDIUM) }
    var estimatedMinutes by remember { mutableIntStateOf(30) }
    var subtaskInput by remember { mutableStateOf("") }
    val subtasks = remember { mutableStateListOf<String>() }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    val calculatedXp = remember(selectedDifficulty, estimatedMinutes) {
        XpProgressionEngine.calculateQuestXp(selectedDifficulty, estimatedMinutes)
    }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(24.dp))
                .testTag("create_quest_dialog"),
            color = colors.cardSurface
        ) {
            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Craft New Quest",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = colors.primaryText
                    )
                    IconButton(onClick = onDismiss) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Close",
                            tint = colors.secondaryText
                        )
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Title Input
                OutlinedTextField(
                    value = title,
                    onValueChange = {
                        title = it
                        if (it.isNotBlank()) errorMessage = null
                    },
                    label = { Text("Quest Title", color = colors.secondaryText) },
                    placeholder = { Text("e.g. Build authentication flow", color = colors.mutedText) },
                    singleLine = true,
                    isError = errorMessage != null,
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("quest_title_input"),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = colors.primaryText,
                        unfocusedTextColor = colors.primaryText,
                        focusedBorderColor = colors.primaryAccent,
                        unfocusedBorderColor = colors.border,
                        focusedContainerColor = colors.elevatedSurface.copy(alpha = 0.5f),
                        unfocusedContainerColor = colors.elevatedSurface.copy(alpha = 0.5f)
                    )
                )

                if (errorMessage != null) {
                    Text(
                        text = errorMessage!!,
                        color = colors.error,
                        fontSize = 12.sp,
                        modifier = Modifier.padding(top = 4.dp)
                    )
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Description Input
                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text("Description & Objectives (Optional)", color = colors.secondaryText) },
                    maxLines = 3,
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = colors.primaryText,
                        unfocusedTextColor = colors.primaryText,
                        focusedBorderColor = colors.primaryAccent,
                        unfocusedBorderColor = colors.border,
                        focusedContainerColor = colors.elevatedSurface.copy(alpha = 0.5f),
                        unfocusedContainerColor = colors.elevatedSurface.copy(alpha = 0.5f)
                    )
                )

                Spacer(modifier = Modifier.height(16.dp))

                // Category Selector
                Text(
                    text = "Category Realm",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = colors.secondaryText
                )
                Spacer(modifier = Modifier.height(6.dp))
                LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(QuestCategory.values()) { cat ->
                        val isSelected = selectedCategory == cat
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (isSelected) colors.primaryAccent else colors.elevatedSurface)
                                .clickable { selectedCategory = cat }
                                .padding(horizontal = 10.dp, vertical = 6.dp)
                        ) {
                            Text(
                                text = cat.displayName,
                                fontSize = 11.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                color = if (isSelected) Color.White else colors.secondaryText
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Difficulty Selector
                Text(
                    text = "Difficulty Tier",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = colors.secondaryText
                )
                Spacer(modifier = Modifier.height(6.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    QuestDifficulty.values().forEach { diff ->
                        val isSelected = selectedDifficulty == diff
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (isSelected) colors.secondaryAccent else colors.elevatedSurface)
                                .clickable { selectedDifficulty = diff }
                                .padding(vertical = 8.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = diff.displayName,
                                fontSize = 11.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                color = if (isSelected) Color.White else colors.secondaryText
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Priority Selector
                Text(
                    text = "Priority Level",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = colors.secondaryText
                )
                Spacer(modifier = Modifier.height(6.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    QuestPriority.values().forEach { prio ->
                        val isSelected = selectedPriority == prio
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (isSelected) colors.gold else colors.elevatedSurface)
                                .clickable { selectedPriority = prio }
                                .padding(vertical = 8.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = prio.displayName,
                                fontSize = 11.sp,
                                fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                color = if (isSelected) Color(0xFF181D2C) else colors.secondaryText
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Estimated Duration & XP Reward preview
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Estimated Duration",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = colors.secondaryText
                        )
                        Row(horizontalArrangement = Arrangement.spacedBy(6.dp), modifier = Modifier.padding(top = 4.dp)) {
                            listOf(15, 30, 45, 60, 90).forEach { mins ->
                                val isSelected = estimatedMinutes == mins
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(if (isSelected) colors.primaryAccent else colors.elevatedSurface)
                                        .clickable { estimatedMinutes = mins }
                                        .padding(horizontal = 8.dp, vertical = 4.dp)
                                ) {
                                    Text(
                                        text = "${mins}m",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = if (isSelected) Color.White else colors.secondaryText
                                    )
                                }
                            }
                        }
                    }

                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(10.dp))
                            .background(colors.gold.copy(alpha = 0.18f))
                            .padding(horizontal = 12.dp, vertical = 8.dp),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "+$calculatedXp XP",
                            fontSize = 15.sp,
                            fontWeight = FontWeight.Bold,
                            color = colors.gold
                        )
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Subtasks Section
                Text(
                    text = "Subtasks / Milestones",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = colors.secondaryText
                )
                Spacer(modifier = Modifier.height(6.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedTextField(
                        value = subtaskInput,
                        onValueChange = { subtaskInput = it },
                        placeholder = { Text("Add subtask step...", color = colors.mutedText) },
                        singleLine = true,
                        modifier = Modifier.weight(1f),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = colors.primaryText,
                            unfocusedTextColor = colors.primaryText,
                            focusedBorderColor = colors.secondaryAccent,
                            unfocusedBorderColor = colors.border,
                            focusedContainerColor = colors.elevatedSurface.copy(alpha = 0.5f),
                            unfocusedContainerColor = colors.elevatedSurface.copy(alpha = 0.5f)
                        )
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    IconButton(
                        onClick = {
                            if (subtaskInput.isNotBlank()) {
                                subtasks.add(subtaskInput.trim())
                                subtaskInput = ""
                            }
                        }
                    ) {
                        Icon(
                            imageVector = Icons.Default.Add,
                            contentDescription = "Add subtask",
                            tint = colors.secondaryAccent
                        )
                    }
                }

                if (subtasks.isNotEmpty()) {
                    Spacer(modifier = Modifier.height(8.dp))
                    subtasks.forEachIndexed { index, item ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 2.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "• $item",
                                fontSize = 12.sp,
                                color = colors.secondaryText,
                                modifier = Modifier.weight(1f)
                            )
                            IconButton(
                                onClick = { subtasks.removeAt(index) },
                                modifier = Modifier.size(24.dp)
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Close,
                                    contentDescription = "Remove",
                                    tint = colors.mutedText,
                                    modifier = Modifier.size(14.dp)
                                )
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Save button
                Button(
                    onClick = {
                        if (title.isBlank()) {
                            errorMessage = "Please enter a quest title."
                        } else {
                            onCreateQuest(
                                title.trim(),
                                description.trim(),
                                selectedCategory,
                                selectedDifficulty,
                                selectedPriority,
                                estimatedMinutes,
                                subtasks.toList()
                            )
                            onDismiss()
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("save_quest_button"),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = colors.primaryAccent,
                        contentColor = Color.White
                    ),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text("Commission Quest", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                }
            }
        }
    }
}
