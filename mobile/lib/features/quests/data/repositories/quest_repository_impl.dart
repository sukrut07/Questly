import 'dart:convert';

import 'package:questly/core/network/api_client.dart';
import 'package:questly/core/storage/local_storage.dart';
import 'package:questly/features/quests/domain/repositories/quest_repository.dart';
import 'package:questly/shared/enums/quest_enums.dart';
import 'package:questly/shared/models/quest.dart';

class QuestRepositoryImpl implements QuestRepository {
  final ApiClient? _apiClient;
  final LocalStorage? _storage;
  final List<Quest> _localQuests = [];

  static const String _storageKey = 'questly_local_quests';

  QuestRepositoryImpl([this._apiClient, this._storage]) {
    _loadQuests();
  }

  void _loadQuests() {
    if (_storage != null) {
      final jsonStr = _storage.getString(_storageKey);
      if (jsonStr != null && jsonStr.isNotEmpty) {
        try {
          final list = jsonDecode(jsonStr) as List<dynamic>;
          _localQuests.addAll(
            list.map((e) => Quest.fromJson(e as Map<String, dynamic>)),
          );
          return;
        } catch (_) {}
      }
    }

    // Default starter quests for initial launch
    if (_localQuests.isEmpty) {
      _localQuests.addAll([
        Quest(
          id: 'quest_starter_1',
          title: 'Explore Questly Productivity Tools',
          description: 'Check off a subtask, customize your command center, or complete a focus session.',
          category: QuestCategory.study,
          difficulty: QuestDifficulty.easy,
          priority: QuestPriority.high,
          estimatedMinutes: 20,
          xpReward: 30,
          status: QuestStatus.notStarted,
          createdAt: DateTime.now(),
          subtasks: const [
            QuestSubtask(
              id: 'sub_s1',
              questId: 'quest_starter_1',
              title: 'Check off this first subtask',
              isCompleted: false,
            ),
            QuestSubtask(
              id: 'sub_s2',
              questId: 'quest_starter_1',
              title: 'Launch a 25-minute Pomodoro sprint',
              isCompleted: false,
            ),
          ],
        ),
      ]);
      _persist();
    }
  }

  Future<void> _persist() async {
    if (_storage != null) {
      final jsonStr = jsonEncode(_localQuests.map((q) => q.toJson()).toList());
      await _storage.setString(_storageKey, jsonStr);
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
    await _persist();
    return quest;
  }

  @override
  Future<Quest> updateQuest(Quest quest) async {
    final index = _localQuests.indexWhere((q) => q.id == quest.id);
    if (index != -1) {
      _localQuests[index] = quest;
      await _persist();
      return quest;
    }
    _localQuests.add(quest);
    await _persist();
    return quest;
  }

  @override
  Future<void> deleteQuest(String id) async {
    _localQuests.removeWhere((q) => q.id == id);
    await _persist();
  }

  @override
  Future<Quest> completeQuest(String id) async {
    final index = _localQuests.indexWhere((q) => q.id == id);
    if (index != -1) {
      final current = _localQuests[index];
      // When completing, also mark all subtasks completed
      final completedSubtasks = current.subtasks
          .map((s) => s.copyWith(isCompleted: true))
          .toList();

      final updated = current.copyWith(
        status: QuestStatus.completed,
        completedAt: DateTime.now(),
        subtasks: completedSubtasks,
      );
      _localQuests[index] = updated;
      await _persist();
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

      final allDone =
          newSubtasks.isNotEmpty && newSubtasks.every((s) => s.isCompleted);
      final updated = quest.copyWith(
        subtasks: newSubtasks,
        status: allDone ? QuestStatus.completed : quest.status,
        completedAt: allDone ? (quest.completedAt ?? DateTime.now()) : null,
      );
      _localQuests[qIndex] = updated;
      await _persist();
      return updated;
    }
    throw Exception('Quest with id $questId not found');
  }

  @override
  Future<Quest> addSubtask(String questId, String title) async {
    final qIndex = _localQuests.indexWhere((q) => q.id == questId);
    if (qIndex != -1) {
      final quest = _localQuests[qIndex];
      final newSubtask = QuestSubtask(
        id: 'subtask_${DateTime.now().millisecondsSinceEpoch}',
        questId: questId,
        title: title,
        isCompleted: false,
      );
      final updated = quest.copyWith(
        subtasks: [...quest.subtasks, newSubtask],
        // If it was completed, adding a new subtask makes it in-progress
        status: quest.status == QuestStatus.completed
            ? QuestStatus.inProgress
            : quest.status,
      );
      _localQuests[qIndex] = updated;
      await _persist();
      return updated;
    }
    throw Exception('Quest with id $questId not found');
  }

  @override
  Future<Quest> deleteSubtask(String questId, String subtaskId) async {
    final qIndex = _localQuests.indexWhere((q) => q.id == questId);
    if (qIndex != -1) {
      final quest = _localQuests[qIndex];
      final updatedSubtasks = quest.subtasks
          .where((s) => s.id != subtaskId)
          .toList();
      final updated = quest.copyWith(subtasks: updatedSubtasks);
      _localQuests[qIndex] = updated;
      await _persist();
      return updated;
    }
    throw Exception('Quest with id $questId not found');
  }
}
