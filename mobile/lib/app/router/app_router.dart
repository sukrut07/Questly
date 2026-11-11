import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:questly/app/router/route_names.dart';
import 'package:questly/features/achievements/presentation/screens/achievements_screen.dart';
import 'package:questly/features/analytics/presentation/screens/analytics_screen.dart';
import 'package:questly/features/arcade/presentation/screens/arcade_screen.dart';
import 'package:questly/features/auth/presentation/screens/login_screen.dart';
import 'package:questly/features/dashboard/presentation/screens/dashboard_screen.dart';
import 'package:questly/features/dashboard/presentation/screens/main_scaffold.dart';
import 'package:questly/features/focus/presentation/screens/focus_screen.dart';
import 'package:questly/features/gamification/presentation/screens/skill_tree_screen.dart';
import 'package:questly/features/notebook/presentation/screens/note_editor_screen.dart';
import 'package:questly/features/notebook/presentation/screens/notebook_screen.dart';
import 'package:questly/features/notifications/presentation/screens/notifications_screen.dart';
import 'package:questly/features/onboarding/presentation/screens/onboarding_screen.dart';
import 'package:questly/features/profile/presentation/screens/profile_screen.dart';
import 'package:questly/features/quests/presentation/screens/create_quest_screen.dart';
import 'package:questly/features/quests/presentation/screens/quest_detail_screen.dart';
import 'package:questly/features/quests/presentation/screens/quests_screen.dart';
import 'package:questly/features/roadmaps/presentation/screens/create_roadmap_screen.dart';
import 'package:questly/features/roadmaps/presentation/screens/roadmap_detail_screen.dart';
import 'package:questly/features/roadmaps/presentation/screens/roadmaps_screen.dart';
import 'package:questly/features/settings/presentation/screens/settings_screen.dart';

final _rootNavigatorKey = GlobalKey<NavigatorState>(debugLabel: 'rootNav');

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: RoutePaths.home,
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
        path: RoutePaths.focus,
        name: RouteNames.focus,
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const FocusScreen(),
      ),
      GoRoute(
        path: RoutePaths.noteEditor,
        name: RouteNames.noteEditor,
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) {
          final id = state.pathParameters['id'] ?? '';
          return NoteEditorScreen(noteId: id);
        },
      ),
      GoRoute(
        path: RoutePaths.roadmapDetail,
        name: RouteNames.roadmapDetail,
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) {
          final id = state.pathParameters['id'] ?? '';
          return RoadmapDetailScreen(roadmapId: id);
        },
      ),
      GoRoute(
        path: RoutePaths.createRoadmap,
        name: RouteNames.createRoadmap,
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const CreateRoadmapScreen(),
      ),
      GoRoute(
        path: RoutePaths.profile,
        name: RouteNames.profile,
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const ProfileScreen(),
      ),
      GoRoute(
        path: RoutePaths.skillTree,
        name: RouteNames.skillTree,
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const SkillTreeScreen(),
      ),
      GoRoute(
        path: RoutePaths.arcade,
        name: RouteNames.arcade,
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) => const ArcadeScreen(),
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

      // 5-Destination Bottom Navigation Shell
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) {
          return MainScaffold(navigationShell: navigationShell);
        },
        branches: [
          // Branch 0: Home (Dashboard)
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: RoutePaths.home,
                name: RouteNames.home,
                builder: (context, state) => const DashboardScreen(),
              ),
            ],
          ),
          // Branch 1: Quests & Tasks
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: RoutePaths.quests,
                name: RouteNames.quests,
                builder: (context, state) => const QuestsScreen(),
              ),
            ],
          ),
          // Branch 2: Insights (Analytics & Heatmaps)
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: RoutePaths.insights,
                name: RouteNames.insights,
                builder: (context, state) => const AnalyticsScreen(),
              ),
            ],
          ),
          // Branch 3: Notebook
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: RoutePaths.notebook,
                name: RouteNames.notebook,
                builder: (context, state) => const NotebookScreen(),
              ),
            ],
          ),
          // Branch 4: Roadmaps
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: RoutePaths.roadmaps,
                name: RouteNames.roadmaps,
                builder: (context, state) => const RoadmapsScreen(),
              ),
            ],
          ),
        ],
      ),
    ],
  );
});
