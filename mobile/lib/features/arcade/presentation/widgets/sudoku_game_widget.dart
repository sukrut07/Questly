import 'dart:async';

import 'package:flutter/material.dart';
import 'package:questly/app/theme/app_colors.dart';
import 'package:questly/app/theme/app_spacing.dart';
import 'package:questly/app/theme/app_typography.dart';
import 'package:questly/shared/widgets/questly_card.dart';

class SudokuGameWidget extends StatefulWidget {
  final VoidCallback? onBack;
  final Function(int xp)? onWon;

  const SudokuGameWidget({super.key, this.onBack, this.onWon});

  @override
  State<SudokuGameWidget> createState() => _SudokuGameWidgetState();
}

class _SudokuGameWidgetState extends State<SudokuGameWidget> {
  // 6x6 Mini Blitz board (3x2 blocks) - optimized for fast mobile play
  static const List<List<int>> _initialBoard = [
    [1, 0, 3, 0, 5, 0],
    [0, 5, 0, 1, 0, 3],
    [0, 0, 1, 6, 0, 0],
    [0, 0, 5, 4, 0, 0],
    [4, 0, 6, 0, 3, 0],
    [0, 3, 0, 5, 0, 6],
  ];

  static const List<List<int>> _solutionBoard = [
    [1, 6, 3, 2, 5, 4],
    [2, 5, 4, 1, 6, 3],
    [5, 4, 1, 6, 2, 3],
    [3, 2, 5, 4, 1, 6],
    [4, 1, 6, 2, 3, 5],
    [6, 3, 2, 5, 4, 1],
  ];

  late List<List<int>> _board;
  int? _selectedRow = 0;
  int? _selectedCol = 1;
  int _mistakes = 0;
  int _timer = 0;
  Timer? _ticker;
  bool _isCompleted = false;

  @override
  void initState() {
    super.initState();
    _resetBoard();
    _startTimer();
  }

  void _resetBoard() {
    _board = _initialBoard.map((row) => List<int>.from(row)).toList();
    _selectedRow = 0;
    _selectedCol = 1;
    _mistakes = 0;
    _timer = 0;
    _isCompleted = false;
  }

  void _startTimer() {
    _ticker?.cancel();
    _ticker = Timer.periodic(const Duration(seconds: 1), (t) {
      if (!mounted) return;
      if (!_isCompleted) {
        setState(() => _timer++);
      }
    });
  }

  @override
  void dispose() {
    _ticker?.cancel();
    super.dispose();
  }

  void _handleNumberInput(int num) {
    if (_selectedRow == null || _selectedCol == null || _isCompleted) return;

    final r = _selectedRow!;
    final c = _selectedCol!;

    // Cannot modify initial given numbers
    if (_initialBoard[r][c] != 0) return;

    setState(() {
      if (_solutionBoard[r][c] == num) {
        _board[r][c] = num;
        _checkWin();
      } else {
        _mistakes++;
      }
    });
  }

  void _checkWin() {
    bool isFull = true;
    for (int r = 0; r < 6; r++) {
      for (int c = 0; c < 6; c++) {
        if (_board[r][c] != _solutionBoard[r][c]) {
          isFull = false;
          break;
        }
      }
    }

    if (isFull && !_isCompleted) {
      _isCompleted = true;
      _ticker?.cancel();
      if (widget.onWon != null) {
        widget.onWon!(15);
      }
    }
  }

  String _formatTime(int seconds) {
    final m = seconds ~/ 60;
    final s = seconds % 60;
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    return QuestlyCard(
      borderColor: AppColors.limePrimary,
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
                            'SUDOKU BLITZ 6×6',
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
                              '+15 XP',
                              style: AppTypography.captionBold.copyWith(
                                color: AppColors.limePrimary,
                                fontSize: 10,
                              ),
                            ),
                          ),
                        ],
                      ),
                      Text(
                        'Time: ${_formatTime(_timer)} • Mistakes: $_mistakes',
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
                onPressed: () {
                  setState(() => _resetBoard());
                  _startTimer();
                },
                tooltip: 'Reset Puzzle',
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.md),

          // 6x6 Sudoku Grid
          Center(
            child: Container(
              width: 300,
              height: 300,
              decoration: BoxDecoration(
                border: Border.all(color: AppColors.darkBorder, width: 2),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Column(
                children: List.generate(6, (r) {
                  return Expanded(
                    child: Row(
                      children: List.generate(6, (c) {
                        final val = _board[r][c];
                        final isInitial = _initialBoard[r][c] != 0;
                        final isSelected =
                            _selectedRow == r && _selectedCol == c;

                        // Border styling for 3x2 subgrids
                        final borderRight = (c == 2)
                            ? const BorderSide(
                                color: AppColors.limePrimary,
                                width: 2,
                              )
                            : const BorderSide(
                                color: AppColors.darkBorder,
                                width: 0.5,
                              );
                        final borderBottom = (r == 1 || r == 3)
                            ? const BorderSide(
                                color: AppColors.limePrimary,
                                width: 2,
                              )
                            : const BorderSide(
                                color: AppColors.darkBorder,
                                width: 0.5,
                              );

                        return Expanded(
                          child: GestureDetector(
                            onTap: () {
                              setState(() {
                                _selectedRow = r;
                                _selectedCol = c;
                              });
                            },
                            child: Container(
                              decoration: BoxDecoration(
                                color: isSelected
                                    ? AppColors.limePrimary.withValues(
                                        alpha: 0.25,
                                      )
                                    : isInitial
                                    ? AppColors.darkCard
                                    : AppColors.darkBase,
                                border: Border(
                                  right: borderRight,
                                  bottom: borderBottom,
                                ),
                              ),
                              child: Center(
                                child: Text(
                                  val > 0 ? '$val' : '',
                                  style: AppTypography.titleLarge.copyWith(
                                    fontWeight: isInitial
                                        ? FontWeight.w900
                                        : FontWeight.bold,
                                    color: isInitial
                                        ? AppColors.textPrimary
                                        : AppColors.limePrimary,
                                  ),
                                ),
                              ),
                            ),
                          ),
                        );
                      }),
                    ),
                  );
                }),
              ),
            ),
          ),

          const SizedBox(height: AppSpacing.md),

          // Completed Celebration Banner
          if (_isCompleted) ...[
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
                        Icons.emoji_events_rounded,
                        color: AppColors.limePrimary,
                        size: 24,
                      ),
                      const SizedBox(width: AppSpacing.xs),
                      Text(
                        'SUDOKU SOLVED! +15 XP',
                        style: AppTypography.titleSmall.copyWith(
                          color: AppColors.limePrimary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  TextButton(
                    onPressed: () {
                      setState(() => _resetBoard());
                      _startTimer();
                    },
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

          // Numbers Keypad (1 to 6)
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(6, (idx) {
              final num = idx + 1;
              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                child: SizedBox(
                  width: 44,
                  height: 44,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.darkElevatedSurface,
                      foregroundColor: AppColors.limePrimary,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                        side: const BorderSide(color: AppColors.darkBorder),
                      ),
                      padding: EdgeInsets.zero,
                    ),
                    onPressed: () => _handleNumberInput(num),
                    child: Text(
                      '$num',
                      style: AppTypography.titleLarge.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
              );
            }),
          ),
        ],
      ),
    );
  }
}
