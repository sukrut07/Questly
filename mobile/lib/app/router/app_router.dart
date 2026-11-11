import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:questly/app/router/route_names.dart';
import 'package:questly/features/achievements/presentation/screens/achievements_screen.dart';
import 'package:questly/features/analytics/presentation/screens/analytics_screen.dart';
import 'package:questly/features/auth/presentation/screens/login_screen.dart';
import 'package:questly/features/dashboard/presentation/screens/dashboard_screen.dart';
import 'package:questly/features/dashboard/presentation/screens/main_scaffold.dart';
import 'package:questly/features/notifications/presentation/screens/notifications_screen.dart';
import 'package:questly/features/onboarding/presentation/screens/onboarding_screen.dart';
import 'package:questly/features/profile/presentation/screens/profile_screen.dart';
import 'package:questly/features/quests/presentation/screens/create_quest_screen.dart';
import 'package:questly/features/quests/presentation/screens/quest_detail_screen.dart';
import 'package:questly/features/quests/presentation/screens/quests_screen.dart';
import 'package:questly/features/settings/presentation/screens/settings_screen.dart';
import 'package:questly/features/tasks/presentation/screens/tasks_screen.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'rootNav');

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: RoutePaths.dashboard,
    routes: [
      // Top-level modal/standalone screens
      GoRoute(
        path: RoutePaths.onboarding,
        name: RouteNames.onboarding,
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const OnboardingScreen(),
      ),
      GoRoute(
        path: RoutePaths.login,
        name: RouteNames.login,
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: RoutePaths.createQuest,
        name: RouteNames.createQuest,
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const CreateQuestScreen(),
      ),
      GoRoute(
        path: RoutePaths.questDetail,
        name: RouteNames.questDetail,
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) {
          final id = state.pathParameters['id'] ?? '';
          return QuestDetailScreen(questId: id);
        },
      ),
      GoRoute(
        path: RoutePaths.settings,
        name: RouteNames.settings,
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const SettingsScreen(),
      ),
      GoRoute(
        path: RoutePaths.achievements,
        name: RouteNames.achievements,
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const AchievementsScreen(),
      ),
      GoRoute(
        path: RoutePaths.notifications,
        name: RouteNames.notifications,
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const NotificationsScreen(),
      ),

      // Stateful Shell Route for Bottom Navigation (Home, Quests, Tasks, Analytics, Profile)
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return MainScaffold(navigationShell: navigationShell);
        },
        branches: [
          // Branch 0: Dashboard
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: RoutePaths.dashboard,
                name: RouteNames.dashboard,
                builder: (context, state) => const DashboardScreen(),
              ),
            ],
          ),
          // Branch 1: Quests
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: RoutePaths.quests,
                name: RouteNames.quests,
                builder: (context, state) => const QuestsScreen(),
              ),
            ],
          ),
          // Branch 2: Tasks
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: RoutePaths.tasks,
                name: RouteNames.tasks,
                builder: (context, state) => const TasksScreen(),
              ),
            ],
          ),
          // Branch 3: Analytics
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: RoutePaths.analytics,
                name: RouteNames.analytics,
                builder: (context, state) => const AnalyticsScreen(),
              ),
            ],
          ),
          // Branch 4: Profile
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: RoutePaths.profile,
                name: RouteNames.profile,
                builder: (context, state) => const ProfileScreen(),
              ),
            ],
          ),
        ],
      ),
    ],
  );
});

