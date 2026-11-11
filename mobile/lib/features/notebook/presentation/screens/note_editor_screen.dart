import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:questly/app/providers/app_providers.dart';
import 'package:questly/app/theme/app_colors.dart';
import 'package:questly/app/theme/app_spacing.dart';
import 'package:questly/app/theme/app_typography.dart';
import 'package:questly/features/notebook/domain/models/note.dart';

class NoteEditorScreen extends ConsumerStatefulWidget {
  final String noteId;

  const NoteEditorScreen({super.key, required this.noteId});

  @override
  ConsumerState<NoteEditorScreen> createState() => _NoteEditorScreenState();
}

class _NoteEditorScreenState extends ConsumerState<NoteEditorScreen> {
  final _titleController = TextEditingController();
  final _contentController = TextEditingController();
  Note? _note;
  bool _isLoading = true;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _loadNote();
  }

  @override
  void dispose() {
    _titleController.dispose();
    _contentController.dispose();
    super.dispose();
  }

  Future<void> _loadNote() async {
    setState(() => _isLoading = true);
    final repo = ref.read(notebookRepositoryProvider);
    final note = await repo.getNoteById(widget.noteId);
    if (note != null) {
      _note = note;
      _titleController.text = note.title;
      _contentController.text = note.content;
    }
    if (mounted) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _autoSave() async {
    if (_note == null) return;
    setState(() => _isSaving = true);
    final repo = ref.read(notebookRepositoryProvider);
    final updated = _note!.copyWith(
      title: _titleController.text.trim().isEmpty
          ? 'Untitled Note'
          : _titleController.text.trim(),
      content: _contentController.text,
      updatedAt: DateTime.now(),
    );
    _note = await repo.saveNote(updated);
    if (mounted) {
      setState(() => _isSaving = false);
    }
  }

  Future<void> _deleteNote() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.darkCard,
        title: Text(
          'DELETE NOTE',
          style: AppTypography.titleMedium.copyWith(color: AppColors.error),
        ),
        content: const Text(
          'Are you sure you want to permanently delete this note?',
          style: TextStyle(color: AppColors.textSecondary),
        ),
        actions: [
          TextButton(
            child: const Text(
              'CANCEL',
              style: TextStyle(color: AppColors.textTertiary),
            ),
            onPressed: () => Navigator.pop(ctx, false),
          ),
          TextButton(
            child: const Text(
              'DELETE',
              style: TextStyle(color: AppColors.error),
            ),
            onPressed: () => Navigator.pop(ctx, true),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      final repo = ref.read(notebookRepositoryProvider);
      await repo.deleteNote(widget.noteId);
      if (mounted) context.pop();
    }
  }

  void _insertText(String text) {
    final selection = _contentController.selection;
    final current = _contentController.text;
    final start = selection.start >= 0 ? selection.start : current.length;
    final end = selection.end >= 0 ? selection.end : current.length;
    final newText = current.replaceRange(start, end, text);
    _contentController.value = TextEditingValue(
      text: newText,
      selection: TextSelection.collapsed(offset: start + text.length),
    );
    _autoSave();
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: AppColors.darkBase,
        body: Center(
          child: CircularProgressIndicator(color: AppColors.limePrimary),
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppColors.darkBase,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(
            Icons.arrow_back_ios_new,
            color: AppColors.textPrimary,
            size: 20,
          ),
          onPressed: () async {
            await _autoSave();
            if (context.mounted) context.pop();
          },
        ),
        actions: [
          if (_isSaving)
            const Center(
              child: Padding(
                padding: EdgeInsets.symmetric(horizontal: 12),
                child: SizedBox(
                  width: 14,
                  height: 14,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: AppColors.limePrimary,
                  ),
                ),
              ),
            ),
          IconButton(
            icon: Icon(
              _note?.isPinned == true
                  ? Icons.push_pin
                  : Icons.push_pin_outlined,
              color: _note?.isPinned == true
                  ? AppColors.lavenderAccent
                  : AppColors.textSecondary,
            ),
            onPressed: () async {
              if (_note == null) return;
              final repo = ref.read(notebookRepositoryProvider);
              await repo.togglePin(_note!.id);
              await _loadNote();
            },
          ),
          IconButton(
            icon: const Icon(
              Icons.delete_outline,
              color: AppColors.textSecondary,
            ),
            onPressed: _deleteNote,
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: ListView(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
                children: [
                  TextField(
                    controller: _titleController,
                    style: AppTypography.displayMedium.copyWith(fontSize: 24),
                    decoration: const InputDecoration(
                      hintText: 'Note Title...',
                      hintStyle: TextStyle(color: AppColors.textTertiary),
                      border: InputBorder.none,
                    ),
                    onChanged: (_) => _autoSave(),
                  ),
                  const Divider(color: AppColors.darkBorder),
                  TextField(
                    controller: _contentController,
                    maxLines: null,
                    keyboardType: TextInputType.multiline,
                    style: AppTypography.bodyLarge.copyWith(height: 1.6),
                    decoration: const InputDecoration(
                      hintText:
                          'Start writing markdown, checklists, concepts...',
                      hintStyle: TextStyle(color: AppColors.textTertiary),
                      border: InputBorder.none,
                    ),
                    onChanged: (_) => _autoSave(),
                  ),
                ],
              ),
            ),

            // Quick Formatting Toolbar
            Container(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.md,
                vertical: 8,
              ),
              decoration: const BoxDecoration(
                color: AppColors.darkCard,
                border: Border(top: BorderSide(color: AppColors.darkBorder)),
              ),
              child: Row(
                children: [
                  IconButton(
                    icon: const Icon(
                      Icons.check_box_outlined,
                      color: AppColors.limePrimary,
                      size: 20,
                    ),
                    tooltip: 'Checklist Item',
                    onPressed: () => _insertText('\n- [ ] '),
                  ),
                  IconButton(
                    icon: const Icon(
                      Icons.format_list_bulleted,
                      color: AppColors.lavenderAccent,
                      size: 20,
                    ),
                    tooltip: 'Bullet',
                    onPressed: () => _insertText('\n• '),
                  ),
                  IconButton(
                    icon: const Icon(
                      Icons.tag,
                      color: AppColors.limePrimary,
                      size: 20,
                    ),
                    tooltip: 'Tag',
                    onPressed: () => _insertText('#'),
                  ),
                  IconButton(
                    icon: const Icon(
                      Icons.code,
                      color: AppColors.lavenderAccent,
                      size: 20,
                    ),
                    tooltip: 'Code snippet',
                    onPressed: () => _insertText('\n```\n\n```'),
                  ),
                  const Spacer(),
                  Text(
                    '${_contentController.text.split(RegExp(r'\s+')).where((s) => s.isNotEmpty).length} words',
                    style: AppTypography.caption.copyWith(
                      color: AppColors.textTertiary,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
