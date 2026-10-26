package com.example.ui.navigation

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.FormatListBulleted
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.SportsEsports
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.example.ui.MainViewModel
import com.example.ui.feature.arcade.ArcadeScreen
import com.example.ui.feature.arcade.CrystalMazeScreen
import com.example.ui.feature.arcade.MemoryMatchScreen
import com.example.ui.feature.arcade.QuestDefenderScreen
import com.example.ui.feature.arcade.SnakeGameScreen
import com.example.ui.feature.focus.FocusScreen
import com.example.ui.feature.home.HomeScreen
import com.example.ui.feature.onboarding.OnboardingScreen
import com.example.ui.feature.profile.AchievementsScreen
import com.example.ui.feature.profile.AnalyticsScreen
import com.example.ui.feature.profile.ProfileScreen
import com.example.ui.feature.profile.SkillTreeScreen
import com.example.ui.feature.quests.QuestsScreen
import com.example.ui.theme.DarkBackground
import com.example.ui.theme.DarkCardSurface
import com.example.ui.theme.DarkElevatedSurface
import com.example.ui.theme.PrimaryViolet
import com.example.ui.theme.TextMuted

sealed class Screen(val route: String, val title: String, val icon: ImageVector? = null) {
    object Home : Screen("home", "Home", Icons.Default.Home)
    object Quests : Screen("quests", "Quests", Icons.Default.FormatListBulleted)
    object Focus : Screen("focus", "Focus", Icons.Default.Timer)
    object Arcade : Screen("arcade", "Arcade", Icons.Default.SportsEsports)
    object Profile : Screen("profile", "Profile", Icons.Default.Person)

    // Sub-destinations
    object QuestDefender : Screen("quest_defender", "Quest Defender")
    object CrystalMaze : Screen("crystal_maze", "Crystal Maze")
    object SnakeGame : Screen("snake_game", "Cyber Snake")
    object MemoryGame : Screen("memory_game", "Rune Memory")
    object SkillTree : Screen("skill_tree", "Skills")
    object Achievements : Screen("achievements", "Badges")
    object Analytics : Screen("analytics", "Analytics")
    object Onboarding : Screen("onboarding", "Onboarding")
}

val bottomNavItems = listOf(
    Screen.Home,
    Screen.Quests,
    Screen.Focus,
    Screen.Arcade,
    Screen.Profile
)

@Composable
fun QuestlyNavHost(
    viewModel: MainViewModel,
    modifier: Modifier = Modifier
) {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    val isOnboardingCompleted by viewModel.isOnboardingCompleted.collectAsState()
    val toastMessage by viewModel.toastMessage.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }

    LaunchedEffect(toastMessage) {
        toastMessage?.let {
            snackbarHostState.showSnackbar(it)
            viewModel.clearToast()
        }
    }

    val showBottomBar = currentRoute in bottomNavItems.map { it.route }
    val startDestination = if (isOnboardingCompleted) Screen.Home.route else Screen.Onboarding.route

    Scaffold(
        modifier = modifier.fillMaxSize(),
        containerColor = DarkBackground,
        snackbarHost = { SnackbarHost(snackbarHostState) },
        bottomBar = {
            if (showBottomBar) {
                NavigationBar(
                    containerColor = DarkCardSurface,
                    contentColor = PrimaryViolet,
                    tonalElevation = 8.dp
                ) {
                    bottomNavItems.forEach { item ->
                        val isSelected = currentRoute == item.route
                        NavigationBarItem(
                            icon = {
                                item.icon?.let {
                                    Icon(
                                        imageVector = it,
                                        contentDescription = item.title,
                                        tint = if (isSelected) PrimaryViolet else TextMuted
                                    )
                                }
                            },
                            label = {
                                Text(
                                    text = item.title,
                                    fontSize = 11.sp,
                                    color = if (isSelected) PrimaryViolet else TextMuted
                                )
                            },
                            selected = isSelected,
                            onClick = {
                                if (currentRoute != item.route) {
                                    navController.navigate(item.route) {
                                        popUpTo(navController.graph.findStartDestination().id) {
                                            saveState = true
                                        }
                                        launchSingleTop = true
                                        restoreState = true
                                    }
                                }
                            },
                            colors = NavigationBarItemDefaults.colors(
                                indicatorColor = DarkElevatedSurface,
                                selectedIconColor = PrimaryViolet,
                                unselectedIconColor = TextMuted
                            ),
                            modifier = Modifier.testTag("nav_item_${item.route}")
                        )
                    }
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = startDestination,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Screen.Onboarding.route) {
                OnboardingScreen(
                    onFinishOnboarding = {
                        viewModel.setOnboardingCompleted(true)
                        navController.navigate(Screen.Home.route) {
                            popUpTo(Screen.Onboarding.route) { inclusive = true }
                        }
                    }
                )
            }

            composable(Screen.Home.route) {
                HomeScreen(
                    viewModel = viewModel,
                    onNavigateToQuests = { navController.navigate(Screen.Quests.route) },
                    onNavigateToFocus = { navController.navigate(Screen.Focus.route) },
                    onNavigateToArcade = { navController.navigate(Screen.Arcade.route) },
                    onNavigateToAchievements = { navController.navigate(Screen.Achievements.route) },
                    onNavigateToAnalytics = { navController.navigate(Screen.Analytics.route) }
                )
            }

            composable(Screen.Quests.route) {
                QuestsScreen(viewModel = viewModel)
            }

            composable(Screen.Focus.route) {
                FocusScreen(viewModel = viewModel)
            }

            composable(Screen.Arcade.route) {
                ArcadeScreen(
                    viewModel = viewModel,
                    onLaunchDefender = { navController.navigate(Screen.QuestDefender.route) },
                    onLaunchMaze = { navController.navigate(Screen.CrystalMaze.route) },
                    onLaunchSnake = { navController.navigate(Screen.SnakeGame.route) },
                    onLaunchMemory = { navController.navigate(Screen.MemoryGame.route) }
                )
            }

            composable(Screen.QuestDefender.route) {
                QuestDefenderScreen(
                    viewModel = viewModel,
                    onBack = { navController.popBackStack() }
                )
            }

            composable(Screen.CrystalMaze.route) {
                CrystalMazeScreen(
                    viewModel = viewModel,
                    onBack = { navController.popBackStack() }
                )
            }

            composable(Screen.SnakeGame.route) {
                SnakeGameScreen(
                    viewModel = viewModel,
                    onBack = { navController.popBackStack() }
                )
            }

            composable(Screen.MemoryGame.route) {
                MemoryMatchScreen(
                    viewModel = viewModel,
                    onBack = { navController.popBackStack() }
                )
            }

            composable(Screen.Profile.route) {
                ProfileScreen(
                    viewModel = viewModel,
                    onNavigateToSkillTree = { navController.navigate(Screen.SkillTree.route) },
                    onNavigateToAchievements = { navController.navigate(Screen.Achievements.route) },
                    onNavigateToAnalytics = { navController.navigate(Screen.Analytics.route) }
                )
            }

            composable(Screen.SkillTree.route) {
                SkillTreeScreen(
                    viewModel = viewModel,
                    onBack = { navController.popBackStack() }
                )
            }

            composable(Screen.Achievements.route) {
                AchievementsScreen(
                    viewModel = viewModel,
                    onBack = { navController.popBackStack() }
                )
            }

            composable(Screen.Analytics.route) {
                AnalyticsScreen(
                    viewModel = viewModel,
                    onBack = { navController.popBackStack() }
                )
            }
        }
    }
}
