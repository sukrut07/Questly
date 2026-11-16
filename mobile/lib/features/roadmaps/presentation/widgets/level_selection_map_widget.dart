import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:questly/app/router/route_names.dart';
import 'package:questly/app/theme/app_colors.dart';
import 'package:questly/app/theme/app_spacing.dart';
import 'package:questly/app/theme/app_typography.dart';
import 'package:questly/features/dashboard/presentation/providers/dashboard_providers.dart';
import 'package:questly/features/gamification/domain/engine/xp_progression_engine.dart';
import 'package:questly/shared/widgets/questly_button.dart';
import 'package:questly/shared/widgets/questly_card.dart';

class LevelNodeData {
  final int level;
  final String rank;
  final int minXp;
  final double x; // Relative 0.0 to 1.0
  final double y; // Relative 0.0 to 1.0
  final String reward;
  final String gameChallenge;
  final int gameXpReward;

  const LevelNodeData({
    required this.level,
    required this.rank,
    required this.minXp,
    required this.x,
    required this.y,
    required this.reward,
    required this.gameChallenge,
    this.gameXpReward = 15,
  });
}

class LevelSelectionMapWidget extends ConsumerStatefulWidget {
  final VoidCallback? onOpenTasks;
  final VoidCallback? onOpenArcade;
  final VoidCallback? onOpenFocus;

  const LevelSelectionMapWidget({
    super.key,
    this.onOpenTasks,
    this.onOpenArcade,
    this.onOpenFocus,
  });

  @override
  ConsumerState<LevelSelectionMapWidget> createState() =>
      _LevelSelectionMapWidgetState();
}

class _LevelSelectionMapWidgetState
    extends ConsumerState<LevelSelectionMapWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _pulseController;
  int _selectedLevel = 1;

  static const List<LevelNodeData> _levelNodes = [
    LevelNodeData(
      level: 1,
      rank: 'Initiate',
      minXp: 0,
      x: 0.25,
      y: 0.88,
      reward: 'Basic Academic Tools & Daily Streak Counter',
      gameChallenge: 'XOXO Minimax Warmup Bot',
      gameXpReward: 8,
    ),
    LevelNodeData(
      level: 2,
      rank: 'Explorer',
      minXp: 250,
      x: 0.72,
      y: 0.76,
      reward: 'Custom Coursework Categories & Mind Snap Games',
      gameChallenge: 'Sudoku Blitz 6×6 Tactical Challenge',
      gameXpReward: 15,
    ),
    LevelNodeData(
      level: 3,
      rank: 'Builder',
      minXp: 600,
      x: 0.78,
      y: 0.58,
      reward: 'Arcane Violet Neon Theme & Spaced Repetition Timer',
      gameChallenge: 'KenKen 4×4 Arithmetic Matrix',
      gameXpReward: 20,
    ),
    LevelNodeData(
      level: 4,
      rank: 'Strategist',
      minXp: 1050,
      x: 0.32,
      y: 0.48,
      reward: 'Workload Balancer V2 & Streak Resiliency Shield',
      gameChallenge: 'Speed Math Blitz Sprint',
      gameXpReward: 20,
    ),
    LevelNodeData(
      level: 5,
      rank: 'Specialist',
      minXp: 1600,
      x: 0.22,
      y: 0.30,
      reward: 'KenKen Grandmaster Mode & Focus Audio Synthesizer',
      gameChallenge: 'KenKen Grandmaster Cage Duel',
      gameXpReward: 25,
    ),
    LevelNodeData(
      level: 6,
      rank: 'Architect',
      minXp: 2250,
      x: 0.70,
      y: 0.20,
      reward: 'Cognitive Sprint Multiplier & Verified Audit Ledger',
      gameChallenge: 'Unbeatable Minimax Boss Trial',
      gameXpReward: 30,
    ),
    LevelNodeData(
      level: 7,
      rank: 'Master',
      minXp: 3000,
      x: 0.50,
      y: 0.08,
      reward: 'Golden Legendary Aura & Pinnacle Prestige Badge',
      gameChallenge: 'Pinnacle Grandmaster Arena Trial',
      gameXpReward: 40,
    ),
  ];

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final dashboardState = ref.watch(dashboardStateProvider);
    final profile = dashboardState.value?.profile;
    final currentLevel = profile?.level ?? 1;
    final totalXp = profile?.totalXp ?? 120;
    final levelInfo = XpProgressionEngine.calculateLevelInfo(totalXp);

    final selectedConfig = _levelNodes.firstWhere(
      (n) => n.level == _selectedLevel,
      orElse: () => _levelNodes.first,
    );
    final isUnlocked = currentLevel >= selectedConfig.level;
    final isCurrent = currentLevel == selectedConfig.level;
    final isCompleted = currentLevel > selectedConfig.level;
    final xpNeeded = selectedConfig.minXp;
    final xpRemaining = math.max(0, xpNeeded - totalXp);

    return Column(
      children: [
        // 1. Header Bar: Level & Next Milestone XP
        Container(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.md,
            vertical: AppSpacing.sm,
          ),
          decoration: BoxDecoration(
            color: AppColors.darkCard,
            border: Border.all(color: AppColors.darkBorder),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: AppColors.limePrimary.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                        color: AppColors.limePrimary.withValues(alpha: 0.4),
                      ),
                    ),
                    child: const Icon(
                      Icons.emoji_events_rounded,
                      color: AppColors.limePrimary,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(
                            'LEVEL MAP',
                            style: AppTypography.titleSmall.copyWith(
                              letterSpacing: 1.0,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 6,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.limePrimary,
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              'LVL $currentLevel',
                              style: AppTypography.captionBold.copyWith(
                                color: AppColors.darkBase,
                                fontSize: 10,
                              ),
                            ),
                          ),
                        ],
                      ),
                      Text(
                        'Rank: ${levelInfo.stage.stageName} • $totalXp Total XP',
                        style: AppTypography.caption.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    'Next: ${levelInfo.requiredLevelXp - levelInfo.currentLevelXp} XP',
                    style: AppTypography.captionBold.copyWith(
                      color: AppColors.limePrimary,
                      fontSize: 11,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Container(
                    width: 100,
                    height: 6,
                    decoration: BoxDecoration(
                      color: AppColors.darkBorder,
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: FractionallySizedBox(
                      alignment: Alignment.centerLeft,
                      widthFactor: levelInfo.progressPercent,
                      child: Container(
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [AppColors.limePrimary, Color(0xFF42DFFF)],
                          ),
                          borderRadius: BorderRadius.circular(4),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),

        const SizedBox(height: AppSpacing.sm),

        // 2. Graphical 3D Winding Road Canvas
        ClipRRect(
          borderRadius: BorderRadius.circular(20),
          child: Container(
            height: 520,
            width: double.infinity,
            decoration: BoxDecoration(
              color: const Color(0xFF2C4A1D), // Cartoon green turf base
              border: Border.all(color: AppColors.darkBorder),
            ),
            child: Stack(
              children: [
                // Grass Grid Pattern Texture
                Positioned.fill(
                  child: CustomPaint(painter: _GrassTexturePainter()),
                ),

                // Decorative Cartoon Building 1 (Top-Left Academy)
                Positioned(
                  top: 14,
                  left: 14,
                  child: _buildDecorativeBuilding(
                    width: 90,
                    height: 72,
                    roofColor: const Color(0xFF8C533F),
                    bodyColor: const Color(0xFF6E4232),
                    accentColor: AppColors.limePrimary,
                  ),
                ),

                // Decorative Cartoon Building 2 (Mid-Right Research House)
                Positioned(
                  top: 190,
                  right: 14,
                  child: _buildDecorativeBuilding(
                    width: 80,
                    height: 66,
                    roofColor: const Color(0xFF7A4B3A),
                    bodyColor: const Color(0xFF5A3527),
                    accentColor: const Color(0xFF42DFFF),
                  ),
                ),

                // Trees and Shrubbery
                const Positioned(
                  bottom: 70,
                  left: 18,
                  child: _DecorativeTree(size: 32),
                ),
                const Positioned(
                  bottom: 90,
                  left: 42,
                  child: _DecorativeTree(size: 26),
                ),
                const Positioned(
                  top: 260,
                  left: 12,
                  child: _DecorativeTree(size: 28),
                ),
                const Positioned(
                  bottom: 24,
                  right: 20,
                  child: _DecorativeTree(size: 36),
                ),

                // Street Lamp Post with soft glow
                Positioned(top: 230, left: 150, child: _buildStreetLamp()),

                // Winding Road & Stepping Stone Level Buttons
                Positioned.fill(
                  child: CustomPaint(
                    painter: _WindingRoadPainter(nodes: _levelNodes),
                  ),
                ),

                // Interactive 3D Stone Nodes
                ..._levelNodes.map((node) {
                  final nodeUnlocked = currentLevel >= node.level;
                  final nodeCurrent = currentLevel == node.level;
                  final nodeCompleted = currentLevel > node.level;
                  final isSelected = _selectedLevel == node.level;

                  return LayoutBuilder(
                    builder: (context, constraints) {
                      final left = constraints.maxWidth * node.x - 30;
                      final top = constraints.maxHeight * node.y - 30;

                      return Positioned(
                        left: left,
                        top: top,
                        child: GestureDetector(
                          onTap: () {
                            setState(() => _selectedLevel = node.level);
                          },
                          child: AnimatedBuilder(
                            animation: _pulseController,
                            builder: (context, child) {
                              final pulse = nodeCurrent
                                  ? _pulseController.value * 4
                                  : 0.0;
                              return _build3DStoneNode(
                                node: node,
                                isUnlocked: nodeUnlocked,
                                isCurrent: nodeCurrent,
                                isCompleted: nodeCompleted,
                                isSelected: isSelected,
                                pulseOffset: pulse,
                              );
                            },
                          ),
                        ),
                      );
                    },
                  );
                }),
              ],
            ),
          ),
        ),

        const SizedBox(height: AppSpacing.sm),

        // 3. Interactive Level Details & Milestone Drawer
        QuestlyCard(
          borderColor: isCurrent
              ? AppColors.limePrimary
              : isUnlocked
              ? AppColors.lavenderAccent
              : AppColors.darkBorder,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: isCurrent
                              ? AppColors.limePrimary
                              : isCompleted
                              ? AppColors.lavenderAccent.withValues(alpha: 0.2)
                              : AppColors.darkCard,
                          borderRadius: BorderRadius.circular(6),
                          border: Border.all(
                            color: isCurrent
                                ? AppColors.limePrimary
                                : AppColors.darkBorder,
                          ),
                        ),
                        child: Text(
                          'STAGE ${selectedConfig.level}',
                          style: AppTypography.captionBold.copyWith(
                            color: isCurrent
                                ? AppColors.darkBase
                                : AppColors.textPrimary,
                          ),
                        ),
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      Text(
                        selectedConfig.rank.toUpperCase(),
                        style: AppTypography.titleMedium.copyWith(
                          color: AppColors.textPrimary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 3,
                    ),
                    decoration: BoxDecoration(
                      color: isCompleted
                          ? AppColors.success.withValues(alpha: 0.15)
                          : isCurrent
                          ? AppColors.limePrimary.withValues(alpha: 0.15)
                          : AppColors.darkCard,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      isCompleted
                          ? 'CLEARED ✓'
                          : isCurrent
                          ? 'ACTIVE NOW'
                          : 'LOCKED ($xpRemaining XP TO GO)',
                      style: AppTypography.captionBold.copyWith(
                        color: isCompleted
                            ? AppColors.success
                            : isCurrent
                            ? AppColors.limePrimary
                            : AppColors.textMuted,
                        fontSize: 10,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.xs),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(
                    Icons.card_giftcard_rounded,
                    color: AppColors.limePrimary,
                    size: 16,
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(
                      'Milestone Reward: ${selectedConfig.reward}',
                      style: AppTypography.bodySmall.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.xs),
              // Playable Game Track Challenge Banner
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: AppColors.lavenderAccent.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(
                    color: AppColors.lavenderAccent.withValues(alpha: 0.3),
                  ),
                ),
                child: Row(
                  children: [
                    const Icon(
                      Icons.videogame_asset_rounded,
                      color: AppColors.lavenderAccent,
                      size: 18,
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'TIER $_selectedLevel GAME TRACK CHALLENGE',
                            style: const TextStyle(
                              fontSize: 9,
                              fontWeight: FontWeight.bold,
                              color: AppColors.lavenderAccent,
                              letterSpacing: 0.8,
                            ),
                          ),
                          Text(
                            selectedConfig.gameChallenge,
                            style: AppTypography.bodySmall.copyWith(
                              fontWeight: FontWeight.bold,
                              color: AppColors.textPrimary,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 6,
                        vertical: 2,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.limePrimary.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        '+${selectedConfig.gameXpReward} XP',
                        style: AppTypography.captionBold.copyWith(
                          color: AppColors.limePrimary,
                          fontSize: 10,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              // Fast Action CTAs to boost XP
              Row(
                children: [
                  Expanded(
                    child: QuestlyButton(
                      text: 'TASKS (+XP)',
                      icon: Icons.checklist_rounded,
                      size: QuestlyButtonSize.small,
                      variant: QuestlyButtonVariant.primaryLime,
                      onPressed: () {
                        if (widget.onOpenTasks != null) {
                          widget.onOpenTasks!();
                        } else {
                          context.pushNamed(RouteNames.createQuest);
                        }
                      },
                    ),
                  ),
                  const SizedBox(width: AppSpacing.xs),
                  Expanded(
                    child: QuestlyButton(
                      text: 'PLAY GAME',
                      icon: Icons.sports_esports_rounded,
                      size: QuestlyButtonSize.small,
                      variant: QuestlyButtonVariant.secondaryLavender,
                      onPressed: () {
                        final gameParam = switch (_selectedLevel) {
                          1 => 'xoxo',
                          2 => 'sudoku',
                          3 => 'kenken',
                          4 => 'math',
                          5 => 'kenken',
                          6 => 'xoxo',
                          7 => 'sudoku',
                          _ => 'sudoku',
                        };
                        context.push('${RoutePaths.arcade}?game=$gameParam');
                      },
                    ),
                  ),
                  const SizedBox(width: AppSpacing.xs),
                  Expanded(
                    child: QuestlyButton(
                      text: 'FOCUS',
                      icon: Icons.timer_rounded,
                      size: QuestlyButtonSize.small,
                      variant: QuestlyButtonVariant.darkOutline,
                      onPressed: () {
                        if (widget.onOpenFocus != null) {
                          widget.onOpenFocus!();
                        } else {
                          context.push(RoutePaths.focus);
                        }
                      },
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _build3DStoneNode({
    required LevelNodeData node,
    required bool isUnlocked,
    required bool isCurrent,
    required bool isCompleted,
    required bool isSelected,
    required double pulseOffset,
  }) {
    const double size = 60;
    return SizedBox(
      width: size + 16,
      height: size + 16,
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Selected glow ring
          if (isSelected)
            Container(
              width: size + 14,
              height: size + 14,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: AppColors.limePrimary, width: 2.5),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.limePrimary.withValues(alpha: 0.5),
                    blurRadius: 10,
                  ),
                ],
              ),
            ),

          // Pulsing halo for current active level
          if (isCurrent)
            Container(
              width: size + 8 + pulseOffset,
              height: size + 8 + pulseOffset,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: AppColors.limePrimary.withValues(alpha: 0.6),
                  width: 2,
                ),
              ),
            ),

          // 3D Drop Shadow
          Positioned(
            bottom: 4,
            child: Container(
              width: size - 4,
              height: 16,
              decoration: BoxDecoration(
                color: Colors.black.withValues(alpha: 0.45),
                borderRadius: BorderRadius.circular(16),
              ),
            ),
          ),

          // 3D Cylinder Bottom Rim
          Positioned(
            bottom: 8,
            child: Container(
              width: size,
              height: size * 0.75,
              decoration: BoxDecoration(
                color: isCurrent
                    ? const Color(0xFF385214)
                    : isCompleted
                    ? const Color(0xFF223214)
                    : const Color(0xFF161920),
                borderRadius: BorderRadius.circular(30),
                border: Border.all(color: const Color(0xFF0E1015), width: 2),
              ),
            ),
          ),

          // 3D Cylinder Top Face
          Positioned(
            top: 6,
            child: Container(
              width: size - 2,
              height: size - 8,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: isCurrent
                      ? [AppColors.limePrimary, const Color(0xFF88D82A)]
                      : isCompleted
                      ? [const Color(0xFF4A6827), const Color(0xFF314818)]
                      : [const Color(0xFF2E3440), const Color(0xFF1F232B)],
                ),
                borderRadius: BorderRadius.circular(28),
                border: Border.all(
                  color: isCurrent
                      ? Colors.white
                      : isCompleted
                      ? AppColors.limePrimary.withValues(alpha: 0.4)
                      : const Color(0xFF434C5E),
                  width: 2,
                ),
              ),
              child: Center(
                child: isCompleted
                    ? const Icon(
                        Icons.check_rounded,
                        color: AppColors.limePrimary,
                        size: 24,
                      )
                    : isCurrent
                    ? Text(
                        '${node.level}',
                        style: AppTypography.displayMedium.copyWith(
                          color: AppColors.darkBase,
                          fontSize: 22,
                          fontWeight: FontWeight.w900,
                        ),
                      )
                    : const Icon(
                        Icons.lock_rounded,
                        color: Color(0xFF8892B0),
                        size: 20,
                      ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildDecorativeBuilding({
    required double width,
    required double height,
    required Color roofColor,
    required Color bodyColor,
    required Color accentColor,
  }) {
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: bodyColor,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: const Color(0xFF2B1810), width: 2),
        boxShadow: const [
          BoxShadow(color: Colors.black38, blurRadius: 8, offset: Offset(2, 4)),
        ],
      ),
      child: Column(
        children: [
          Container(
            height: height * 0.35,
            decoration: BoxDecoration(
              color: roofColor,
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(8),
              ),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [_buildWindow(), _buildWindow(), _buildWindow()],
            ),
          ),
          Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Container(
                    width: 14,
                    height: 22,
                    decoration: BoxDecoration(
                      color: const Color(0xFF2B1810),
                      borderRadius: const BorderRadius.vertical(
                        top: Radius.circular(3),
                      ),
                      border: Border.all(color: const Color(0xFF5A3527)),
                    ),
                  ),
                  Container(
                    width: width * 0.45,
                    height: 6,
                    decoration: BoxDecoration(
                      color: accentColor.withValues(alpha: 0.8),
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWindow() {
    return Container(
      width: 12,
      height: 10,
      decoration: BoxDecoration(
        color: const Color(0xFF1B0E09),
        borderRadius: BorderRadius.circular(2),
        border: Border.all(color: const Color(0xFF9E5D48), width: 1),
      ),
    );
  }

  Widget _buildStreetLamp() {
    return SizedBox(
      width: 16,
      height: 48,
      child: Stack(
        alignment: Alignment.topCenter,
        children: [
          Positioned(
            bottom: 0,
            child: Container(
              width: 3,
              height: 44,
              color: const Color(0xFF1C2028),
            ),
          ),
          Container(
            width: 12,
            height: 6,
            decoration: const BoxDecoration(
              color: Color(0xFF384050),
              borderRadius: BorderRadius.vertical(top: Radius.circular(6)),
            ),
          ),
          Positioned(
            top: 4,
            child: Container(
              width: 8,
              height: 8,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: const Color(0xFFFFE66D),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFFFFE66D).withValues(alpha: 0.7),
                    blurRadius: 6,
                    spreadRadius: 2,
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _DecorativeTree extends StatelessWidget {
  final double size;
  const _DecorativeTree({required this.size});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: const Color(0xFF264018),
        border: Border.all(color: const Color(0xFF15250D), width: 2),
        boxShadow: const [
          BoxShadow(color: Colors.black26, blurRadius: 4, offset: Offset(1, 3)),
        ],
      ),
    );
  }
}

class _GrassTexturePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withValues(alpha: 0.08)
      ..strokeWidth = 1.0;

    const spacing = 24.0;
    for (double x = 0; x < size.width; x += spacing) {
      for (double y = 0; y < size.height; y += spacing) {
        canvas.drawCircle(Offset(x, y), 1.2, paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _WindingRoadPainter extends CustomPainter {
  final List<LevelNodeData> nodes;

  _WindingRoadPainter({required this.nodes});

  @override
  void paint(Canvas canvas, Size size) {
    if (nodes.length < 2) return;

    final path = Path();
    final p0 = Offset(nodes.first.x * size.width, nodes.first.y * size.height);
    path.moveTo(p0.dx, p0.dy);

    for (int i = 0; i < nodes.length - 1; i++) {
      final start = Offset(nodes[i].x * size.width, nodes[i].y * size.height);
      final end = Offset(
        nodes[i + 1].x * size.width,
        nodes[i + 1].y * size.height,
      );

      final midY = (start.dy + end.dy) / 2;
      path.cubicTo(start.dx, midY, end.dx, midY, end.dx, end.dy);
    }

    // 1. Road Outer Shoulder / Curb
    final curbPaint = Paint()
      ..color = const Color(0xFF14171E)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 56.0
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;
    canvas.drawPath(path, curbPaint);

    // 2. Asphalt Roadway
    final asphaltPaint = Paint()
      ..color = const Color(0xFF242A36)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 46.0
      ..strokeCap = StrokeCap.round
      ..strokeJoin = StrokeJoin.round;
    canvas.drawPath(path, asphaltPaint);

    // 3. Dashed Electric Lime Center Line
    final centerLinePaint = Paint()
      ..color = AppColors.limePrimary.withValues(alpha: 0.8)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3.0
      ..strokeCap = StrokeCap.round;

    final dashPath = _createDashedPath(path, 12, 12);
    canvas.drawPath(dashPath, centerLinePaint);
  }

  Path _createDashedPath(Path source, double dashLength, double dashSpace) {
    final dest = Path();
    for (final metric in source.computeMetrics()) {
      double distance = 0.0;
      bool draw = true;
      while (distance < metric.length) {
        final len = draw ? dashLength : dashSpace;
        if (draw) {
          dest.addPath(
            metric.extractPath(distance, distance + len),
            Offset.zero,
          );
        }
        distance += len;
        draw = !draw;
      }
    }
    return dest;
  }

  @override
  bool shouldRepaint(covariant _WindingRoadPainter oldDelegate) => false;
}
