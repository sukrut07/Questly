import 'package:flutter_test/flutter_test.dart';
import 'package:questly/features/analytics/data/repositories/analytics_repository_impl.dart';
import 'package:questly/features/dashboard/data/repositories/mock_dashboard_repository.dart';
import 'package:questly/features/focus/data/repositories/focus_repository_impl.dart';
import 'package:questly/features/quests/data/repositories/quest_repository_impl.dart';
import 'package:questly/shared/enums/quest_enums.dart';
import 'package:questly/shared/models/quest.dart';

void main() {
  group('AnalyticsRepository Dynamic Metrics Tests', () {
    test(
      'Calculates real completion rate and total XP from user quests',
      () async {
        final questRepo = QuestRepositoryImpl();
        final focusRepo = FocusRepositoryImpl();
        final dashRepo = MockDashboardRepository(
          questRepository: questRepo,
          focusRepository: focusRepo,
        );
        final analyticsRepo = AnalyticsRepositoryImpl(
          questRepo,
          focusRepo,
          dashRepo,
        );

        // Add a custom quest
        final q1 = await questRepo.createQuest(
          Quest(
            id: 'test_q_analytics',
            title: 'Dynamic User Task',
            estimatedMinutes: 45,
            xpReward: 50,
            status: QuestStatus.notStarted,
            createdAt: DateTime.now(),
          ),
        );

        var summary = await analyticsRepo.getSummary();
        final initialCompleted = summary.totalQuestsCompleted;

        // Complete the quest
        await questRepo.completeQuest(q1.id);

        summary = await analyticsRepo.getSummary();
        expect(summary.totalQuestsCompleted, initialCompleted + 1);
        expect(summary.weeklyCompletionRate > 0.0, isTrue);
        expect(summary.totalXpEarned >= 50, isTrue);

        // Verify today in weekly pattern is updated
        final todayIndex = DateTime.now().weekday - 1;
        expect(summary.weeklyPattern[todayIndex] >= 1.0, isTrue);
      },
    );
  });
}
