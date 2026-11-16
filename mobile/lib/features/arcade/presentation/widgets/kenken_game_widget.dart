import 'dart:async';

import 'package:flutter/material.dart';
import 'package:questly/app/theme/app_colors.dart';
import 'package:questly/app/theme/app_spacing.dart';
import 'package:questly/app/theme/app_typography.dart';
import 'package:questly/shared/widgets/questly_card.dart';

class KenKenCage {
  final String id;
  final int target;
  final String operation; // '+', '-', '*', '/', ''
  final List<int> cellIndices; // 0 to 15
  final Color color;

  const KenKenCage({
    required this.id,
    required this.target,
    required this.operation,
    required this.cellIndices,
    required this.color,
  });
}

class KenKenPuzzleData {
  final int size; // 4
  final List<int> solution;
  final List<KenKenCage> cages;

  const KenKenPuzzleData({
    required this.size,
    required this.solution,
    required this.cages,
  });
}

class KenKenGameWidget extends StatefulWidget {
  final VoidCallback? onBack;
  final Function(int xp)? onWon;

  const KenKenGameWidget({super.key, this.onBack, this.onWon});

  @override
  State<KenKenGameWidget> createState() => _KenKenGameWidgetState();
}

class _KenKenGameWidgetState extends State<KenKenGameWidget> {
  static const List<KenKenPuzzleData> _puzzles = [
    KenKenPuzzleData(
      size: 4,
      solution: [2, 1, 4, 3, 1, 4, 3, 2, 4, 3, 2, 1, 3, 2, 1, 4],
      cages: [
        KenKenCage(
          id: 'c1',
          target: 3,
          operation: '+',
          cellIndices: [0, 1],
          color: AppColors.limePrimary,
        ),
        KenKenCage(
          id: 'c2',
          target: 12,
          operation: '*',
          cellIndices: [2, 3],
          color: Color(0xFF42DFFF),
        ),
        KenKenCage(
          id: 'c3',
          target: 4,
          operation: '/',
          cellIndices: [4, 8],
          color: AppColors.lavenderAccent,
        ),
        KenKenCage(
          id: 'c4',
          target: 7,
          operation: '+',
          cellIndices: [5, 6],
          color: Color(0xFFFF806B),
        ),
        KenKenCage(
          id: 'c5',
          target: 2,
          operation: '/',
          cellIndices: [7, 11],
          color: Color(0xFFFFD76A),
        ),
        KenKenCage(
          id: 'c6',
          target: 1,
          operation: '-',
          cellIndices: [9, 10],
          color: AppColors.limePrimary,
        ),
        KenKenCage(
          id: 'c7',
          target: 6,
          operation: '+',
          cellIndices: [12, 13, 14],
          color: Color(0xFF42DFFF),
        ),
        KenKenCage(
          id: 'c8',
          target: 4,
          operation: '',
          cellIndices: [15],
          color: AppColors.lavenderAccent,
        ),
      ],
    ),
  ];

  late KenKenPuzzleData _activePuzzle;
  List<int> _grid = List.filled(16, 0);
  int? _selectedCell = 0;
  int _elapsedSeconds = 0;
  Timer? _timer;
  bool _isWon = false;
  Set<int> _errors = {};

  @override
  void initState() {
    super.initState();
    _activePuzzle = _puzzles.first;
    _startTimer();
  }

  void _startTimer() {
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (!mounted) return;
      if (!_isWon) {
        setState(() => _elapsedSeconds++);
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _resetGame() {
    setState(() {
      _grid = List.filled(16, 0);
      _selectedCell = 0;
      _elapsedSeconds = 0;
      _isWon = false;
      _errors.clear();
    });
    _startTimer();
  }

  void _handleNumberInput(int num) {
    if (_selectedCell == null || _isWon) return;

    setState(() {
      _grid[_selectedCell!] = num;
      _validateGrid();
    });
  }

  void _handleClearCell() {
    if (_selectedCell == null || _isWon) return;

    setState(() {
      _grid[_selectedCell!] = 0;
      _validateGrid();
    });
  }

  void _validateGrid() {
    final newErrors = <int>{};

    // 1. Check Row & Column duplicates
    for (int r = 0; r < 4; r++) {
      final seenRow = <int, int>{};
      for (int c = 0; c < 4; c++) {
        final idx = r * 4 + c;
        final val = _grid[idx];
        if (val > 0) {
          if (seenRow.containsKey(val)) {
            newErrors.add(idx);
            newErrors.add(seenRow[val]!);
          } else {
            seenRow[val] = idx;
          }
        }
      }
    }

    for (int c = 0; c < 4; c++) {
      final seenCol = <int, int>{};
      for (int r = 0; r < 4; r++) {
        final idx = r * 4 + c;
        final val = _grid[idx];
        if (val > 0) {
          if (seenCol.containsKey(val)) {
            newErrors.add(idx);
            newErrors.add(seenCol[val]!);
          } else {
            seenCol[val] = idx;
          }
        }
      }
    }

    // 2. Check full completion and cage arithmetic
    final isFull = _grid.every((v) => v > 0);
    final isCorrect = _grid.asMap().entries.every(
      (e) => e.value == _activePuzzle.solution[e.key],
    );

    _errors = newErrors;

    if (isFull && isCorrect && newErrors.isEmpty && !_isWon) {
      _isWon = true;
      _timer?.cancel();
      if (widget.onWon != null) {
        widget.onWon!(10);
      }
    }
  }

  String? _getCageLabel(int cellIdx) {
    for (final cage in _activePuzzle.cages) {
      if (cage.cellIndices.contains(cellIdx)) {
        final firstCell = cage.cellIndices.reduce((a, b) => a < b ? a : b);
        if (firstCell == cellIdx) {
          final op = cage.operation == '*'
              ? '×'
              : cage.operation == '/'
              ? '÷'
              : cage.operation;
          return '${cage.target}$op';
        }
      }
    }
    return null;
  }

  KenKenCage? _getCage(int cellIdx) {
    for (final cage in _activePuzzle.cages) {
      if (cage.cellIndices.contains(cellIdx)) return cage;
    }
    return null;
  }

  String _formatTime(int secs) {
    final m = secs ~/ 60;
    final s = secs % 60;
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return QuestlyCard(
      borderColor: AppColors.lavenderAccent,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header Bar
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  if (widget.onBack != null)
                    IconButton(
                      icon: const Icon(
                        Icons.arrow_back_ios_new,
                        color: AppColors.textPrimary,
                        size: 18,
                      ),
                      onPressed: widget.onBack,
                    ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            'KENKEN 4×4',
                            style: AppTypography.titleMedium.copyWith(
                              letterSpacing: 1.0,
                              fontWeight: FontWeight.bold,
                              color: AppColors.limePrimary,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 6,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.limePrimary.withValues(
                                alpha: 0.15,
                              ),
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              '+10 XP',
                              style: AppTypography.captionBold.copyWith(
                                color: AppColors.limePrimary,
                                fontSize: 10,
                              ),
                            ),
                          ),
                        ],
                      ),
                      Text(
                        'Time: ${_formatTime(_elapsedSeconds)}',
                        style: AppTypography.caption.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              IconButton(
                icon: const Icon(Icons.refresh, color: AppColors.textSecondary),
                onPressed: _resetGame,
                tooltip: 'Reset Puzzle',
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.md),

          // 4x4 KenKen Grid
          Center(
            child: SizedBox(
              width: 280,
              height: 280,
              child: GridView.builder(
                itemCount: 16,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 4,
                  mainAxisSpacing: 4,
                  crossAxisSpacing: 4,
                ),
                itemBuilder: (context, idx) {
                  final cage = _getCage(idx);
                  final label = _getCageLabel(idx);
                  final val = _grid[idx];
                  final isSelected = _selectedCell == idx;
                  final hasError = _errors.contains(idx);

                  return GestureDetector(
                    onTap: () {
                      setState(() => _selectedCell = idx);
                    },
                    child: Container(
                      decoration: BoxDecoration(
                        color: isSelected
                            ? AppColors.limePrimary.withValues(alpha: 0.25)
                            : hasError
                            ? AppColors.error.withValues(alpha: 0.2)
                            : cage != null
                            ? cage.color.withValues(alpha: 0.1)
                            : AppColors.darkBase,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(
                          color: isSelected
                              ? AppColors.limePrimary
                              : hasError
                              ? AppColors.error
                              : cage != null
                              ? cage.color.withValues(alpha: 0.5)
                              : AppColors.darkBorder,
                          width: isSelected ? 2.0 : 1.5,
                        ),
                      ),
                      child: Stack(
                        children: [
                          if (label != null)
                            Positioned(
                              top: 2,
                              left: 4,
                              child: Text(
                                label,
                                style: AppTypography.captionBold.copyWith(
                                  fontSize: 10,
                                  color: cage?.color ?? AppColors.textSecondary,
                                ),
                              ),
                            ),
                          Center(
                            child: Text(
                              val > 0 ? '$val' : '',
                              style: AppTypography.displayMedium.copyWith(
                                fontSize: 24,
                                color: hasError
                                    ? AppColors.error
                                    : isSelected
                                    ? AppColors.limePrimary
                                    : AppColors.textPrimary,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  );
                },
              ),
            ),
          ),

          const SizedBox(height: AppSpacing.md),

          // Victory Banner
          if (_isWon) ...[
            Container(
              padding: const EdgeInsets.all(AppSpacing.sm),
              decoration: BoxDecoration(
                color: AppColors.limePrimary.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.limePrimary),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(
                        Icons.check_circle_rounded,
                        color: AppColors.limePrimary,
                        size: 24,
                      ),
                      const SizedBox(width: AppSpacing.xs),
                      Text(
                        'PUZZLE CLEARED! +10 XP',
                        style: AppTypography.titleSmall.copyWith(
                          color: AppColors.limePrimary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  TextButton(
                    onPressed: _resetGame,
                    child: const Text(
                      'PLAY AGAIN',
                      style: TextStyle(
                        color: AppColors.limePrimary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
          ],

          // Number Keypad (1 to 4 and Clear)
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              ...[1, 2, 3, 4].map((val) {
                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: SizedBox(
                    width: 52,
                    height: 48,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.darkElevatedSurface,
                        foregroundColor: AppColors.limePrimary,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                          side: const BorderSide(color: AppColors.darkBorder),
                        ),
                        padding: EdgeInsets.zero,
                      ),
                      onPressed: () => _handleNumberInput(val),
                      child: Text(
                        '$val',
                        style: AppTypography.titleLarge.copyWith(
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                  ),
                );
              }),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                child: SizedBox(
                  width: 52,
                  height: 48,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.darkElevatedSurface,
                      foregroundColor: AppColors.error,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(10),
                        side: const BorderSide(color: AppColors.darkBorder),
                      ),
                      padding: EdgeInsets.zero,
                    ),
                    onPressed: _handleClearCell,
                    child: const Icon(Icons.backspace_outlined, size: 20),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
