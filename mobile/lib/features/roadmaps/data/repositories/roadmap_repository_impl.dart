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
          _roadmaps.addAll(
            list.map((e) => Roadmap.fromJson(e as Map<String, dynamic>)),
          );
          return;
        } catch (_) {}
      }
    }
    // Starts from 0 active roadmaps by default. User inputs custom roadmaps or adopts templates.
  }

  Future<void> _persist() async {
    if (_storage != null) {
      final jsonStr = jsonEncode(_roadmaps.map((r) => r.toJson()).toList());
      await _storage.setString(_storageKey, jsonStr);
    }
  }

  @override
  Future<void> clearAll() async {
    _roadmaps.clear();
    await _persist();
  }

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
          const RoadmapMilestone(
            order: 1,
            id: 't_ai_1',
            title: 'Vector Embeddings & Semantic Search',
            description: 'Cosine similarity, HNSW indexes and vector databases (Pinecone, Qdrant).',
          ),
          const RoadmapMilestone(
            order: 2,
            id: 't_ai_2',
            title: 'RAG Pipeline Architecture',
            description:
                'Chunking strategies, hybrid search and re-ranking models.',
          ),
          const RoadmapMilestone(
            order: 3,
            id: 't_ai_3',
            title: 'Agent Frameworks & Tool Calling',
            description: 'ReAct pattern, LangGraph, tool schema execution and memory stores.',
          ),
          const RoadmapMilestone(
            order: 4,
            id: 't_ai_4',
            title: 'Evaluation & Prompt Optimization',
            description: 'Ragas evaluation framework, BLEU/ROUGE scoring, and hallucination guardrails.',
          ),
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
          const RoadmapMilestone(
            order: 1,
            id: 't_ex_1',
            title: 'Core Syllabus & Domain Mapping',
            description:
                'Map exam domains and build foundational formula sheets.',
          ),
          const RoadmapMilestone(
            order: 2,
            id: 't_ex_2',
            title: 'High-Yield Topic Deep Dives',
            description:
                'Cover top 40% weighted exam questions and case studies.',
          ),
          const RoadmapMilestone(
            order: 3,
            id: 't_ex_3',
            title: 'Full-Length Timed Mock 1',
            description: 'Identify knowledge gaps and speed bottlenecks under exam conditions.',
          ),
          const RoadmapMilestone(
            order: 4,
            id: 't_ex_4',
            title: 'Weak-Area Remediation',
            description:
                'Target error log flashcards and high-difficulty problem sets.',
          ),
          const RoadmapMilestone(
            order: 5,
            id: 't_ex_5',
            title: 'Final Review & Confidence Pass',
            description:
                'Comprehensive review with zero-distraction focus blocks.',
          ),
        ],
      ),
    ];
  }
}
