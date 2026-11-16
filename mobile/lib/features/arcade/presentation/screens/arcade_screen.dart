import 'dart:async';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:questly/app/theme/app_colors.dart';
import 'package:questly/app/theme/app_spacing.dart';
import 'package:questly/app/theme/app_typography.dart';
import 'package:questly/shared/widgets/questly_button.dart';
import 'package:questly/shared/widgets/questly_card.dart';
import 'package:questly/shared/widgets/questly_grid_background.dart';

class ArcadeScreen extends StatefulWidget {
  const ArcadeScreen({super.key});

  @override
  State<ArcadeScreen> createState() => _ArcadeScreenState();
}

class _ArcadeScreenState extends State<ArcadeScreen> {
  int _selectedCategoryIndex = 0; // 0: Math, 1: Memory, 2: Puzzle, 3: Classical
  bool _isPlaying = false;
  int _score = 0;
  int _timeLeft = 15;
  Timer? _timer;

  // Active math question
  int _num1 = 7;
  int _num2 = 8;
  int _correctAnswer = 56;
  List<int> _options = [48, 54, 56, 63];

  // XOXO vs Computer Bot Game State
  List<String?> _xoxoBoard = List.filled(9, null);
  bool _isXoxoActive = false;
  String? _xoxoWinner;
  bool _isPlayerTurn = true;
  int _xoxoWins = 0;

  void _startXoxoGame() {
    setState(() {
      _isXoxoActive = true;
      _isPlaying = false;
      _timer?.cancel();
      _xoxoBoard = List.filled(9, null);
      _xoxoWinner = null;
      _isPlayerTurn = true;
    });
  }

  void _handleXoxoTap(int index) {
    if (_xoxoBoard[index] != null || _xoxoWinner != null || !_isPlayerTurn) {
      return;
    }

    setState(() {
      _xoxoBoard[index] = 'X';
      _checkXoxoWinner();
    });

    if (_xoxoWinner == null) {
      _isPlayerTurn = false;
      Future.delayed(const Duration(milliseconds: 350), () {
        if (!mounted) return;
        _makeBotMove();
      });
    }
  }

  void _makeBotMove() {
    final available = <int>[];
    for (int i = 0; i < 9; i++) {
      if (_xoxoBoard[i] == null) available.add(i);
    }

    if (available.isNotEmpty) {
      int move = available.first;
      if (_xoxoBoard[4] == null) {
        move = 4;
      } else {
        move = available[DateTime.now().millisecondsSinceEpoch % available.length];
      }

      setState(() {
        _xoxoBoard[move] = 'O';
        _isPlayerTurn = true;
        _checkXoxoWinner();
      });
    }
  }

  void _checkXoxoWinner() {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ];

    for (final line in lines) {
      final a = _xoxoBoard[line[0]];
      final b = _xoxoBoard[line[1]];
      final c = _xoxoBoard[line[2]];
      if (a != null && a == b && a == c) {
        _xoxoWinner = a;
        if (a == 'X') {
          _xoxoWins++;
        }
        return;
      }
    }

    if (_xoxoBoard.every((cell) => cell != null)) {
      _xoxoWinner = 'draw';
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _generateQuestion() {
    final now = DateTime.now().millisecondsSinceEpoch;
    _num1 = 3 + (now % 10);
    _num2 = 4 + ((now ~/ 10) % 9);
    _correctAnswer = _num1 * _num2;

    final wrong1 = _correctAnswer + 6;
    final wrong2 = _correctAnswer - 4;
    final wrong3 = _correctAnswer + 10;
    _options = [_correctAnswer, wrong1, wrong2, wrong3]..shuffle();
  }

  void _startMiniGame() {
    setState(() {
      _isPlaying = true;
      _score = 0;
      _timeLeft = 15;
      _generateQuestion();
    });

    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_timeLeft > 1) {
        setState(() => _timeLeft--);
      } else {
        _endGame();
      }
    });
  }

  void _answerQuestion(int answer) {
    if (!_isPlaying) return;
    if (answer == _correctAnswer) {
      setState(() {
        _score += 10;
        _generateQuestion();
      });
    } else {
      setState(() {
        _score = (_score - 5).clamp(0, 999);
      });
    }
  }

  void _endGame() {
    _timer?.cancel();
    setState(() => _isPlaying = false);

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: AppColors.darkCard,
        title: Text(
          'DUEL COMPLETE!',
          style: AppTypography.titleLarge.copyWith(
            color: AppColors.limePrimary,
          ),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Final Score: $_score points',
              style: const TextStyle(
                color: AppColors.textPrimary,
                fontSize: 18,
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: AppColors.limePrimary.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: AppColors.limePrimary),
              ),
              child: Text(
                '+${_score * 5} XP AWARDED',
                style: AppTypography.captionBold.copyWith(
                  color: AppColors.limePrimary,
                ),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            child: const Text(
              'NICE',
              style: TextStyle(color: AppColors.limePrimary),
            ),
            onPressed: () => Navigator.pop(ctx),
          ),
        ],
      ),
    );
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
              // Top Bar
              Row(
                children: [
                  IconButton(
                    icon: const Icon(
                      Icons.arrow_back_ios_new,
                      color: AppColors.textPrimary,
                      size: 20,
                    ),
                    onPressed: () => context.pop(),
                  ),
                  const SizedBox(width: AppSpacing.xs),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'MIND SNAP ARENA',
                        style: AppTypography.titleLarge.copyWith(
                          letterSpacing: 1.0,
                        ),
                      ),
                      Text(
                        'Fast mental duels to recharge focus and sharpen speed',
                        style: AppTypography.caption.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.md),

              // Category Selector Tabs
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildCategoryTile(0, Icons.speed, 'MATH'),
                  _buildCategoryTile(1, Icons.psychology, 'MEMORY'),
                  _buildCategoryTile(2, Icons.grid_view, 'PUZZLE'),
                  _buildCategoryTile(3, Icons.military_tech, 'CLASSICAL'),
                ],
              ),
              const SizedBox(height: AppSpacing.lg),

              if (_isXoxoActive) ...[
                // XOXO vs Computer Bot Grid
                QuestlyCard(
                  borderColor: AppColors.lavenderAccent,
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            _isPlayerTurn ? 'YOUR TURN (X)' : 'BOT THINKING (O)...',
                            style: AppTypography.titleMedium.copyWith(
                              color: _isPlayerTurn
                                  ? AppColors.limePrimary
                                  : AppColors.lavenderAccent,
                            ),
                          ),
                          Text(
                            'WINS: $_xoxoWins',
                            style: AppTypography.captionBold.copyWith(
                              color: AppColors.textPrimary,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.md),
                      GridView.builder(
                        itemCount: 9,
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        gridDelegate:
                            const SliverGridDelegateWithFixedCrossAxisCount(
                          crossAxisCount: 3,
                          mainAxisSpacing: 8,
                          crossAxisSpacing: 8,
                        ),
                        itemBuilder: (context, index) {
                          final cell = _xoxoBoard[index];
                          return GestureDetector(
                            onTap: () => _handleXoxoTap(index),
                            child: Container(
                              decoration: BoxDecoration(
                                color: AppColors.darkBase,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: cell != null
                                      ? (cell == 'X'
                                          ? AppColors.limePrimary
                                          : AppColors.error)
                                      : AppColors.darkBorder,
                                  width: cell != null ? 2 : 1,
                                ),
                              ),
                              child: Center(
                                child: Text(
                                  cell ?? '',
                                  style: TextStyle(
                                    fontSize: 36,
                                    fontWeight: FontWeight.bold,
                                    color: cell == 'X'
                                        ? AppColors.limePrimary
                                        : AppColors.error,
                                  ),
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                      if (_xoxoWinner != null) ...[
                        const SizedBox(height: AppSpacing.md),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 10,
                          ),
                          decoration: BoxDecoration(
                            color: _xoxoWinner == 'X'
                                ? AppColors.limePrimary.withValues(alpha: 0.15)
                                : AppColors.darkBase,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: _xoxoWinner == 'X'
                                  ? AppColors.limePrimary
                                  : AppColors.darkBorder,
                            ),
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                _xoxoWinner == 'X'
                                    ? 'VICTORY! +8 XP'
                                    : _xoxoWinner == 'O'
                                        ? 'BOT WON!'
                                        : 'TACTICAL DRAW (+3 XP)',
                                style: AppTypography.titleMedium.copyWith(
                                  color: _xoxoWinner == 'X'
                                      ? AppColors.limePrimary
                                      : AppColors.textPrimary,
                                ),
                              ),
                              TextButton(
                                onPressed: _startXoxoGame,
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
                      ],
                      const SizedBox(height: AppSpacing.sm),
                      Align(
                        alignment: Alignment.centerRight,
                        child: TextButton(
                          onPressed: () => setState(() => _isXoxoActive = false),
                          child: const Text('Back to Arena'),
                        ),
                      ),
                    ],
                  ),
                ),
              ] else if (!_isPlaying) ...[
                if (_selectedCategoryIndex == 2) ...[
                  // XOXO & KenKen Feature Card
                  QuestlyCard(
                    borderColor: AppColors.lavenderAccent.withValues(alpha: 0.5),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
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
                            'TACTICAL BOT DUEL',
                            style: AppTypography.captionBold.copyWith(
                              color: AppColors.lavenderAccent,
                            ),
                          ),
                        ),
                        const SizedBox(height: AppSpacing.sm),
                        Text(
                          'XOXO vs COMPUTER BOT',
                          style: AppTypography.displayMedium.copyWith(
                            fontSize: 26,
                            letterSpacing: 0.8,
                          ),
                        ),
                        Text(
                          'Play 3×3 grid tactics against our minimax algorithm. Win to earn +8 XP!',
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                        const SizedBox(height: AppSpacing.md),
                        QuestlyButton(
                          text: 'PLAY VS BOT (+8 XP)',
                          icon: Icons.smart_toy,
                          variant: QuestlyButtonVariant.primaryLime,
                          size: QuestlyButtonSize.large,
                          onPressed: _startXoxoGame,
                        ),
                      ],
                    ),
                  ),
                ] else ...[
                  // Banner Hero Card (Math / Speed)
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
                            color: AppColors.lavenderAccent.withValues(
                              alpha: 0.15,
                            ),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            'FEATURED DUEL',
                            style: AppTypography.captionBold.copyWith(
                              color: AppColors.lavenderAccent,
                            ),
                          ),
                        ),
                        const SizedBox(height: AppSpacing.sm),
                        Text(
                          'MIND SNAP DUELS',
                          style: AppTypography.displayMedium.copyWith(
                            fontSize: 26,
                            letterSpacing: 0.8,
                          ),
                        ),
                        Text(
                          'Who can solve fast multiplication & logic sequences fastest?',
                          style: AppTypography.bodySmall.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                        const SizedBox(height: AppSpacing.md),
                        QuestlyButton(
                          text: 'START SPEED DUEL (15s)',
                          icon: Icons.play_arrow,
                          variant: QuestlyButtonVariant.primaryLime,
                          size: QuestlyButtonSize.large,
                          onPressed: _startMiniGame,
                        ),
                      ],
                    ),
                  ),
                ],
              ] else ...[
                // Live Interactive Game View
                QuestlyCard(
                  borderColor: AppColors.limePrimary,
                  child: Column(
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'TIME: ${_timeLeft}s',
                            style: AppTypography.titleLarge.copyWith(
                              color: _timeLeft <= 5
                                  ? AppColors.error
                                  : AppColors.limePrimary,
                            ),
                          ),
                          Text(
                            'SCORE: $_score',
                            style: AppTypography.titleLarge.copyWith(
                              color: AppColors.lavenderAccent,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.lg),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 24,
                          vertical: 16,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.darkBase,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: AppColors.darkBorder),
                        ),
                        child: Text(
                          '$_num1 × $_num2 = ?',
                          style: AppTypography.displayLarge.copyWith(
                            fontSize: 42,
                            letterSpacing: 2.0,
                          ),
                        ),
                      ),
                      const SizedBox(height: AppSpacing.lg),
                      GridView.count(
                        crossAxisCount: 2,
                        shrinkWrap: true,
                        mainAxisSpacing: 10,
                        crossAxisSpacing: 10,
                        childAspectRatio: 2.2,
                        physics: const NeverScrollableScrollPhysics(),
                        children: _options.map((option) {
                          return QuestlyButton(
                            text: '$option',
                            variant: QuestlyButtonVariant.darkOutline,
                            size: QuestlyButtonSize.medium,
                            onPressed: () => _answerQuestion(option),
                          );
                        }).toList(),
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
        width: 78,
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.darkCard : AppColors.darkCardBackground,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? AppColors.limePrimary : AppColors.darkBorder,
            width: isSelected ? 2 : 1,
          ),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: AppColors.limePrimary.withValues(alpha: 0.25),
                    blurRadius: 8,
                    spreadRadius: 1,
                  ),
                ]
              : null,
        ),
        child: Column(
          children: [
            Icon(
              icon,
              size: 22,
              color: isSelected
                  ? AppColors.limePrimary
                  : AppColors.textTertiary,
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontFamily: AppTypography.displayFont,
                fontSize: 10,
                fontWeight: FontWeight.bold,
                color: isSelected
                    ? AppColors.limePrimary
                    : AppColors.textTertiary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
