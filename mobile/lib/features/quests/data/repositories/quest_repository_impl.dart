import 'package:questly/core/network/api_client.dart';
import 'package:questly/features/quests/domain/repositories/quest_repository.dart';
import 'package:questly/shared/enums/quest_enums.dart';
import 'package:questly/shared/models/quest.dart';

class QuestRepositoryImpl implements QuestRepository {
  final ApiClient? _apiClient;
  final List<Quest> _localQuests = [];

  QuestRepositoryImpl([this._apiClient]) {
    // Seed default starter quests for local mode
    if (_localQuests.isEmpty) {
      _localQuests.addAll([
        Quest(
          id: 'quest_1',
          title: 'Architect Flutter Clean Core',
          description: 'Establish repository pattern, Riverpod dependency injection, and theme system.',
          category: QuestCategory.coding,
          difficulty: QuestDifficulty.epic,
          priority: QuestPriority.urgent,
          estimatedMinutes: 60,
          xpReward: 100,
          status: QuestStatus.inProgress,
          createdAt: DateTime.now().subtract(const Duration(hours: 3)),
          subtasks: const [
            QuestSubtask(
              id: 'sub_1',
              questId: 'quest_1',
              title: 'Define Domain Models',
              isCompleted: true,
            ),
            QuestSubtask(
              id: 'sub_2',
              questId: 'quest_1',
              title: 'Setup GoRouter Navigation',
              isCompleted: true,
            ),
            QuestSubtask(
              id: 'sub_3',
              questId: 'quest_1',
              title: 'Implement Dashboard UI',
              isCompleted: false,
            ),
          ],
        ),
        Quest(
          id: 'quest_2',
          title: 'Deep Focus Morning Ritual',
          description: 'Complete a 45-minute focused sprint without smartphone distractions.',
          category: QuestCategory.study,
          difficulty: QuestDifficulty.medium,
          priority: QuestPriority.high,
          estimatedMinutes: 45,
          xpReward: 40,
          status: QuestStatus.notStarted,
          createdAt: DateTime.now().subtract(const Duration(hours: 1)),
          subtasks: const [
            QuestSubtask(
              id: 'sub_4',
              questId: 'quest_2',
              title: 'Prepare tea & workspace',
              isCompleted: true,
            ),
            QuestSubtask(
              id: 'sub_5',
              questId: 'quest_2',
              title: 'Execute focus block',
              isCompleted: false,
            ),
          ],
        ),
      ]);
    }
  }

  ApiClient? get apiClient => _apiClient;

  @override
  Future<List<Quest>> getQuests() async {
    return List.unmodifiable(_localQuests);
  }

  @override
  Future<List<Quest>> getActiveQuests() async {
    return _localQuests
        .where(
          (q) =>
              q.status == QuestStatus.notStarted ||
              q.status == QuestStatus.inProgress,
        )
        .toList();
  }

  @override
  Future<List<Quest>> getCompletedQuests() async {
    return _localQuests
        .where((q) => q.status == QuestStatus.completed)
        .toList();
  }

  @override
  Future<Quest?> getQuestById(String id) async {
    try {
      return _localQuests.firstWhere((q) => q.id == id);
    } catch (_) {
      return null;
    }
  }

  @override
  Future<Quest> createQuest(Quest quest) async {
    _localQuests.insert(0, quest);
    return quest;
  }

  @override
  Future<Quest> updateQuest(Quest quest) async {
    final index = _localQuests.indexWhere((q) => q.id == quest.id);
    if (index != -1) {
      _localQuests[index] = quest;
      return quest;
    }
    _localQuests.add(quest);
    return quest;
  }

  @override
  Future<void> deleteQuest(String id) async {
    _localQuests.removeWhere((q) => q.id == id);
  }

  @override
  Future<Quest> completeQuest(String id) async {
    final index = _localQuests.indexWhere((q) => q.id == id);
    if (index != -1) {
      final updated = _localQuests[index].copyWith(
        status: QuestStatus.completed,
        completedAt: DateTime.now(),
      );
      _localQuests[index] = updated;
      return updated;
    }
    throw Exception('Quest with id $id not found');
  }

  @override
  Future<Quest> toggleSubtask(String questId, String subtaskId) async {
    final qIndex = _localQuests.indexWhere((q) => q.id == questId);
    if (qIndex != -1) {
      final quest = _localQuests[qIndex];
      final newSubtasks = quest.subtasks.map((s) {
        if (s.id == subtaskId) {
          return s.copyWith(isCompleted: !s.isCompleted);
        }
        return s;
      }).toList();

      final updated = quest.copyWith(subtasks: newSubtasks);
      _localQuests[qIndex] = updated;
      return updated;
    }
    throw Exception('Quest with id $questId not found');
  }
}
