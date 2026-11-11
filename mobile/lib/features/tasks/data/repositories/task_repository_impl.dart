import 'package:questly/features/quests/domain/repositories/quest_repository.dart';
import 'package:questly/features/tasks/domain/repositories/task_repository.dart';
import 'package:questly/shared/models/quest.dart';

class TaskRepositoryImpl implements TaskRepository {
  final QuestRepository _questRepository;

  TaskRepositoryImpl(this._questRepository);

  @override
  Future<List<QuestSubtask>> getDailyTasks() async {
    final quests = await _questRepository.getActiveQuests();
    return quests.expand((q) => q.subtasks).toList();
  }

  @override
  Future<QuestSubtask> toggleTask(String taskId, bool isCompleted) async {
    final quests = await _questRepository.getActiveQuests();
    for (final q in quests) {
      for (final s in q.subtasks) {
        if (s.id == taskId) {
          final updatedQuest = await _questRepository.toggleSubtask(q.id, taskId);
          return updatedQuest.subtasks.firstWhere((sub) => sub.id == taskId);
        }
      }
    }
    throw Exception('Task with id $taskId not found');
  }

  @override
  Future<int> getRemainingTaskCount() async {
    final tasks = await getDailyTasks();
    return tasks.where((t) => !t.isCompleted).length;
  }

  @override
  Future<double> getDailyProgress() async {
    final tasks = await getDailyTasks();
    if (tasks.isEmpty) return 0.0;
    final completed = tasks.where((t) => t.isCompleted).length;
    return (completed / tasks.length).clamp(0.0, 1.0);
  }
}
