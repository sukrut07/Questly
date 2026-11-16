import 'dart:convert';

import 'package:questly/core/storage/local_storage.dart';
import 'package:questly/features/notebook/domain/models/note.dart';
import 'package:questly/features/notebook/domain/repositories/notebook_repository.dart';

class NotebookRepositoryImpl implements NotebookRepository {
  final LocalStorage? _storage;
  final List<Note> _notes = [];

  static const String _storageKey = 'questly_notebook_notes';

  NotebookRepositoryImpl([this._storage]) {
    _loadNotes();
  }

  void _loadNotes() {
    if (_storage != null) {
      final jsonStr = _storage.getString(_storageKey);
      if (jsonStr != null && jsonStr.isNotEmpty) {
        try {
          final list = jsonDecode(jsonStr) as List<dynamic>;
          _notes.addAll(
            list.map((e) => Note.fromJson(e as Map<String, dynamic>)),
          );
          return;
        } catch (_) {}
      }
    }
    // Starts completely clean from 0 notes by default. User inputs all notes.
  }

  Future<void> _persist() async {
    if (_storage != null) {
      final jsonStr = jsonEncode(_notes.map((n) => n.toJson()).toList());
      await _storage.setString(_storageKey, jsonStr);
    }
  }

  @override
  Future<void> clearAll() async {
    _notes.clear();
    await _persist();
  }

  @override
  Future<List<Note>> getNotes({
    String? folderId,
    String? tag,
    String? query,
  }) async {
    return _notes.where((n) {
      if (n.isArchived) return false;
      if (folderId != null && n.folderId != folderId) return false;
      if (tag != null && !n.tags.contains(tag)) return false;
      if (query != null && query.isNotEmpty) {
        final q = query.toLowerCase();
        final matchTitle = n.title.toLowerCase().contains(q);
        final matchContent = n.content.toLowerCase().contains(q);
        return matchTitle || matchContent;
      }
      return true;
    }).toList()..sort((a, b) {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.updatedAt.compareTo(a.updatedAt);
    });
  }

  @override
  Future<Note?> getNoteById(String id) async {
    try {
      return _notes.firstWhere((n) => n.id == id);
    } catch (_) {
      return null;
    }
  }

  @override
  Future<Note> saveNote(Note note) async {
    final index = _notes.indexWhere((n) => n.id == note.id);
    final updated = note.copyWith(updatedAt: DateTime.now());
    if (index != -1) {
      _notes[index] = updated;
    } else {
      _notes.insert(0, updated);
    }
    await _persist();
    return updated;
  }

  @override
  Future<void> deleteNote(String id) async {
    _notes.removeWhere((n) => n.id == id);
    await _persist();
  }

  @override
  Future<void> togglePin(String id) async {
    final index = _notes.indexWhere((n) => n.id == id);
    if (index != -1) {
      _notes[index] = _notes[index].copyWith(isPinned: !_notes[index].isPinned);
      await _persist();
    }
  }

  @override
  Future<List<NotebookFolder>> getFolders() async {
    return const [
      NotebookFolder(
        id: 'f_all',
        name: 'All Notes',
        colorHex: 0xFFB5FF55,
        iconName: 'all_inclusive',
      ),
      NotebookFolder(
        id: 'f_work',
        name: 'Engineering',
        colorHex: 0xFF9575F5,
        iconName: 'code',
      ),
      NotebookFolder(
        id: 'f_learning',
        name: 'Learning & DSA',
        colorHex: 0xFFB9A3FF,
        iconName: 'school',
      ),
      NotebookFolder(
        id: 'f_ideas',
        name: 'Ideas & Focus',
        colorHex: 0xFFFFCC66,
        iconName: 'lightbulb',
      ),
    ];
  }
}
