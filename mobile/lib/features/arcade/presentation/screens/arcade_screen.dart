import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:questly/app/providers/app_providers.dart';
import 'package:questly/app/theme/app_colors.dart';
import 'package:questly/app/theme/app_spacing.dart';
import 'package:questly/app/theme/app_typography.dart';
import 'package:questly/features/arcade/presentation/widgets/kenken_game_widget.dart';
import 'package:questly/features/arcade/presentation/widgets/sudoku_game_widget.dart';
import 'package:questly/features/dashboard/presentation/providers/dashboard_providers.dart';
import 'package:questly/shared/widgets/questly_button.dart';
import 'package:questly/shared/widgets/questly_card.dart';
import 'package:questly/shared/widgets/questly_grid_background.dart';

enum BotDifficulty { rookie, scholar, grandmaster }

enum ActiveArcadeGame { none, mathSprint, kenken, sudoku, xoxoBot }

class ArcadeScreen extends ConsumerStatefulWidget {
  const ArcadeScreen({super.key});

  @override
  ConsumerState<ArcadeScreen> createState() => _ArcadeScreenState();
}

class _ArcadeScreenState extends ConsumerState<ArcadeScreen> {
  ActiveArcadeGame _activeGame = ActiveArcadeGame.none;
  int _selectedCategoryIndex = 0; // 0: All, 1: Math, 2: Puzzle, 3: Duels

  // Daily Arcade XP Cap Tracking (Max 20 XP / day)
  int _todayArcadeXp = 8;
  static const int _dailyArcadeCap = 20;

  // Math Sprint State
  int _score = 0;
  int _timeLeft = 15;
  Timer? _timer;
  int _num1 = 7;
  int _num2 = 8;
  int _correctAnswer = 56;
  List<int> _options = [48, 54, 56, 63];

  // XOXO vs Computer Bot State
  List<String?> _xoxoBoard = List.filled(9, null);
  String? _xoxoWinner; // 'X', 'O', 'draw', or null
  List<int>? _winningLine;
  bool _isPlayerTurn = true;
  bool _isBotThinking = false;
  BotDifficulty _botDifficulty = BotDifficulty.scholar;
  int _xoxoPlayerWins = 0;
  int _xoxoBotWins = 0;
  int _xoxoDraws = 0;

  void _awardArcadeXp(int amount, String title) {
    final granted = math.min(
      amount,
      math.max(0, _dailyArcadeCap - _todayArcadeXp),
    );
    if (granted > 0) {
      setState(() {
        _todayArcadeXp += granted;
      });
      ref.read(dashboardRepositoryProvider).addXp(granted);
      ref.read(dashboardStateProvider.notifier).refresh();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('$title: +$granted XP awarded!'),
          backgroundColor: AppColors.limePrimary,
          behavior: SnackBarBehavior.floating,
          duration: const Duration(seconds: 2),
        ),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text(
            'Daily Arcade Cap (20 XP) reached! Focus on coursework tasks to earn more XP.',
          ),
          backgroundColor: AppColors.lavenderAccent,
          behavior: SnackBarBehavior.floating,
        ),
      );
    }
  }

  // --- MATH SPRINT LOGIC ---
  void _startMathSprint() {
    setState(() {
      _activeGame = ActiveArcadeGame.mathSprint;
      _score = 0;
      _timeLeft = 15;
      _generateMathQuestion();
    });

    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (!mounted) return;
      if (_timeLeft > 1) {
        setState(() => _timeLeft--);
      } else {
        _timer?.cancel();
        _finishMathSprint();
      }
    });
  }

  void _generateMathQuestion() {
    final rand = math.Random();
    _num1 = rand.nextInt(9) + 2;
    _num2 = rand.nextInt(9) + 2;
    _correctAnswer = _num1 * _num2;

    final opts = <int>{_correctAnswer};
    while (opts.length < 4) {
      final delta = (rand.nextInt(5) + 1) * (rand.nextBool() ? 1 : -1);
      final fake = _correctAnswer + delta;
      if (fake > 0) opts.add(fake);
    }
    _options = opts.toList()..shuffle();
  }

  void _submitMathAnswer(int val) {
    if (_activeGame != ActiveArcadeGame.mathSprint) return;
    if (val == _correctAnswer) {
      setState(() {
        _score++;
        _generateMathQuestion();
      });
    } else {
      setState(() {
        if (_score > 0) _score--;
      });
    }
  }

  void _finishMathSprint() {
    setState(() => _activeGame = ActiveArcadeGame.none);
    final earned = math.min(10, _score * 2);
    _awardArcadeXp(earned, 'Math Sprint Complete');
  }

  // --- XOXO MINIMAX BOT LOGIC ---
  void _startXoxoGame() {
    setState(() {
      _activeGame = ActiveArcadeGame.xoxoBot;
      _xoxoBoard = List.filled(9, null);
      _xoxoWinner = null;
      _winningLine = null;
      _isPlayerTurn = true;
      _isBotThinking = false;
    });
  }

  void _handleXoxoTap(int index) {
    if (_xoxoBoard[index] != null ||
        _xoxoWinner != null ||
        !_isPlayerTurn ||
        _isBotThinking) {
      return;
    }

    setState(() {
      _xoxoBoard[index] = 'X';
      _checkXoxoState();
    });

    if (_xoxoWinner == null) {
      setState(() {
        _isPlayerTurn = false;
        _isBotThinking = true;
      });
      Future.delayed(const Duration(milliseconds: 400), () {
        if (!mounted) return;
        _executeBotMove();
      });
    }
  }

  void _executeBotMove() {
    final move = _computeBotMove();
    if (move != -1) {
      setState(() {
        _xoxoBoard[move] = 'O';
        _isPlayerTurn = true;
        _isBotThinking = false;
        _checkXoxoState();
      });
    }
  }

  int _computeBotMove() {
    final available = <int>[];
    for (int i = 0; i < 9; i++) {
      if (_xoxoBoard[i] == null) available.add(i);
    }

    if (available.isEmpty) return -1;

    // 1. Rookie: random move
    if (_botDifficulty == BotDifficulty.rookie) {
      return available[math.Random().nextInt(available.length)];
    }

    // 2. Scholar: check win or block win, otherwise pick center/corner
    if (_botDifficulty == BotDifficulty.scholar) {
      // Can bot win?
      for (final idx in available) {
        final copy = List<String?>.from(_xoxoBoard);
        copy[idx] = 'O';
        if (_evaluateWinner(copy).winner == 'O') return idx;
      }
      // Must bot block player?
      for (final idx in available) {
        final copy = List<String?>.from(_xoxoBoard);
        copy[idx] = 'X';
        if (_evaluateWinner(copy).winner == 'X') return idx;
      }
      // Pick center if free
      if (_xoxoBoard[4] == null) return 4;
      // Pick corner
      final corners = [0, 2, 6, 8].where((c) => _xoxoBoard[c] == null).toList();
      if (corners.isNotEmpty) {
        return corners[math.Random().nextInt(corners.length)];
      }
      return available[math.Random().nextInt(available.length)];
    }

    // 3. Grandmaster: Minimax Search
    int bestScore = -1000;
    int bestMove = available.first;

    for (final idx in available) {
      _xoxoBoard[idx] = 'O';
      final score = _minimax(_xoxoBoard, 0, false);
      _xoxoBoard[idx] = null;
      if (score > bestScore) {
        bestScore = score;
        bestMove = idx;
      }
    }
    return bestMove;
  }

  int _minimax(List<String?> board, int depth, bool isMaximizing) {
    final res = _evaluateWinner(board);
    if (res.winner == 'O') return 10 - depth;
    if (res.winner == 'X') return depth - 10;
    if (res.winner == 'draw') return 0;

    if (isMaximizing) {
      int best = -1000;
      for (int i = 0; i < 9; i++) {
        if (board[i] == null) {
          board[i] = 'O';
          best = math.max(best, _minimax(board, depth + 1, false));
          board[i] = null;
        }
      }
      return best;
    } else {
      int best = 1000;
      for (int i = 0; i < 9; i++) {
        if (board[i] == null) {
          board[i] = 'X';
          best = math.min(best, _minimax(board, depth + 1, true));
          board[i] = null;
        }
      }
      return best;
    }
  }

  ({String? winner, List<int>? line}) _evaluateWinner(List<String?> board) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];

    for (final line in lines) {
      final a = board[line[0]];
      final b = board[line[1]];
      final c = board[line[2]];
      if (a != null && a == b && a == c) {
        return (winner: a, line: line);
      }
    }

    if (board.every((sq) => sq != null)) {
      return (winner: 'draw', line: null);
    }

    return (winner: null, line: null);
  }

  void _checkXoxoState() {
    final res = _evaluateWinner(_xoxoBoard);
    if (res.winner != null) {
      setState(() {
        _xoxoWinner = res.winner;
        _winningLine = res.line;
        if (res.winner == 'X') {
          _xoxoPlayerWins++;
          _awardArcadeXp(8, 'XOXO Victory');
        } else if (res.winner == 'O') {
          _xoxoBotWins++;
        } else if (res.winner == 'draw') {
          _xoxoDraws++;
          _awardArcadeXp(3, 'Tactical Draw');
        }
      });
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.darkBase,
      body: QuestlyGridBackground(
        child: SafeArea(
          child: ListView(
            padding: const EdgeInsets.all(AppSpacing.md),
            children: [
              // Top Navigation Bar
              Row(
                children: [
                  IconButton(
                    icon: const Icon(
                      Icons.arrow_back_ios_new,
                      color: AppColors.textPrimary,
                      size: 20,
                    ),
                    onPressed: () {
                      if (_activeGame != ActiveArcadeGame.none) {
                        setState(() => _activeGame = ActiveArcadeGame.none);
                      } else {
                        context.pop();
                      }
                    },
                  ),
                  const SizedBox(width: AppSpacing.xs),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'ARCADE ARENA',
                          style: AppTypography.titleLarge.copyWith(
                            letterSpacing: 1.0,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          'Sharpen focus, mental math, and pattern tactics',
                          style: AppTypography.caption.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ],
                    ),
                  ),
                  // Daily Cap Counter
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 5,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.darkCard,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: _todayArcadeXp >= _dailyArcadeCap
                            ? AppColors.lavenderAccent
                            : AppColors.limePrimary.withValues(alpha: 0.5),
                      ),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.bolt_rounded,
                          color: _todayArcadeXp >= _dailyArcadeCap
                              ? AppColors.lavenderAccent
                              : AppColors.limePrimary,
                          size: 16,
                        ),
                        const SizedBox(width: 4),
                        Text(
                          '$_todayArcadeXp / $_dailyArcadeCap XP',
                          style: AppTypography.captionBold.copyWith(
                            color: AppColors.textPrimary,
                            fontSize: 11,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),

              const SizedBox(height: AppSpacing.md),

              // Game View Swapping
              if (_activeGame == ActiveArcadeGame.kenken)
                KenKenGameWidget(
                  onBack: () =>
                      setState(() => _activeGame = ActiveArcadeGame.none),
                  onWon: (xp) => _awardArcadeXp(xp, 'KenKen Calcudoku'),
                )
              else if (_activeGame == ActiveArcadeGame.sudoku)
                SudokuGameWidget(
                  onBack: () =>
                      setState(() => _activeGame = ActiveArcadeGame.none),
                  onWon: (xp) => _awardArcadeXp(xp, 'Sudoku Blitz'),
                )
              else if (_activeGame == ActiveArcadeGame.xoxoBot)
                _buildXoxoGameView()
              else if (_activeGame == ActiveArcadeGame.mathSprint)
                _buildMathSprintView()
              else ...[
                // Category Filter Tabs
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _buildCategoryTile(0, Icons.grid_view_rounded, 'ALL'),
                    _buildCategoryTile(1, Icons.speed_rounded, 'MATH'),
                    _buildCategoryTile(2, Icons.extension_rounded, 'PUZZLE'),
                    _buildCategoryTile(3, Icons.smart_toy_rounded, 'DUELS'),
                  ],
                ),
                const SizedBox(height: AppSpacing.md),

                // Featured Hero: XOXO Bot Duel
                if (_selectedCategoryIndex == 0 || _selectedCategoryIndex == 3)
                  QuestlyCard(
                    borderColor: AppColors.lavenderAccent,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 3,
                              ),
                              decoration: BoxDecoration(
                                color: AppColors.lavenderAccent.withValues(
                                  alpha: 0.15,
                                ),
                                borderRadius: BorderRadius.circular(10),
                              ),
                              child: Text(
                                'MINIMAX BOT DUEL',
                                style: AppTypography.captionBold.copyWith(
                                  color: AppColors.lavenderAccent,
                                ),
                              ),
                            ),
                            Text(
                              'Score: $_xoxoPlayerWins W - $_xoxoBotWins L',
                              style: AppTypography.captionBold.copyWith(
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: AppSpacing.sm),
                        Text(
                          'XOXO TACTICAL BOT',
                          style: AppTypography.titleLarge.copyWith(
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        Text(
                          'Play 3×3 grid strategy against our unbeatable Minimax algorithm. Win to earn +8 XP.',
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                        const SizedBox(height: AppSpacing.md),
                        QuestlyButton(
                          text: 'PLAY VS BOT (+8 XP)',
                          icon: Icons.sports_esports_rounded,
                          variant: QuestlyButtonVariant.primaryLime,
                          size: QuestlyButtonSize.medium,
                          onPressed: _startXoxoGame,
                        ),
                      ],
                    ),
                  ),

                const SizedBox(height: AppSpacing.md),

                // KenKen Calcudoku Card
                if (_selectedCategoryIndex == 0 ||
                    _selectedCategoryIndex == 1 ||
                    _selectedCategoryIndex == 2)
                  QuestlyCard(
                    borderColor: AppColors.limePrimary.withValues(alpha: 0.5),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 3,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.limePrimary.withValues(
                              alpha: 0.15,
                            ),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            'ARITHMETIC CAGES',
                            style: AppTypography.captionBold.copyWith(
                              color: AppColors.limePrimary,
                            ),
                          ),
                        ),
                        const SizedBox(height: AppSpacing.sm),
                        Text(
                          'KENKEN CALCUDOKU 4×4',
                          style: AppTypography.titleLarge.copyWith(
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        Text(
                          'Fill the grid with unique numbers so each cage satisfies its target arithmetic operator.',
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                        const SizedBox(height: AppSpacing.md),
                        QuestlyButton(
                          text: 'SOLVE KENKEN (+10 XP)',
                          icon: Icons.calculate_rounded,
                          variant: QuestlyButtonVariant.secondaryLavender,
                          size: QuestlyButtonSize.medium,
                          onPressed: () => setState(
                            () => _activeGame = ActiveArcadeGame.kenken,
                          ),
                        ),
                      ],
                    ),
                  ),

                const SizedBox(height: AppSpacing.md),

                // Sudoku Blitz Card
                if (_selectedCategoryIndex == 0 || _selectedCategoryIndex == 2)
                  QuestlyCard(
                    borderColor: const Color(0xFF42DFFF).withValues(alpha: 0.5),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 3,
                          ),
                          decoration: BoxDecoration(
                            color: const Color(0xFF42DFFF)
                                .withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            'LOGIC MATRIX',
                            style: AppTypography.captionBold.copyWith(
                              color: const Color(0xFF42DFFF),
                            ),
                          ),
                        ),
                        const SizedBox(height: AppSpacing.sm),
                        Text(
                          'SUDOKU BLITZ 6×6',
                          style: AppTypography.titleLarge.copyWith(
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        Text(
                          'Compact 3×2 subgrid Sudoku designed for mobile focus sprints and pattern recognition.',
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                        const SizedBox(height: AppSpacing.md),
                        QuestlyButton(
                          text: 'START SUDOKU (+15 XP)',
                          icon: Icons.grid_on_rounded,
                          variant: QuestlyButtonVariant.primaryLime,
                          size: QuestlyButtonSize.medium,
                          onPressed: () => setState(
                            () => _activeGame = ActiveArcadeGame.sudoku,
                          ),
                        ),
                      ],
                    ),
                  ),

                const SizedBox(height: AppSpacing.md),

                // Math Sprint Card
                if (_selectedCategoryIndex == 0 || _selectedCategoryIndex == 1)
                  QuestlyCard(
                    borderColor: AppColors.darkBorder,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 3,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.darkElevatedSurface,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            'SPEED CALCULATION',
                            style: AppTypography.captionBold.copyWith(
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ),
                        const SizedBox(height: AppSpacing.sm),
                        Text(
                          'MIND SNAP MATH SPRINT',
                          style: AppTypography.titleLarge.copyWith(
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        Text(
                          'Rapid-fire 15-second calculation challenge. Multiply numbers as fast as you can.',
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                        const SizedBox(height: AppSpacing.md),
                        QuestlyButton(
                          text: 'START SPRINT (15s)',
                          icon: Icons.timer_outlined,
                          variant: QuestlyButtonVariant.darkOutline,
                          size: QuestlyButtonSize.medium,
                          onPressed: _startMathSprint,
                        ),
                      ],
                    ),
                  ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildCategoryTile(int index, IconData icon, String label) {
    final isSelected = _selectedCategoryIndex == index;
    return GestureDetector(
      onTap: () => setState(() => _selectedCategoryIndex = index),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.limePrimary.withValues(alpha: 0.15)
              : AppColors.darkCard,
          borderRadius: BorderRadius.circular(10),
          border: Border.all(
            color: isSelected ? AppColors.limePrimary : AppColors.darkBorder,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              size: 16,
              color: isSelected
                  ? AppColors.limePrimary
                  : AppColors.textSecondary,
            ),
            const SizedBox(width: 6),
            Text(
              label,
              style: AppTypography.captionBold.copyWith(
                color: isSelected
                    ? AppColors.limePrimary
                    : AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildXoxoGameView() {
    return QuestlyCard(
      borderColor: AppColors.lavenderAccent,
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              IconButton(
                icon: const Icon(Icons.arrow_back_ios_new, size: 18),
                onPressed: () =>
                    setState(() => _activeGame = ActiveArcadeGame.none),
              ),
              // Difficulty Selector
              DropdownButton<BotDifficulty>(
                value: _botDifficulty,
                dropdownColor: AppColors.darkCard,
                underline: const SizedBox(),
                items: const [
                  DropdownMenuItem(
                    value: BotDifficulty.rookie,
                    child: Text(
                      'Rookie Bot',
                      style: TextStyle(color: Colors.white, fontSize: 13),
                    ),
                  ),
                  DropdownMenuItem(
                    value: BotDifficulty.scholar,
                    child: Text(
                      'Scholar Bot',
                      style: TextStyle(
                        color: AppColors.limePrimary,
                        fontSize: 13,
                      ),
                    ),
                  ),
                  DropdownMenuItem(
                    value: BotDifficulty.grandmaster,
                    child: Text(
                      'Grandmaster (Minimax)',
                      style: TextStyle(color: Color(0xFF42DFFF), fontSize: 13),
                    ),
                  ),
                ],
                onChanged: (val) {
                  if (val != null) setState(() => _botDifficulty = val);
                },
              ),
              IconButton(
                icon: const Icon(Icons.refresh, color: AppColors.textSecondary),
                onPressed: _startXoxoGame,
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.sm),

          // Status Bar
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                _xoxoWinner != null
                    ? (_xoxoWinner == 'X'
                          ? 'YOU WON! (+8 XP)'
                          : _xoxoWinner == 'O'
                          ? 'BOT WON!'
                          : 'TACTICAL DRAW')
                    : (_isPlayerTurn
                          ? 'YOUR TURN (X)'
                          : 'BOT COMPUTING (O)...'),
                style: AppTypography.titleMedium.copyWith(
                  fontWeight: FontWeight.bold,
                  color: _xoxoWinner == 'X'
                      ? AppColors.limePrimary
                      : _xoxoWinner == 'O'
                      ? AppColors.error
                      : AppColors.lavenderAccent,
                ),
              ),
              Text(
                'W: $_xoxoPlayerWins  L: $_xoxoBotWins  D: $_xoxoDraws',
                style: AppTypography.captionBold.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.md),

          // 3x3 Grid
          Center(
            child: SizedBox(
              width: 270,
              height: 270,
              child: GridView.builder(
                itemCount: 9,
                physics: const NeverScrollableScrollPhysics(),
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 3,
                  mainAxisSpacing: 8,
                  crossAxisSpacing: 8,
                ),
                itemBuilder: (context, index) {
                  final cell = _xoxoBoard[index];
                  final isWinningCell = _winningLine?.contains(index) ?? false;

                  return GestureDetector(
                    onTap: () => _handleXoxoTap(index),
                    child: Container(
                      decoration: BoxDecoration(
                        color: isWinningCell
                            ? AppColors.limePrimary.withValues(alpha: 0.25)
                            : AppColors.darkBase,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: isWinningCell
                              ? AppColors.limePrimary
                              : cell != null
                              ? AppColors.darkBorder
                              : AppColors.darkElevatedSurface,
                          width: isWinningCell ? 2.5 : 1.5,
                        ),
                      ),
                      child: Center(
                        child: Text(
                          cell ?? '',
                          style: AppTypography.displayMedium.copyWith(
                            fontSize: 38,
                            fontWeight: FontWeight.w900,
                            color: cell == 'X'
                                ? AppColors.limePrimary
                                : const Color(0xFF42DFFF),
                          ),
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
          ),

          const SizedBox(height: AppSpacing.md),

          if (_xoxoWinner != null)
            QuestlyButton(
              text: 'PLAY AGAIN',
              icon: Icons.refresh,
              variant: QuestlyButtonVariant.primaryLime,
              size: QuestlyButtonSize.medium,
              onPressed: _startXoxoGame,
            ),
        ],
      ),
    );
  }

  Widget _buildMathSprintView() {
    return QuestlyCard(
      borderColor: AppColors.limePrimary,
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'SCORE: $_score',
                style: AppTypography.titleLarge.copyWith(
                  color: AppColors.limePrimary,
                  fontWeight: FontWeight.bold,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: _timeLeft <= 5 ? AppColors.error : AppColors.darkCard,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  '${_timeLeft}s',
                  style: AppTypography.titleMedium.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),
          Text(
            '$_num1 × $_num2 = ?',
            style: AppTypography.displayMedium.copyWith(
              fontSize: 44,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: AppSpacing.lg),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 10,
            crossAxisSpacing: 10,
            childAspectRatio: 2.2,
            children: _options.map((opt) {
              return ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.darkCard,
                  foregroundColor: AppColors.limePrimary,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                    side: const BorderSide(color: AppColors.darkBorder),
                  ),
                ),
                onPressed: () => _submitMathAnswer(opt),
                child: Text(
                  '$opt',
                  style: AppTypography.titleLarge.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }
}
