import 'package:flutter_test/flutter_test.dart';
import 'package:questly/features/roadmaps/data/repositories/roadmap_repository_impl.dart';
import 'package:questly/features/roadmaps/domain/models/roadmap.dart';

void main() {
  group('RoadmapRepository', () {
    late RoadmapRepositoryImpl repository;

    setUp(() {
      repository = RoadmapRepositoryImpl();
    });

    test('loads default roadmaps and starter templates', () async {
      final roadmaps = await repository.getRoadmaps();
      final templates = await repository.getTemplates();

      expect(roadmaps.isNotEmpty, isTrue);
      expect(templates.isNotEmpty, isTrue);
      expect(roadmaps.first.milestones.isNotEmpty, isTrue);
    });

    test('calculates roadmap progress correctly', () async {
      final roadmaps = await repository.getRoadmaps();
      final r = roadmaps.first;

      final completed = r.completedMilestonesCount;
      final total = r.milestones.length;
      final expectedProgress = completed / total;

      expect(r.progress, closeTo(expectedProgress, 0.001));
    });

    test('can toggle milestone completion', () async {
      final roadmaps = await repository.getRoadmaps();
      final r = roadmaps.first;
      final m = r.milestones.first;
      final initialDone = m.isCompleted;

      await repository.toggleMilestone(r.id, m.id);
      final updatedRoadmap = await repository.getRoadmapById(r.id);
      final updatedMilestone = updatedRoadmap!.milestones.firstWhere(
        (item) => item.id == m.id,
      );

      expect(updatedMilestone.isCompleted, equals(!initialDone));
    });

    test('can create a new custom roadmap', () async {
      final newRoadmap = Roadmap(
        id: 'test_roadmap_1',
        title: 'Cloud Native DevOps',
        description: 'Test journey',
        category: 'DevOps',
        startDate: DateTime.now(),
        targetCompletionDate: DateTime.now().add(const Duration(days: 60)),
        milestones: const [
          RoadmapMilestone(
            id: 'm_1',
            order: 1,
            title: 'Docker & Kubernetes',
            description: 'Containers and pods',
          ),
        ],
      );

      await repository.saveRoadmap(newRoadmap);
      final retrieved = await repository.getRoadmapById('test_roadmap_1');

      expect(retrieved, isNotNull);
      expect(retrieved!.title, equals('Cloud Native DevOps'));
      expect(retrieved.milestones.length, equals(1));
    });
  });
}
