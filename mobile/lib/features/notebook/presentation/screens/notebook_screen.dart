import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:questly/app/providers/app_providers.dart';
import 'package:questly/app/router/route_names.dart';
import 'package:questly/app/theme/app_colors.dart';
import 'package:questly/app/theme/app_spacing.dart';
import 'package:questly/app/theme/app_typography.dart';
import 'package:questly/features/notebook/domain/models/note.dart';
import 'package:questly/shared/widgets/questly_card.dart';
import 'package:questly/shared/widgets/questly_grid_background.dart';

class NotebookScreen extends ConsumerStatefulWidget {
  const NotebookScreen({super.key});

  @override
  ConsumerState<NotebookScreen> createState() => _NotebookScreenState();
}

class _NotebookScreenState extends ConsumerState<NotebookScreen> {
  final _searchController = TextEditingController();
  List<Note> _notes = [];
  List<NotebookFolder> _folders = [];
  String? _selectedFolderId;
  String? _selectedTag;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
    _searchController.addListener(_onSearchChanged);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _onSearchChanged() {
    _filterNotes();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    final repo = ref.read(notebookRepositoryProvider);
    final folders = await repo.getFolders();
    final notes = await repo.getNotes();
    if (mounted) {
      setState(() {
        _folders = folders;
        _notes = notes;
        _isLoading = false;
      });
    }
  }

  Future<void> _filterNotes() async {
    final repo = ref.read(notebookRepositoryProvider);
    final query = _searchController.text.trim();
    final folderId = _selectedFolderId == 'f_all' ? null : _selectedFolderId;
    final notes = await repo.getNotes(
      folderId: folderId,
      tag: _selectedTag,
      query: query.isEmpty ? null : query,
    );
    if (mounted) {
      setState(() => _notes = notes);
    }
  }

  Future<void> _togglePin(String id) async {
    final repo = ref.read(notebookRepositoryProvider);
    await repo.togglePin(id);
    await _filterNotes();
  }

  Future<void> _createQuickNote() async {
    final repo = ref.read(notebookRepositoryProvider);
    final newNote = Note(
      id: 'note_${DateTime.now().millisecondsSinceEpoch}',
      title: 'Quick Capture',
      content: '',
      folderId: _selectedFolderId == 'f_all' ? null : _selectedFolderId,
      createdAt: DateTime.now(),
      updatedAt: DateTime.now(),
    );
    final saved = await repo.saveNote(newNote);
    if (mounted) {
      context
          .push(RoutePaths.noteEditor.replaceAll(':id', saved.id))
          .then((_) => _loadData());
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.darkBase,
      body: QuestlyGridBackground(
        child: SafeArea(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Header
              Padding(
                padding: const EdgeInsets.fromLTRB(
                  AppSpacing.md,
                  AppSpacing.md,
                  AppSpacing.md,
                  AppSpacing.xs,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'NOTEBOOK',
                          style: AppTypography.displayMedium.copyWith(
                            letterSpacing: 1.2,
                          ),
                        ),
                        Text(
                          'Capture insights, checklists & quest-linked notes',
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                    IconButton(
                      icon: const Icon(
                        Icons.note_add,
                        color: AppColors.limePrimary,
                      ),
                      onPressed: _createQuickNote,
                    ),
                  ],
                ),
              ),

              // Search Bar
              Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.md,
                  vertical: AppSpacing.xs,
                ),
                child: TextField(
                  controller: _searchController,
                  style: const TextStyle(color: AppColors.textPrimary),
                  decoration: InputDecoration(
                    hintText: 'Search notes, tags, or concepts...',
                    hintStyle: const TextStyle(color: AppColors.textTertiary),
                    prefixIcon: const Icon(
                      Icons.search,
                      color: AppColors.textTertiary,
                      size: 20,
                    ),
                    suffixIcon: _searchController.text.isNotEmpty
                        ? IconButton(
                            icon: const Icon(
                              Icons.clear,
                              color: AppColors.textTertiary,
                              size: 18,
                            ),
                            onPressed: () {
                              _searchController.clear();
                              _filterNotes();
                            },
                          )
                        : null,
                    filled: true,
                    fillColor: AppColors.darkCard,
                    contentPadding: const EdgeInsets.symmetric(
                      vertical: 0,
                      horizontal: 12,
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppColors.darkBorder),
                    ),
                  ),
                ),
              ),

              // Folder chips row
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.md,
                  vertical: AppSpacing.xs,
                ),
                child: Row(
                  children: _folders.map((folder) {
                    final isSelected =
                        (_selectedFolderId == null && folder.id == 'f_all') ||
                        _selectedFolderId == folder.id;
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: FilterChip(
                        selected: isSelected,
                        label: Text(folder.name),
                        labelStyle: TextStyle(
                          color: isSelected
                              ? AppColors.darkBase
                              : AppColors.textPrimary,
                          fontWeight: isSelected
                              ? FontWeight.bold
                              : FontWeight.normal,
                          fontSize: 12,
                        ),
                        selectedColor: AppColors.limePrimary,
                        backgroundColor: AppColors.darkCard,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(20),
                          side: BorderSide(
                            color: isSelected
                                ? AppColors.limePrimary
                                : AppColors.darkBorder,
                          ),
                        ),
                        showCheckmark: false,
                        onSelected: (selected) {
                          setState(() {
                            _selectedFolderId = folder.id;
                          });
                          _filterNotes();
                        },
                      ),
                    );
                  }).toList(),
                ),
              ),

              const SizedBox(height: AppSpacing.xs),

              // Notes list
              Expanded(
                child: _isLoading
                    ? const Center(
                        child: CircularProgressIndicator(
                          color: AppColors.limePrimary,
                        ),
                      )
                    : _notes.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(
                              Icons.edit_note,
                              size: 54,
                              color: AppColors.textTertiary,
                            ),
                            const SizedBox(height: AppSpacing.md),
                            Text(
                              'NO NOTES FOUND',
                              style: AppTypography.headlineSmall.copyWith(
                                color: AppColors.textSecondary,
                              ),
                            ),
                            const SizedBox(height: AppSpacing.xs),
                            Text(
                              'Tap the button below to capture your first note.',
                              style: AppTypography.bodySmall.copyWith(
                                color: AppColors.textTertiary,
                              ),
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        physics: const BouncingScrollPhysics(),
                        padding: const EdgeInsets.all(AppSpacing.md),
                        itemCount: _notes.length,
                        itemBuilder: (context, index) {
                          final note = _notes[index];
                          return Padding(
                            padding: const EdgeInsets.only(
                              bottom: AppSpacing.sm,
                            ),
                            child: QuestlyCard(
                              borderColor: note.isPinned
                                  ? AppColors.lavenderAccent.withValues(
                                      alpha: 0.4,
                                    )
                                  : AppColors.darkBorder,
                              onTap: () {
                                context
                                    .push(
                                      RoutePaths.noteEditor.replaceAll(
                                        ':id',
                                        note.id,
                                      ),
                                    )
                                    .then((_) => _loadData());
                              },
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Expanded(
                                        child: Text(
                                          note.title,
                                          style: AppTypography.titleMedium
                                              .copyWith(
                                                fontWeight: FontWeight.bold,
                                              ),
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                      IconButton(
                                        icon: Icon(
                                          note.isPinned
                                              ? Icons.push_pin
                                              : Icons.push_pin_outlined,
                                          size: 18,
                                          color: note.isPinned
                                              ? AppColors.lavenderAccent
                                              : AppColors.textTertiary,
                                        ),
                                        onPressed: () => _togglePin(note.id),
                                      ),
                                    ],
                                  ),
                                  if (note.content.isNotEmpty) ...[
                                    const SizedBox(height: 4),
                                    Text(
                                      note.content,
                                      maxLines: 2,
                                      overflow: TextOverflow.ellipsis,
                                      style: AppTypography.bodySmall.copyWith(
                                        color: AppColors.textSecondary,
                                      ),
                                    ),
                                  ],
                                  const SizedBox(height: AppSpacing.sm),
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      if (note.tags.isNotEmpty)
                                        Wrap(
                                          spacing: 6,
                                          children: note.tags.take(3).map((
                                            tag,
                                          ) {
                                            return Container(
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                    horizontal: 6,
                                                    vertical: 2,
                                                  ),
                                              decoration: BoxDecoration(
                                                color: AppColors.darkBase,
                                                borderRadius:
                                                    BorderRadius.circular(6),
                                                border: Border.all(
                                                  color: AppColors.darkBorder,
                                                ),
                                              ),
                                              child: Text(
                                                '#$tag',
                                                style: AppTypography.caption
                                                    .copyWith(
                                                      color:
                                                          AppColors.limePrimary,
                                                      fontSize: 10,
                                                    ),
                                              ),
                                            );
                                          }).toList(),
                                        )
                                      else
                                        const SizedBox.shrink(),
                                      Text(
                                        DateFormat('MMM d, h:mm a')
                                            .format(note.updatedAt),
                                        style: AppTypography.caption.copyWith(
                                          color: AppColors.textTertiary,
                                          fontSize: 11,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
              ),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: AppColors.limePrimary,
        foregroundColor: AppColors.darkBase,
        onPressed: _createQuickNote,
        child: const Icon(Icons.add, size: 28),
      ),
    );
  }
}
