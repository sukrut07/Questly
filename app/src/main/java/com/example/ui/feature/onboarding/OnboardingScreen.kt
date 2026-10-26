package com.example.ui.feature.onboarding

import androidx.compose.animation.AnimatedContent
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
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Code
import androidx.compose.material.icons.filled.FitnessCenter
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.Palette
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.RocketLaunch
import androidx.compose.material.icons.filled.School
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material.icons.filled.Work
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.components.QuestlyCard
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

@Composable
fun OnboardingScreen(
    onFinishOnboarding: () -> Unit,
    modifier: Modifier = Modifier
) {
    var currentStep by remember { mutableIntStateOf(1) }
    val totalSteps = 6

    val selectedFocusAreas = remember {
        mutableStateListOf("Coding & Development", "Study & Learning", "Health & Fitness")
    }
    var dailyTargetMinutes by remember { mutableIntStateOf(60) }
    var pomodoroWorkMinutes by remember { mutableIntStateOf(25) }
    var pomodoroBreakMinutes by remember { mutableIntStateOf(5) }
    var selectedAvatar by remember { mutableStateOf("mage") }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Top navigation bar with step counter & skip
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(top = 16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "STEP $currentStep OF $totalSteps",
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                color = PrimaryViolet,
                letterSpacing = 1.sp
            )
            if (currentStep < totalSteps) {
                TextButton(
                    onClick = onFinishOnboarding,
                    modifier = Modifier.testTag("onboarding_skip_button")
                ) {
                    Text("Skip", color = TextSecondary, fontSize = 14.sp)
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Progress indicators
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            for (step in 1..totalSteps) {
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .height(4.dp)
                        .clip(RoundedCornerShape(2.dp))
                        .background(
                            if (step <= currentStep) PrimaryViolet else DarkElevatedSurface
                        )
                )
            }
        }

        Spacer(modifier = Modifier.height(32.dp))

        // Dynamic step content
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth(),
            contentAlignment = Alignment.Center
        ) {
            when (currentStep) {
                1 -> Step1Welcome()
                2 -> Step2FocusAreas(selectedFocusAreas)
                3 -> Step3DailyGoal(dailyTargetMinutes) { dailyTargetMinutes = it }
                4 -> Step4TimerConfig(
                    pomodoroWorkMinutes,
                    pomodoroBreakMinutes,
                    onWorkChanged = { pomodoroWorkMinutes = it },
                    onBreakChanged = { pomodoroBreakMinutes = it }
                )
                5 -> Step5Avatar(selectedAvatar) { selectedAvatar = it }
                6 -> Step6Ready(dailyTargetMinutes, selectedFocusAreas.size)
            }
        }

        // Bottom CTA controls
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 24.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            if (currentStep > 1) {
                OutlinedButton(
                    onClick = { currentStep-- },
                    modifier = Modifier.testTag("onboarding_back_button"),
                    border = ButtonDefaults.outlinedButtonBorder.copy(
                        brush = Brush.horizontalGradient(listOf(DarkBorder, DarkBorder))
                    )
                ) {
                    Text("Back", color = TextSecondary)
                }
            } else {
                Spacer(modifier = Modifier.width(1.dp))
            }

            Button(
                onClick = {
                    if (currentStep < totalSteps) {
                        currentStep++
                    } else {
                        onFinishOnboarding()
                    }
                },
                modifier = Modifier.testTag("onboarding_next_button"),
                colors = ButtonDefaults.buttonColors(
                    containerColor = PrimaryViolet,
                    contentColor = Color.White
                ),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text(
                    text = if (currentStep == totalSteps) "Enter Questly" else "Continue",
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 2.dp)
                )
            }
        }
    }
}

@Composable
private fun Step1Welcome() {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Box(
            modifier = Modifier
                .size(90.dp)
                .clip(CircleShape)
                .background(Brush.radialGradient(listOf(PrimaryViolet.copy(alpha = 0.35f), Color.Transparent))),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Default.AutoAwesome,
                contentDescription = "Welcome",
                tint = GoldAchievement,
                modifier = Modifier.size(52.dp)
            )
        }

        Spacer(modifier = Modifier.height(24.dp))

        Text(
            text = "Your next level\nstarts today.",
            fontSize = 32.sp,
            fontWeight = FontWeight.Bold,
            color = TextPrimary,
            textAlign = TextAlign.Center,
            lineHeight = 38.sp
        )

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "Turn your goals into quests, build lasting habits, and watch your progress evolve through RPG progression.",
            fontSize = 15.sp,
            color = TextSecondary,
            textAlign = TextAlign.Center,
            lineHeight = 22.sp,
            modifier = Modifier.padding(horizontal = 16.dp)
        )
    }
}

@Composable
private fun Step2FocusAreas(selected: MutableList<String>) {
    val areas = listOf(
        Pair("Coding & Development", Icons.Default.Code),
        Pair("Study & Learning", Icons.Default.School),
        Pair("Health & Fitness", Icons.Default.FitnessCenter),
        Pair("Career & Work", Icons.Default.Work),
        Pair("Reading", Icons.Default.MenuBook),
        Pair("Creativity", Icons.Default.Palette),
        Pair("Personal Goals", Icons.Default.Person)
    )

    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = "Choose your focus areas",
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            color = TextPrimary
        )
        Text(
            text = "Select all realms you want to advance in",
            fontSize = 14.sp,
            color = TextSecondary,
            modifier = Modifier.padding(top = 6.dp, bottom = 20.dp)
        )

        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            horizontalArrangement = Arrangement.spacedBy(10.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            items(areas) { (title, icon) ->
                val isSelected = selected.contains(title)
                QuestlyCard(
                    backgroundColor = if (isSelected) PrimaryViolet.copy(alpha = 0.18f) else DarkCardSurface,
                    borderColor = if (isSelected) PrimaryViolet else DarkBorder,
                    onClick = {
                        if (isSelected) selected.remove(title) else selected.add(title)
                    }
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = icon,
                            contentDescription = title,
                            tint = if (isSelected) PrimaryViolet else TextSecondary,
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = title,
                            fontSize = 12.sp,
                            fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                            color = if (isSelected) TextPrimary else TextSecondary,
                            maxLines = 2
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun Step3DailyGoal(current: Int, onSelect: (Int) -> Unit) {
    val options = listOf(25, 45, 60, 90, 120)

    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = "Set your daily focus goal",
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            color = TextPrimary
        )
        Text(
            text = "Choose a sustainable target for daily deep work",
            fontSize = 14.sp,
            color = TextSecondary,
            modifier = Modifier.padding(top = 6.dp, bottom = 24.dp)
        )

        Column(
            verticalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            options.forEach { minutes ->
                val isSelected = current == minutes
                QuestlyCard(
                    backgroundColor = if (isSelected) SecondaryBlue.copy(alpha = 0.15f) else DarkCardSurface,
                    borderColor = if (isSelected) SecondaryBlue else DarkBorder,
                    onClick = { onSelect(minutes) }
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text(
                                text = "$minutes minutes / day",
                                fontSize = 16.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = TextPrimary
                            )
                            Text(
                                text = when (minutes) {
                                    25 -> "Light & steady: 1 Pomodoro"
                                    45 -> "Focused sprint: ~2 Pomodoros"
                                    60 -> "Recommended balance: 1 hour daily"
                                    90 -> "Deep builder: 1.5 hours daily"
                                    else -> "Intense craft: 2 hours daily"
                                },
                                fontSize = 12.sp,
                                color = TextSecondary
                            )
                        }

                        if (isSelected) {
                            Box(
                                modifier = Modifier
                                    .size(24.dp)
                                    .clip(CircleShape)
                                    .background(SecondaryBlue),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Check,
                                    contentDescription = "Selected",
                                    tint = DarkBackground,
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun Step4TimerConfig(
    workMins: Int,
    breakMins: Int,
    onWorkChanged: (Int) -> Unit,
    onBreakChanged: (Int) -> Unit
) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = "Configure focus intervals",
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            color = TextPrimary
        )
        Text(
            text = "Standard Pomodoro balance promotes high endurance",
            fontSize = 14.sp,
            color = TextSecondary,
            modifier = Modifier.padding(top = 6.dp, bottom = 24.dp)
        )

        QuestlyCard(
            modifier = Modifier.fillMaxWidth(),
            backgroundColor = DarkCardSurface
        ) {
            Column(modifier = Modifier.padding(20.dp)) {
                Text(
                    text = "Focus Block Duration",
                    fontSize = 14.sp,
                    color = TextSecondary
                )
                Spacer(modifier = Modifier.height(10.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    listOf(15, 25, 45, 50).forEach { mins ->
                        val isSelected = workMins == mins
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (isSelected) PrimaryViolet else DarkElevatedSurface)
                                .clickable { onWorkChanged(mins) }
                                .padding(vertical = 10.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "${mins}m",
                                fontWeight = FontWeight.Bold,
                                color = if (isSelected) Color.White else TextSecondary
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                Text(
                    text = "Break Duration",
                    fontSize = 14.sp,
                    color = TextSecondary
                )
                Spacer(modifier = Modifier.height(10.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    listOf(5, 10, 15).forEach { mins ->
                        val isSelected = breakMins == mins
                        Box(
                            modifier = Modifier
                                .weight(1f)
                                .clip(RoundedCornerShape(8.dp))
                                .background(if (isSelected) SuccessGreen else DarkElevatedSurface)
                                .clickable { onBreakChanged(mins) }
                                .padding(vertical = 10.dp),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "${mins}m",
                                fontWeight = FontWeight.Bold,
                                color = if (isSelected) DarkBackground else TextSecondary
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun Step5Avatar(current: String, onSelect: (String) -> Unit) {
    val avatars = listOf(
        Triple("mage", "Arcane Scholar", "Master of deep study and logic quests"),
        Triple("knight", "Focus Guardian", "Resilient habit builder with unshakable streak"),
        Triple("rogue", "Sprint Striker", "Swift execution of high-priority missions"),
        Triple("ranger", "Pathfinder", "Explorer of creative frontiers and novel ideas")
    )

    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = "Select your adventurer persona",
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            color = TextPrimary
        )
        Text(
            text = "Your avatar evolves as you reach new progression stages",
            fontSize = 14.sp,
            color = TextSecondary,
            modifier = Modifier.padding(top = 6.dp, bottom = 20.dp)
        )

        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            avatars.forEach { (id, name, desc) ->
                val isSelected = current == id
                QuestlyCard(
                    backgroundColor = if (isSelected) PrimaryViolet.copy(alpha = 0.15f) else DarkCardSurface,
                    borderColor = if (isSelected) PrimaryViolet else DarkBorder,
                    onClick = { onSelect(id) }
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(44.dp)
                                .clip(CircleShape)
                                .background(if (isSelected) PrimaryViolet else DarkElevatedSurface),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = name.take(2).uppercase(),
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        }
                        Spacer(modifier = Modifier.width(14.dp))
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = name,
                                fontSize = 15.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = TextPrimary
                            )
                            Text(
                                text = desc,
                                fontSize = 12.sp,
                                color = TextSecondary
                            )
                        }
                        if (isSelected) {
                            Icon(
                                imageVector = Icons.Default.Check,
                                contentDescription = "Selected",
                                tint = PrimaryViolet,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun Step6Ready(dailyTarget: Int, focusAreasCount: Int) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Box(
            modifier = Modifier
                .size(80.dp)
                .clip(CircleShape)
                .background(Brush.linearGradient(listOf(SuccessGreen, PrimaryViolet))),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = Icons.Default.RocketLaunch,
                contentDescription = "Ready",
                tint = Color.White,
                modifier = Modifier.size(42.dp)
            )
        }

        Spacer(modifier = Modifier.height(20.dp))

        Text(
            text = "Your Realm Awaits!",
            fontSize = 28.sp,
            fontWeight = FontWeight.Bold,
            color = TextPrimary
        )

        Spacer(modifier = Modifier.height(10.dp))

        Text(
            text = "You're configured as an Explorer with a daily goal of $dailyTarget minutes across $focusAreasCount active domains.",
            fontSize = 14.sp,
            color = TextSecondary,
            textAlign = TextAlign.Center,
            lineHeight = 20.sp,
            modifier = Modifier.padding(horizontal = 20.dp)
        )

        Spacer(modifier = Modifier.height(24.dp))

        QuestlyCard(
            modifier = Modifier.fillMaxWidth(),
            backgroundColor = DarkCardSurface
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text(
                    text = "STARTER MISSION INITIALIZED",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = GoldAchievement,
                    letterSpacing = 1.sp
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Welcome to Questly: Explore the Realm",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = TextPrimary
                )
                Text(
                    text = "3 subtasks waiting for you on your dashboard. Reward: +25 XP",
                    fontSize = 12.sp,
                    color = TextSecondary
                )
            }
        }
    }
}
