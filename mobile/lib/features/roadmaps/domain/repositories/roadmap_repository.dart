import 'package:questly/features/roadmaps/domain/models/roadmap.dart';

abstract class RoadmapRepository {
  Future<List<Roadmap>> getRoadmaps();
  Future<Roadmap?> getRoadmapById(String id);
  Future<Roadmap> saveRoadmap(Roadmap roadmap);
  Future<void> toggleMilestone(String roadmapId, String milestoneId);
  Future<void> deleteRoadmap(String id);
  Future<List<Roadmap>> getTemplates();
}
