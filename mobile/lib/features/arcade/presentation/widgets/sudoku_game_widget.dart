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
  // Mathematically validated 6x6 Sudoku with 2x3 blocks
  static const List<List<int>> _initialBoard = [
    [1, 0, 3, 0, 5, 0],
    [0, 5, 0, 1, 0, 3],
    [2, 0, 0, 5, 0, 4],
    [0, 6, 4, 0, 3, 0],
    [3, 0, 2, 0, 4, 0],
    [0, 4, 0, 3, 0, 2],
  ];

  static const List<List<int>> _solutionBoard = [
    [1, 2, 3, 4, 5, 6],
    [4, 5, 6, 1, 2, 3],
    [2, 3, 1, 5, 6, 4],
    [5, 6, 4, 2, 3, 1],
    [3, 1, 2, 6, 4, 5],
    [6, 4, 5, 3, 1, 2],
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

  bool _isGiven(int r, int c) => _initialBoard[r][c] != 0;

  bool _hasConflict(int row, int col) {
    final val = _board[row][col];
    if (val == 0) return false;

    // 1. Check Row uniqueness
    for (int c = 0; c < 6; c++) {
      if (c != col && _board[row][c] == val) return true;
    }

    // 2. Check Column uniqueness
    for (int r = 0; r < 6; r++) {
      if (r != row && _board[r][col] == val) return true;
    }

    // 3. Check 2 rows x 3 cols block uniqueness
    final blockRowStart = (row ~/ 2) * 2;
    final blockColStart = (col ~/ 3) * 3;
    for (int r = 0; r < 2; r++) {
      for (int c = 0; c < 3; c++) {
        final curR = blockRowStart + r;
        final curC = blockColStart + c;
        if ((curR != row || curC != col) && _board[curR][curC] == val) {
          return true;
        }
      }
    }

    return false;
  }

  void _handleNumberInput(int num) {
    if (_selectedRow == null || _selectedCol == null || _isCompleted) return;

    final r = _selectedRow!;
    final c = _selectedCol!;

    // Cannot modify fixed initial numbers
    if (_isGiven(r, c)) return;

    setState(() {
      // Toggle off if clicking the same number, otherwise set
      if (_board[r][c] == num) {
        _board[r][c] = 0;
      } else {
        _board[r][c] = num;
        if (_hasConflict(r, c)) {
          _mistakes++;
        }
      }
      _checkWin();
    });
  }

  void _handleClearCell() {
    if (_selectedRow == null || _selectedCol == null || _isCompleted) return;
    final r = _selectedRow!;
    final c = _selectedCol!;
    if (_isGiven(r, c)) return;

    setState(() {
      _board[r][c] = 0;
      _checkWin();
    });
  }

  void _checkWin() {
    bool allFilled = true;
    bool hasAnyConflict = false;
    bool matchesSolution = true;

    for (int r = 0; r < 6; r++) {
      for (int c = 0; c < 6; c++) {
        if (_board[r][c] == 0) {
          allFilled = false;
        } else if (_hasConflict(r, c)) {
          hasAnyConflict = true;
        }
        if (_board[r][c] != _solutionBoard[r][c]) {
          matchesSolution = false;
        }
      }
    }

    if (allFilled && !hasAnyConflict && matchesSolution && !_isCompleted) {
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
    final selectedVal = (_selectedRow != null && _selectedCol != null)
        ? _board[_selectedRow!][_selectedCol!]
        : 0;

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
              width: 310,
              height: 310,
              decoration: BoxDecoration(
                border: Border.all(color: AppColors.darkBorder, width: 2),
                borderRadius: BorderRadius.circular(10),
                color: const Color(0xFF0E1015),
              ),
              child: Column(
                children: List.generate(6, (r) {
                  return Expanded(
                    child: Row(
                      children: List.generate(6, (c) {
                        final val = _board[r][c];
                        final isGiven = _isGiven(r, c);
                        final isSelected =
                            _selectedRow == r && _selectedCol == c;
                        final isSameNumber =
                            selectedVal > 0 && val == selectedVal;
                        final hasError = _hasConflict(r, c);

                        // Block borders: 2 rows x 3 columns
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

                        Color cellBg;
                        if (isSelected) {
                          cellBg = AppColors.limePrimary.withValues(alpha: 0.3);
                        } else if (hasError) {
                          cellBg = AppColors.error.withValues(alpha: 0.25);
                        } else if (isSameNumber) {
                          cellBg = AppColors.lavenderAccent.withValues(
                            alpha: 0.15,
                          );
                        } else if (isGiven) {
                          cellBg = AppColors.darkCard;
                        } else {
                          cellBg = AppColors.darkBase;
                        }

                        return Expanded(
                          child: GestureDetector(
                            behavior: HitTestBehavior.opaque,
                            onTap: () {
                              setState(() {
                                _selectedRow = r;
                                _selectedCol = c;
                              });
                            },
                            child: AnimatedContainer(
                              duration: const Duration(milliseconds: 120),
                              decoration: BoxDecoration(
                                color: cellBg,
                                border: Border(
                                  right: borderRight,
                                  bottom: borderBottom,
                                ),
                              ),
                              child: Center(
                                child: Text(
                                  val > 0 ? '$val' : '',
                                  style: AppTypography.titleLarge.copyWith(
                                    fontWeight: isGiven
                                        ? FontWeight.w900
                                        : FontWeight.bold,
                                    color: hasError
                                        ? AppColors.error
                                        : isGiven
                                        ? AppColors.textPrimary
                                        : isSelected
                                        ? AppColors.limePrimary
                                        : const Color(0xFF42DFFF),
                                    fontSize: 22,
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

          // Numbers Keypad (1 to 6 + Clear button)
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              ...List.generate(6, (idx) {
                final num = idx + 1;
                final isCurrentSelectedNumber = selectedVal == num;
                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 3),
                  child: SizedBox(
                    width: 42,
                    height: 46,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: isCurrentSelectedNumber
                            ? AppColors.limePrimary
                            : AppColors.darkElevatedSurface,
                        foregroundColor: isCurrentSelectedNumber
                            ? AppColors.darkBase
                            : AppColors.limePrimary,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                          side: BorderSide(
                            color: isCurrentSelectedNumber
                                ? AppColors.limePrimary
                                : AppColors.darkBorder,
                          ),
                        ),
                        padding: EdgeInsets.zero,
                      ),
                      onPressed: () => _handleNumberInput(num),
                      child: Text(
                        '$num',
                        style: AppTypography.titleLarge.copyWith(
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                  ),
                );
              }),
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 3),
                child: SizedBox(
                  width: 42,
                  height: 46,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.darkElevatedSurface,
                      foregroundColor: AppColors.error,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(8),
                        side: const BorderSide(color: AppColors.darkBorder),
                      ),
                      padding: EdgeInsets.zero,
                    ),
                    onPressed: _handleClearCell,
                    child: const Icon(Icons.backspace_outlined, size: 18),
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
