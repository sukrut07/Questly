import 'package:questly/shared/models/quest.dart';

abstract class QuestRepository {
  Future<List<Quest>> getQuests();
  Future<List<Quest>> getActiveQuests();
  Future<List<Quest>> getCompletedQuests();
  Future<Quest?> getQuestById(String id);
  Future<Quest> createQuest(Quest quest);
  Future<Quest> updateQuest(Quest quest);
  Future<void> deleteQuest(String id);
  Future<Quest> completeQuest(String id);
  Future<Quest> toggleSubtask(String questId, String subtaskId);
}

