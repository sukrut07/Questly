package com.example.ui.feature.arcade

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material.icons.filled.Bolt
import androidx.compose.material.icons.filled.Diamond
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.FitnessCenter
import androidx.compose.material.icons.filled.LocalFireDepartment
import androidx.compose.material.icons.filled.MenuBook
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material.icons.filled.Stars
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
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
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.core.model.GameType
import com.example.ui.MainViewModel
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
import kotlinx.coroutines.delay

data class MemoryCard(
    val id: Int,
    val runeKey: String,
    val icon: ImageVector,
    var isFaceUp: Boolean = false,
    var isMatched: Boolean = false
)

@Composable
fun MemoryMatchScreen(
    viewModel: MainViewModel,
    onBack: () -> Unit,
    modifier: Modifier = Modifier
) {
    val runeTypes = listOf(
        Pair("sword", Icons.Default.Shield),
        Pair("bolt", Icons.Default.Bolt),
        Pair("fire", Icons.Default.LocalFireDepartment),
        Pair("gem", Icons.Default.Diamond),
        Pair("star", Icons.Default.Stars),
        Pair("book", Icons.Default.MenuBook),
        Pair("spark", Icons.Default.AutoAwesome),
        Pair("fitness", Icons.Default.FitnessCenter)
    )

    val cards = remember { mutableStateListOf<MemoryCard>() }
    var firstFlippedIndex by remember { mutableStateOf<Int?>(null) }
    var secondFlippedIndex by remember { mutableStateOf<Int?>(null) }
    var moveCount by remember { mutableIntStateOf(0) }
    var matchedPairsCount by remember { mutableIntStateOf(0) }
    var isVictory by remember { mutableStateOf(false) }
    var startTime by remember { mutableStateOf(0L) }
    var isBusy by remember { mutableStateOf(false) }

    fun initializeDeck() {
        cards.clear()
        val deck = mutableListOf<MemoryCard>()
        runeTypes.forEachIndexed { typeIdx, (key, icon) ->
            deck.add(MemoryCard(typeIdx * 2, key, icon))
            deck.add(MemoryCard(typeIdx * 2 + 1, key, icon))
        }
        deck.shuffle()
        cards.addAll(deck)
        firstFlippedIndex = null
        secondFlippedIndex = null
        moveCount = 0
        matchedPairsCount = 0
        isVictory = false
        startTime = System.currentTimeMillis()
        isBusy = false
    }

    LaunchedEffect(Unit) {
        initializeDeck()
    }

    // Pair matching logic
    fun onCardClicked(index: Int) {
        if (isBusy || isVictory) return
        val card = cards[index]
        if (card.isFaceUp || card.isMatched) return

        cards[index] = card.copy(isFaceUp = true)

        if (firstFlippedIndex == null) {
            firstFlippedIndex = index
        } else if (secondFlippedIndex == null && firstFlippedIndex != index) {
            secondFlippedIndex = index
            moveCount++
            val first = cards[firstFlippedIndex!!]
            val second = cards[secondFlippedIndex!!]

            if (first.runeKey == second.runeKey) {
                // Match!
                cards[firstFlippedIndex!!] = first.copy(isMatched = true)
                cards[secondFlippedIndex!!] = second.copy(isMatched = true)
                matchedPairsCount++
                firstFlippedIndex = null
                secondFlippedIndex = null

                if (matchedPairsCount == runeTypes.size) {
                    isVictory = true
                    val durationSec = ((System.currentTimeMillis() - startTime) / 1000).toInt()
                    val calculatedScore = maxOf(10, (1000 - (moveCount * 25) - (durationSec * 5)))
                    viewModel.recordGameScore(GameType.MEMORY_MATCH, calculatedScore, moveCount, durationSec)
                }
            } else {
                // Not match, flip back after brief pause
                isBusy = true
            }
        }
    }

    LaunchedEffect(isBusy) {
        if (isBusy) {
            delay(800)
            if (firstFlippedIndex != null && secondFlippedIndex != null) {
                cards[firstFlippedIndex!!] = cards[firstFlippedIndex!!].copy(isFaceUp = false)
                cards[secondFlippedIndex!!] = cards[secondFlippedIndex!!].copy(isFaceUp = false)
            }
            firstFlippedIndex = null
            secondFlippedIndex = null
            isBusy = false
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(DarkBackground)
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBack) {
                Icon(
                    imageVector = Icons.AutoMirrored.Filled.ArrowBack,
                    contentDescription = "Back",
                    tint = TextPrimary
                )
            }
            Text(
                text = "Rune Memory",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
            IconButton(onClick = { initializeDeck() }) {
                Icon(
                    imageVector = Icons.Default.Refresh,
                    contentDescription = "Restart",
                    tint = PrimaryViolet
                )
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        // Stats strip
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceAround
        ) {
            Text(text = "Moves: $moveCount", color = TextSecondary, fontSize = 13.sp)
            Text(text = "Matched: $matchedPairsCount / ${runeTypes.size}", color = SecondaryBlue, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Card Grid (4x4)
        LazyVerticalGrid(
            columns = GridCells.Fixed(4),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier
                .weight(1f)
                .testTag("memory_match_grid")
        ) {
            itemsIndexed(cards) { index, card ->
                val rotation by animateFloatAsState(
                    targetValue = if (card.isFaceUp || card.isMatched) 180f else 0f,
                    animationSpec = tween(300),
                    label = "card_flip"
                )

                Box(
                    modifier = Modifier
                        .aspectRatio(1f)
                        .graphicsLayer {
                            rotationY = rotation
                            cameraDistance = 12f * density
                        }
                        .clip(RoundedCornerShape(12.dp))
                        .background(
                            if (card.isMatched) SuccessGreen.copy(alpha = 0.2f)
                            else if (card.isFaceUp) DarkElevatedSurface
                            else DarkCardSurface
                        )
                        .border(
                            1.dp,
                            if (card.isMatched) SuccessGreen
                            else if (card.isFaceUp) PrimaryViolet
                            else DarkBorder,
                            RoundedCornerShape(12.dp)
                        )
                        .clickable(enabled = !card.isFaceUp && !card.isMatched && !isBusy) {
                            onCardClicked(index)
                        },
                    contentAlignment = Alignment.Center
                ) {
                    if (rotation > 90f) {
                        // Face up
                        Icon(
                            imageVector = card.icon,
                            contentDescription = card.runeKey,
                            tint = if (card.isMatched) SuccessGreen else GoldAchievement,
                            modifier = Modifier
                                .size(28.dp)
                                .graphicsLayer { rotationY = 180f }
                        )
                    } else {
                        // Face down
                        Box(
                            modifier = Modifier
                                .size(18.dp)
                                .clip(CircleShape)
                                .background(PrimaryViolet.copy(alpha = 0.3f))
                        )
                    }
                }
            }
        }

        // Victory celebration card
        if (isVictory) {
            Spacer(modifier = Modifier.height(12.dp))
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(DarkCardSurface)
                    .border(1.dp, GoldAchievement, RoundedCornerShape(16.dp))
                    .padding(18.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Icon(
                    imageVector = Icons.Default.EmojiEvents,
                    contentDescription = "Victory",
                    tint = GoldAchievement,
                    modifier = Modifier.size(36.dp)
                )
                Spacer(modifier = Modifier.height(6.dp))
                Text(
                    text = "Rune Mastery Achieved!",
                    fontWeight = FontWeight.Bold,
                    fontSize = 16.sp,
                    color = TextPrimary
                )
                Text(
                    text = "Solved in $moveCount moves. Cognitive acuity improved!",
                    fontSize = 12.sp,
                    color = TextSecondary,
                    modifier = Modifier.padding(top = 2.dp, bottom = 12.dp)
                )
                Button(
                    onClick = { initializeDeck() },
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryViolet),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Text("Play Next Round", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
