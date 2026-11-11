import 'dart:convert';
import 'package:questly/core/storage/local_storage.dart';
import 'package:questly/features/roadmaps/domain/models/roadmap.dart';
import 'package:questly/features/roadmaps/domain/repositories/roadmap_repository.dart';

class RoadmapRepositoryImpl implements RoadmapRepository {
  final LocalStorage? _storage;
  final List<Roadmap> _roadmaps = [];

  static const String _storageKey = 'questly_roadmaps_data';

  RoadmapRepositoryImpl([this._storage]) {
    _loadRoadmaps();
  }

  void _loadRoadmaps() {
    if (_storage != null) {
      final jsonStr = _storage.getString(_storageKey);
      if (jsonStr != null && jsonStr.isNotEmpty) {
        try {
          final list = jsonDecode(jsonStr) as List<dynamic>;
          _roadmaps.addAll(list.map((e) => Roadmap.fromJson(e as Map<String, dynamic>)));
          return;
        } catch (_) {}
      }
    }

    if (_roadmaps.isEmpty) {
      _roadmaps.addAll(_defaultRoadmaps);
    }
  }

  Future<void> _persist() async {
    if (_storage != null) {
      final jsonStr = jsonEncode(_roadmaps.map((r) => r.toJson()).toList());
      await _storage.setString(_storageKey, jsonStr);
    }
  }

  static List<Roadmap> get _defaultRoadmaps => [
        Roadmap(
          id: 'roadmap_fullstack',
          title: 'Full-Stack Modern Architect',
          description: 'Master full-stack system development from frontend Next.js to Flutter mobile & scalable cloud backends.',
          category: 'Software Engineering',
          startDate: DateTime.now().subtract(const Duration(days: 30)),
          targetCompletionDate: DateTime.now().add(const Duration(days: 90)),
          milestones: [
            RoadmapMilestone(
              id: 'fs_1',
              order: 1,
              title: 'TypeScript & Modern React Patterns',
              description: 'Server Components, Hooks architecture, Suspense and state management.',
              isCompleted: true,
              xpReward: 100,
              subtasks: ['Server actions', 'Optimistic UI', 'State boundaries'],
            ),
            RoadmapMilestone(
              id: 'fs_2',
              order: 2,
              title: 'API Design & PostgreSQL Schema',
              description: 'Normalized database design, indexing strategies and RESTful/tRPC protocols.',
              isCompleted: true,
              xpReward: 150,
              subtasks: ['Connection pooling', 'Composite indexes', 'Foreign keys'],
            ),
            RoadmapMilestone(
              id: 'fs_3',
              order: 3,
              title: 'Flutter Mobile App Architecture',
              description: 'Cross-platform reactive UI, Riverpod state injection, and Clean Architecture.',
              isCompleted: true,
              xpReward: 200,
              subtasks: ['Riverpod 3 Notifiers', 'Custom painters', 'GoRouter shell'],
            ),
            RoadmapMilestone(
              id: 'fs_4',
              order: 4,
              title: 'Authentication & Session Security',
              description: 'JWT rotation, Secure Storage, OAuth2 flows and CSRF protection.',
              isCompleted: false,
              xpReward: 175,
              subtasks: ['Biometric auth', 'Token refresh interceptors', 'PKCE flow'],
            ),
            RoadmapMilestone(
              id: 'fs_5',
              order: 5,
              title: 'Distributed Caching & Redis',
              description: 'Write-through vs read-through cache, TTL invalidation and rate limiters.',
              isCompleted: false,
              xpReward: 200,
              subtasks: ['Sliding window limiter', 'Redis pub/sub', 'Cache stampede prevention'],
            ),
            RoadmapMilestone(
              id: 'fs_6',
              order: 6,
              title: 'Docker, CI/CD & Cloud Orchestration',
              description: 'Containerized builds, GitHub Actions pipeline, and automated testing suites.',
              isCompleted: false,
              xpReward: 250,
              subtasks: ['Multi-stage Docker builds', 'Fastlane mobile deploys', 'Zero-downtime rolling update'],
            ),
            RoadmapMilestone(
              id: 'fs_7',
              order: 7,
              title: 'High-Scale Observability & Metrics',
              description: 'Telemetry, structured tracing, and real-time crash alerting.',
              isCompleted: false,
              xpReward: 300,
              subtasks: ['OpenTelemetry integration', 'Grafana alerts', 'APM tracing'],
            ),
          ],
        ),
        Roadmap(
          id: 'roadmap_dsa',
          title: 'Algorithms & Data Structures Mastery',
          description: 'High-frequency algorithmic paradigms, problem patterns and space-time optimization.',
          category: 'Computer Science',
          startDate: DateTime.now().subtract(const Duration(days: 14)),
          targetCompletionDate: DateTime.now().add(const Duration(days: 60)),
          milestones: [
            RoadmapMilestone(
              id: 'dsa_1',
              order: 1,
              title: 'Two Pointers & Sliding Window',
              description: 'Linear array processing and sub-array optimization techniques.',
              isCompleted: true,
              xpReward: 120,
              subtasks: ['Longest substring without repeat', 'Trapping rain water', 'Container with most water'],
            ),
            RoadmapMilestone(
              id: 'dsa_2',
              order: 2,
              title: 'Monotonic Stacks & Binary Search',
              description: 'Order-invariant queues, logarithmic search over answer spaces.',
              isCompleted: true,
              xpReward: 150,
              subtasks: ['Search in rotated array', 'Next greater element', 'Largest rectangle in histogram'],
            ),
            RoadmapMilestone(
              id: 'dsa_3',
              order: 3,
              title: 'Trees, Heaps & Priority Queues',
              description: 'Binary trees, LCA, segment trees, and min-heap orderings.',
              isCompleted: false,
              xpReward: 180,
              subtasks: ['Lowest Common Ancestor', 'Serialize & deserialize tree', 'Top K frequent elements'],
            ),
            RoadmapMilestone(
              id: 'dsa_4',
              order: 4,
              title: 'Graph Traversal & Topological Sort',
              description: 'BFS, DFS, Dijkstra shortest path and Kahn topological cycle detection.',
              isCompleted: false,
              xpReward: 220,
              subtasks: ['Course Schedule I & II', 'Number of Islands', 'Cheapest flights within K stops'],
            ),
            RoadmapMilestone(
              id: 'dsa_5',
              order: 5,
              title: 'Dynamic Programming & Memoization',
              description: 'State formulation, transition functions, 1D & 2D knapsack variants.',
              isCompleted: false,
              xpReward: 250,
              subtasks: ['Longest increasing subsequence', 'Coin Change', 'Word Break II'],
            ),
          ],
        ),
      ];

  @override
  Future<List<Roadmap>> getRoadmaps() async {
    return _roadmaps.where((r) => !r.isArchived).toList();
  }

  @override
  Future<Roadmap?> getRoadmapById(String id) async {
    try {
      return _roadmaps.firstWhere((r) => r.id == id);
    } catch (_) {
      return null;
    }
  }

  @override
  Future<Roadmap> saveRoadmap(Roadmap roadmap) async {
    final index = _roadmaps.indexWhere((r) => r.id == roadmap.id);
    if (index != -1) {
      _roadmaps[index] = roadmap;
    } else {
      _roadmaps.insert(0, roadmap);
    }
    await _persist();
    return roadmap;
  }

  @override
  Future<void> toggleMilestone(String roadmapId, String milestoneId) async {
    final rIndex = _roadmaps.indexWhere((r) => r.id == roadmapId);
    if (rIndex == -1) return;

    final roadmap = _roadmaps[rIndex];
    final updatedMilestones = roadmap.milestones.map((m) {
      if (m.id == milestoneId) {
        return m.copyWith(isCompleted: !m.isCompleted);
      }
      return m;
    }).toList();

    _roadmaps[rIndex] = roadmap.copyWith(milestones: updatedMilestones);
    await _persist();
  }

  @override
  Future<void> deleteRoadmap(String id) async {
    _roadmaps.removeWhere((r) => r.id == id);
    await _persist();
  }

  @override
  Future<List<Roadmap>> getTemplates() async {
    return [
      Roadmap(
        id: 'template_ai_engineer',
        title: 'Generative AI & Agent Architect',
        description: 'From vector embeddings to fine-tuning, RAG pipelines, and multi-agent systems.',
        category: 'Artificial Intelligence',
        startDate: DateTime.now(),
        targetCompletionDate: DateTime.now().add(const Duration(days: 90)),
        milestones: [
          const RoadmapMilestone(order: 1, id: 't_ai_1', title: 'Vector Embeddings & Semantic Search', description: 'Cosine similarity, HNSW indexes and vector databases (Pinecone, Qdrant).'),
          const RoadmapMilestone(order: 2, id: 't_ai_2', title: 'RAG Pipeline Architecture', description: 'Chunking strategies, hybrid search and re-ranking models.'),
          const RoadmapMilestone(order: 3, id: 't_ai_3', title: 'Agent Frameworks & Tool Calling', description: 'ReAct pattern, LangGraph, tool schema execution and memory stores.'),
          const RoadmapMilestone(order: 4, id: 't_ai_4', title: 'Evaluation & Prompt Optimization', description: 'Ragas evaluation framework, BLEU/ROUGE scoring, and hallucination guardrails.'),
        ],
      ),
      Roadmap(
        id: 'template_exam_prep',
        title: 'Intensive Academic & Certification Sprint',
        description: 'Structured 8-week mastery sprint for competitive technical certifications or exams.',
        category: 'Academics',
        startDate: DateTime.now(),
        targetCompletionDate: DateTime.now().add(const Duration(days: 60)),
        milestones: [
          const RoadmapMilestone(order: 1, id: 't_ex_1', title: 'Core Syllabus & Domain Mapping', description: 'Map exam domains and build foundational formula sheets.'),
          const RoadmapMilestone(order: 2, id: 't_ex_2', title: 'High-Yield Topic Deep Dives', description: 'Cover top 40% weighted exam questions and case studies.'),
          const RoadmapMilestone(order: 3, id: 't_ex_3', title: 'Full-Length Timed Mock 1', description: 'Identify knowledge gaps and speed bottlenecks under exam conditions.'),
          const RoadmapMilestone(order: 4, id: 't_ex_4', title: 'Weak-Area Remediation', description: 'Target error log flashcards and high-difficulty problem sets.'),
          const RoadmapMilestone(order: 5, id: 't_ex_5', title: 'Final Review & Confidence Pass', description: 'Comprehensive review with zero-distraction focus blocks.'),
        ],
      ),
    ];
  }
}
