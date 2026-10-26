package com.example.ui.feature.arcade

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
import androidx.compose.material.icons.filled.DashboardCustomize
import androidx.compose.material.icons.filled.GridView
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.RocketLaunch
import androidx.compose.material.icons.filled.SportsEsports
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ui.MainViewModel
import com.example.ui.components.QuestlyCard
import com.example.ui.theme.DarkBackground
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
fun ArcadeScreen(
    viewModel: MainViewModel,
    onLaunchDefender: () -> Unit,
    onLaunchMaze: () -> Unit,
    onLaunchSnake: () -> Unit,
    onLaunchMemory: () -> Unit,
    modifier: Modifier = Modifier
) {
    val defenderBest by viewModel.defenderHighScore.collectAsState()
    val mazeBest by viewModel.mazeHighScore.collectAsState()
    val snakeBest by viewModel.snakeHighScore.collectAsState()
    val memoryBest by viewModel.memoryHighScore.collectAsState()

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Questly Arcade",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
            Text(
                text = "Recreational games for your scheduled break intervals. Gaming time is strictly separated from productive focus duration.",
                fontSize = 13.sp,
                color = TextSecondary,
                lineHeight = 18.sp,
                modifier = Modifier.padding(top = 4.dp, bottom = 4.dp)
            )
        }

        // Featured Game 1: QUEST DEFENDER
        item {
            FeaturedGameCard(
                title = "Quest Defender",
                subtitle = "Galaga-inspired space arcade shooter",
                description = "Pilot your starfighter against descending geometric alien swarms. Dodge enemy plasma, time your volleys, and clear escalating waves.",
                icon = Icons.Default.RocketLaunch,
                accentColor = PrimaryViolet,
                bestScore = defenderBest,
                scoreLabel = "Best: $defenderBest pts",
                buttonText = "Deploy Defender",
                testTag = "arcade_defender_card",
                onPlay = onLaunchDefender
            )
        }

        // Featured Game 2: CRYSTAL MAZE
        item {
            FeaturedGameCard(
                title = "Crystal Maze",
                subtitle = "Arcane maze chase & crystal collection",
                description = "Navigate glowing subterranean labyrinth corridors, gathering energy crystal pellets while outmaneuvering spectral chasers.",
                icon = Icons.Default.GridView,
                accentColor = SecondaryBlue,
                bestScore = mazeBest,
                scoreLabel = "Best: $mazeBest pts",
                buttonText = "Enter Maze",
                testTag = "arcade_maze_card",
                onPlay = onLaunchMaze
            )
        }

        // Retro Quick-Play Corner
        item {
            Text(
                text = "Classic Retro Chamber",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary,
                modifier = Modifier.padding(top = 8.dp)
            )
        }

        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                MiniGameQuickCard(
                    title = "Cyber Snake",
                    best = "Best: $snakeBest",
                    icon = Icons.Default.SportsEsports,
                    color = SuccessGreen,
                    modifier = Modifier.weight(1f),
                    onClick = onLaunchSnake
                )
                MiniGameQuickCard(
                    title = "Rune Memory",
                    best = "Best: $memoryBest",
                    icon = Icons.Default.DashboardCustomize,
                    color = GoldAchievement,
                    modifier = Modifier.weight(1f),
                    onClick = onLaunchMemory
                )
            }
        }

        // Humane Separation Note
        item {
            QuestlyCard(
                modifier = Modifier.fillMaxWidth(),
                backgroundColor = DarkElevatedSurface
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Info,
                        contentDescription = "Info",
                        tint = SecondaryBlue,
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        text = "Gaming sessions never inflate focus time or fake productivity metrics. Play to recharge and return sharp.",
                        fontSize = 12.sp,
                        color = TextSecondary,
                        lineHeight = 16.sp
                    )
                }
            }
        }

        item {
            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}

@Composable
private fun FeaturedGameCard(
    title: String,
    subtitle: String,
    description: String,
    icon: ImageVector,
    accentColor: Color,
    bestScore: Int,
    scoreLabel: String,
    buttonText: String,
    testTag: String,
    onPlay: () -> Unit
) {
    QuestlyCard(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onPlay() }
            .testTag(testTag),
        backgroundColor = DarkCardSurface,
        borderColor = accentColor.copy(alpha = 0.4f)
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
                            .size(46.dp)
                            .clip(CircleShape)
                            .background(accentColor.copy(alpha = 0.2f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = icon,
                            contentDescription = title,
                            tint = accentColor,
                            modifier = Modifier.size(26.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(
                            text = title,
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                        Text(
                            text = subtitle,
                            fontSize = 12.sp,
                            color = TextSecondary
                        )
                    }
                }

                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(GoldAchievement.copy(alpha = 0.15f))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = scoreLabel,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = GoldAchievement
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Text(
                text = description,
                fontSize = 13.sp,
                color = TextSecondary,
                lineHeight = 18.sp
            )

            Spacer(modifier = Modifier.height(16.dp))

            Button(
                onClick = onPlay,
                colors = ButtonDefaults.buttonColors(containerColor = accentColor),
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier.align(Alignment.End)
            ) {
                Icon(imageVector = Icons.Default.PlayArrow, contentDescription = "Play", modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(4.dp))
                Text(buttonText, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
private fun MiniGameQuickCard(
    title: String,
    best: String,
    icon: ImageVector,
    color: Color,
    modifier: Modifier = Modifier,
    onClick: () -> Unit
) {
    QuestlyCard(
        modifier = modifier.clickable { onClick() },
        backgroundColor = DarkCardSurface
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(imageVector = icon, contentDescription = title, tint = color, modifier = Modifier.size(20.dp))
                Text(text = best, fontSize = 10.sp, color = GoldAchievement, fontWeight = FontWeight.Bold)
            }
            Spacer(modifier = Modifier.height(6.dp))
            Text(text = title, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = TextPrimary)
            Text(text = "Quick Break", fontSize = 11.sp, color = TextSecondary)
        }
    }
}
