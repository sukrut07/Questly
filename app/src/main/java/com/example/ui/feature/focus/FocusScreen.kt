package com.example.ui.feature.focus

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.Canvas
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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Stop
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.example.core.domain.XpProgressionEngine
import com.example.core.model.FocusMode
import com.example.core.model.Quest
import com.example.core.model.TimerState
import com.example.ui.MainViewModel
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
import com.example.ui.theme.WarningOrange
import kotlinx.coroutines.delay

@Composable
fun FocusScreen(
    viewModel: MainViewModel,
    modifier: Modifier = Modifier
) {
    val activeQuests by viewModel.activeQuests.collectAsState()

    var selectedMode by remember { mutableStateOf(FocusMode.POMODORO) }
    var selectedQuest by remember { mutableStateOf<Quest?>(null) }
    var timerState by remember { mutableStateOf(TimerState.IDLE) }

    // Persistent timestamp state
    var totalPlannedSeconds by remember { mutableIntStateOf(25 * 60) }
    var remainingSeconds by remember { mutableIntStateOf(25 * 60) }
    var elapsedSeconds by remember { mutableIntStateOf(0) }
    var startTimestamp by remember { mutableLongStateOf(0L) }
    var accumulatedPausedMillis by remember { mutableLongStateOf(0L) }
    var lastPauseTimestamp by remember { mutableLongStateOf(0L) }

    var showCompletionDialog by remember { mutableStateOf(false) }
    var sessionNotes by remember { mutableStateOf("") }
    var earnedXpThisSession by remember { mutableIntStateOf(0) }

    // Mode switch resets timer when idle
    fun switchMode(mode: FocusMode) {
        if (timerState == TimerState.IDLE) {
            selectedMode = mode
            val secs = when (mode) {
                FocusMode.POMODORO -> 25 * 60
                FocusMode.SHORT_BREAK -> 5 * 60
                FocusMode.LONG_BREAK -> 15 * 60
                FocusMode.STOPWATCH -> 0
                FocusMode.CUSTOM -> 45 * 60
            }
            totalPlannedSeconds = secs
            remainingSeconds = secs
            elapsedSeconds = 0
        }
    }

    // Timer ticking logic based on real elapsed time
    LaunchedEffect(timerState) {
        if (timerState == TimerState.RUNNING) {
            while (timerState == TimerState.RUNNING) {
                delay(500)
                val now = System.currentTimeMillis()
                val totalActiveDurationMillis = (now - startTimestamp) - accumulatedPausedMillis
                val currentElapsed = (totalActiveDurationMillis / 1000).toInt().coerceAtLeast(0)
                elapsedSeconds = currentElapsed

                if (selectedMode == FocusMode.STOPWATCH) {
                    remainingSeconds = currentElapsed
                } else {
                    val remaining = totalPlannedSeconds - currentElapsed
                    if (remaining <= 0) {
                        remainingSeconds = 0
                        timerState = TimerState.COMPLETED
                        val xp = XpProgressionEngine.calculateFocusXp(totalPlannedSeconds / 60)
                        earnedXpThisSession = xp
                        showCompletionDialog = true
                    } else {
                        remainingSeconds = remaining
                    }
                }
            }
        }
    }

    // Completion dialog
    if (showCompletionDialog) {
        Dialog(onDismissRequest = { showCompletionDialog = false }) {
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(24.dp))
                    .testTag("focus_completion_dialog"),
                color = DarkCardSurface
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Box(
                        modifier = Modifier
                            .size(60.dp)
                            .clip(CircleShape)
                            .background(GoldAchievement.copy(alpha = 0.2f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.EmojiEvents,
                            contentDescription = "Completed",
                            tint = GoldAchievement,
                            modifier = Modifier.size(34.dp)
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    Text(
                        text = "Session Complete!",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )

                    Text(
                        text = "Focused for ${elapsedSeconds / 60} mins${selectedQuest?.let { " on ${it.title}" } ?: ""}",
                        fontSize = 13.sp,
                        color = TextSecondary,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(top = 4.dp)
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(12.dp))
                            .background(PrimaryViolet.copy(alpha = 0.15f))
                            .padding(horizontal = 16.dp, vertical = 8.dp)
                    ) {
                        Text(
                            text = "+$earnedXpThisSession XP Earned",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = PrimaryViolet
                        )
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    OutlinedTextField(
                        value = sessionNotes,
                        onValueChange = { sessionNotes = it },
                        placeholder = { Text("Reflection notes (e.g. key breakthroughs)...", color = TextMuted, fontSize = 12.sp) },
                        maxLines = 2,
                        modifier = Modifier.fillMaxWidth(),
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary,
                            focusedBorderColor = PrimaryViolet,
                            unfocusedBorderColor = DarkBorder
                        )
                    )

                    Spacer(modifier = Modifier.height(20.dp))

                    Button(
                        onClick = {
                            viewModel.recordFocusSession(
                                questId = selectedQuest?.id,
                                questTitle = selectedQuest?.title,
                                mode = selectedMode,
                                plannedSeconds = totalPlannedSeconds,
                                elapsedSeconds = elapsedSeconds,
                                isCompleted = true,
                                notes = sessionNotes
                            )
                            showCompletionDialog = false
                            timerState = TimerState.IDLE
                            switchMode(selectedMode)
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = PrimaryViolet,
                            contentColor = Color.White
                        ),
                        modifier = Modifier
                            .fillMaxWidth()
                            .testTag("save_focus_session_button"),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("Claim Rewards & Continue", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(8.dp))

        Text(
            text = "Focus Chamber",
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            color = TextPrimary
        )
        Text(
            text = "Deep work sessions yield XP and build cognitive mastery",
            fontSize = 12.sp,
            color = TextSecondary,
            modifier = Modifier.padding(top = 4.dp, bottom = 16.dp)
        )

        // Mode Selector Chips
        LazyRow(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(FocusMode.values()) { mode ->
                val isSelected = selectedMode == mode
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(10.dp))
                        .background(if (isSelected) PrimaryViolet else DarkElevatedSurface)
                        .clickable(enabled = timerState == TimerState.IDLE) { switchMode(mode) }
                        .padding(horizontal = 12.dp, vertical = 8.dp)
                ) {
                    Text(
                        text = mode.displayName,
                        fontSize = 12.sp,
                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                        color = if (isSelected) Color.White else TextSecondary
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Linked Quest Picker
        if (activeQuests.isNotEmpty()) {
            QuestlyCard(
                modifier = Modifier.fillMaxWidth(),
                backgroundColor = DarkCardSurface
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = "LINKED QUEST",
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            color = SecondaryBlue,
                            letterSpacing = 0.5.sp
                        )
                        Text(
                            text = selectedQuest?.title ?: "Select active quest (optional)",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = TextPrimary,
                            maxLines = 1
                        )
                    }

                    if (selectedQuest != null && timerState == TimerState.IDLE) {
                        IconButton(onClick = { selectedQuest = null }) {
                            Icon(
                                imageVector = Icons.Default.Close,
                                contentDescription = "Unlink",
                                tint = TextMuted,
                                modifier = Modifier.size(16.dp)
                            )
                        }
                    } else if (timerState == TimerState.IDLE) {
                        LazyRow(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            items(activeQuests.take(2)) { q ->
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(DarkElevatedSurface)
                                        .clickable { selectedQuest = q }
                                        .padding(horizontal = 8.dp, vertical = 4.dp)
                                ) {
                                    Text(
                                        text = q.title.take(12) + "...",
                                        fontSize = 11.sp,
                                        color = PrimaryViolet
                                    )
                                }
                            }
                        }
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(28.dp))

        // Large Circular Countdown Ring
        val progress = if (selectedMode == FocusMode.STOPWATCH) {
            ((elapsedSeconds % 60) / 60f)
        } else {
            if (totalPlannedSeconds > 0) {
                1f - (remainingSeconds.toFloat() / totalPlannedSeconds.toFloat())
            } else 0f
        }
        val animatedProgress by animateFloatAsState(targetValue = progress, label = "timer_progress")

        val mins = remainingSeconds / 60
        val secs = remainingSeconds % 60
        val timeDisplay = String.format("%02d:%02d", mins, secs)

        Box(
            modifier = Modifier
                .size(240.dp)
                .testTag("focus_circular_timer"),
            contentAlignment = Alignment.Center
        ) {
            Canvas(modifier = Modifier.fillMaxSize()) {
                val strokeWidth = 14.dp.toPx()
                // Track
                drawCircle(
                    color = DarkElevatedSurface,
                    radius = (size.minDimension - strokeWidth) / 2f,
                    style = Stroke(width = strokeWidth)
                )
                // Progress Arc
                drawArc(
                    brush = Brush.sweepGradient(
                        listOf(PrimaryViolet, SecondaryBlue, SuccessGreen, PrimaryViolet)
                    ),
                    startAngle = -90f,
                    sweepAngle = 360f * animatedProgress,
                    useCenter = false,
                    style = Stroke(width = strokeWidth, cap = StrokeCap.Round)
                )
            }

            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text(
                    text = timeDisplay,
                    fontSize = 44.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary,
                    letterSpacing = 1.sp
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = when (timerState) {
                        TimerState.IDLE -> "READY"
                        TimerState.RUNNING -> "FOCUSING"
                        TimerState.PAUSED -> "PAUSED"
                        TimerState.COMPLETED -> "VICTORY"
                    },
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                    color = when (timerState) {
                        TimerState.RUNNING -> SuccessGreen
                        TimerState.PAUSED -> WarningOrange
                        TimerState.COMPLETED -> GoldAchievement
                        else -> PrimaryViolet
                    },
                    letterSpacing = 1.5.sp
                )
            }
        }

        Spacer(modifier = Modifier.height(36.dp))

        // Action Controls (Start, Pause, Resume, End, Cancel)
        Row(
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            when (timerState) {
                TimerState.IDLE -> {
                    Button(
                        onClick = {
                            startTimestamp = System.currentTimeMillis()
                            accumulatedPausedMillis = 0L
                            lastPauseTimestamp = 0L
                            timerState = TimerState.RUNNING
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = PrimaryViolet,
                            contentColor = Color.White
                        ),
                        shape = CircleShape,
                        modifier = Modifier
                            .size(68.dp)
                            .testTag("focus_start_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.PlayArrow,
                            contentDescription = "Start",
                            modifier = Modifier.size(34.dp)
                        )
                    }
                }
                TimerState.RUNNING -> {
                    // Pause Button
                    Button(
                        onClick = {
                            lastPauseTimestamp = System.currentTimeMillis()
                            timerState = TimerState.PAUSED
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = WarningOrange,
                            contentColor = DarkBackground
                        ),
                        shape = CircleShape,
                        modifier = Modifier
                            .size(64.dp)
                            .testTag("focus_pause_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.Pause,
                            contentDescription = "Pause",
                            modifier = Modifier.size(28.dp)
                        )
                    }

                    // Complete / End Early Button
                    OutlinedButton(
                        onClick = {
                            val xp = XpProgressionEngine.calculateFocusXp(elapsedSeconds / 60)
                            earnedXpThisSession = xp
                            showCompletionDialog = true
                            timerState = TimerState.COMPLETED
                        },
                        shape = CircleShape,
                        modifier = Modifier.size(52.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Check,
                            contentDescription = "Finish",
                            tint = SuccessGreen
                        )
                    }
                }
                TimerState.PAUSED -> {
                    // Resume Button
                    Button(
                        onClick = {
                            if (lastPauseTimestamp > 0) {
                                accumulatedPausedMillis += (System.currentTimeMillis() - lastPauseTimestamp)
                            }
                            timerState = TimerState.RUNNING
                        },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = SuccessGreen,
                            contentColor = DarkBackground
                        ),
                        shape = CircleShape,
                        modifier = Modifier
                            .size(64.dp)
                            .testTag("focus_resume_button")
                    ) {
                        Icon(
                            imageVector = Icons.Default.PlayArrow,
                            contentDescription = "Resume",
                            modifier = Modifier.size(28.dp)
                        )
                    }

                    // Reset / Cancel Button
                    IconButton(
                        onClick = {
                            timerState = TimerState.IDLE
                            switchMode(selectedMode)
                        },
                        modifier = Modifier
                            .size(48.dp)
                            .clip(CircleShape)
                            .background(DarkElevatedSurface)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Refresh,
                            contentDescription = "Reset",
                            tint = TextSecondary
                        )
                    }
                }
                TimerState.COMPLETED -> {
                    Button(
                        onClick = {
                            timerState = TimerState.IDLE
                            switchMode(selectedMode)
                        },
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryViolet),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text("New Session", fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
