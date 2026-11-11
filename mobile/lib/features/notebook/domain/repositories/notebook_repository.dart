import 'package:questly/features/notebook/domain/models/note.dart';

abstract class NotebookRepository {
  Future<List<Note>> getNotes({String? folderId, String? tag, String? query});
  Future<Note?> getNoteById(String id);
  Future<Note> saveNote(Note note);
  Future<void> deleteNote(String id);
  Future<void> togglePin(String id);
  Future<List<NotebookFolder>> getFolders();
}
