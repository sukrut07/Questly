import 'dart:convert';

import 'package:questly/core/storage/local_storage.dart';
import 'package:questly/features/focus/domain/models/focus_session.dart';
import 'package:questly/features/focus/domain/repositories/focus_repository.dart';

class FocusRepositoryImpl implements FocusRepository {
  final LocalStorage? _storage;
  final List<FocusSession> _sessions = [];

  static const String _storageKey = 'questly_focus_sessions';

  FocusRepositoryImpl([this._storage]) {
    _loadSessions();
  }

  void _loadSessions() {
    if (_storage != null) {
      final jsonStr = _storage.getString(_storageKey);
      if (jsonStr != null && jsonStr.isNotEmpty) {
        try {
          final list = jsonDecode(jsonStr) as List<dynamic>;
          _sessions.addAll(
            list.map((e) => FocusSession.fromJson(e as Map<String, dynamic>)),
          );
          return;
        } catch (_) {}
      }
    }
    // Starts completely clean from 0 focus sessions by default. User logs focus sessions.
  }

  Future<void> _persist() async {
    if (_storage != null) {
      final jsonStr = jsonEncode(_sessions.map((s) => s.toJson()).toList());
      await _storage.setString(_storageKey, jsonStr);
    }
  }

  @override
  Future<void> clearAll() async {
    _sessions.clear();
    await _persist();
  }

  @override
  Future<List<FocusSession>> getRecentSessions() async {
    return List.from(_sessions)
      ..sort((a, b) => b.startedAt.compareTo(a.startedAt));
  }

  @override
  Future<FocusSession> saveSession(FocusSession session) async {
    final index = _sessions.indexWhere((s) => s.id == session.id);
    if (index != -1) {
      _sessions[index] = session;
    } else {
      _sessions.insert(0, session);
    }
    await _persist();
    return session;
  }

  @override
  Future<int> getTotalFocusMinutes() async {
    return _sessions
        .where((s) => s.isCompleted)
        .fold<int>(0, (sum, s) => sum + (s.elapsedSeconds ~/ 60));
  }
}
