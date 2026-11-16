import 'package:flutter_test/flutter_test.dart';
import 'package:questly/features/notebook/data/repositories/notebook_repository_impl.dart';
import 'package:questly/features/notebook/domain/models/note.dart';

void main() {
  group('NotebookRepository', () {
    late NotebookRepositoryImpl repository;

    setUp(() {
      repository = NotebookRepositoryImpl();
    });

    test('starts with 0 notes by default', () async {
      final notes = await repository.getNotes();
      expect(notes.isEmpty, isTrue);
    });

    test('can save a new note and retrieve it', () async {
      final newNote = Note(
        id: 'test_note_1',
        title: 'Test Note Title',
        content: 'Test content here',
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      final saved = await repository.saveNote(newNote);
      expect(saved.id, equals('test_note_1'));

      final retrieved = await repository.getNoteById('test_note_1');
      expect(retrieved, isNotNull);
      expect(retrieved!.title, equals('Test Note Title'));
    });

    test('can toggle pin on a note', () async {
      final newNote = Note(
        id: 'pinned_test_note',
        title: 'Note to Pin',
        content: 'Content',
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );
      await repository.saveNote(newNote);

      final target = await repository.getNoteById('pinned_test_note');
      final initialPin = target!.isPinned;

      await repository.togglePin(target.id);
      final updated = await repository.getNoteById(target.id);
      expect(updated!.isPinned, equals(!initialPin));
    });

    test('filters notes by search query', () async {
      await repository.saveNote(
        Note(
          id: 'searchable_note',
          title: 'Algorithmic Optimization',
          content: 'Dynamic programming state transitions',
          createdAt: DateTime.now(),
          updatedAt: DateTime.now(),
        ),
      );

      final results = await repository.getNotes(query: 'Optimization');
      expect(results.any((n) => n.id == 'searchable_note'), isTrue);

      final noResults = await repository.getNotes(
        query: 'NonexistentGibberishTerm',
      );
      expect(noResults.isEmpty, isTrue);
    });
  });
}
