import 'package:questly/shared/models/quest.dart';

abstract class TaskRepository {
  Future<List<QuestSubtask>> getDailyTasks();
  Future<QuestSubtask> toggleTask(String taskId, bool isCompleted);
  Future<int> getRemainingTaskCount();
  Future<double> getDailyProgress();
}

