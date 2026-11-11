import 'package:flutter_test/flutter_test.dart';
import 'package:questly/features/gamification/data/repositories/skill_tree_repository.dart';
import 'package:questly/features/gamification/domain/models/skill_tree.dart';

void main() {
  group('SkillTree Tests', () {
    late SkillTreeRepository repository;

    setUp(() {
      repository = SkillTreeRepository();
    });

    test('returns skill nodes covering all branches', () {
      final nodes = repository.getSkillNodes();
      expect(nodes.isNotEmpty, isTrue);

      final branches = nodes.map((n) => n.branch).toSet();
      expect(branches.contains(SkillBranch.focus), isTrue);
      expect(branches.contains(SkillBranch.consistency), isTrue);
      expect(branches.contains(SkillBranch.planning), isTrue);
      expect(branches.contains(SkillBranch.learning), isTrue);
      expect(branches.contains(SkillBranch.execution), isTrue);
    });

    test('computes progress percentage accurately', () {
      const node = SkillNode(
        id: 'test_node',
        branch: SkillBranch.focus,
        name: 'Test Mastery',
        description: 'Test description',
        requiredLevel: 2,
        currentProgress: 50,
        maxProgress: 100,
      );

      expect(node.progressPercent, equals(0.5));
    });
  });
}

