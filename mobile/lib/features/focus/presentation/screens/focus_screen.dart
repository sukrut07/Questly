import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:questly/app/providers/app_providers.dart';
import 'package:questly/app/theme/app_colors.dart';
import 'package:questly/app/theme/app_spacing.dart';
import 'package:questly/app/theme/app_typography.dart';
import 'package:questly/features/dashboard/presentation/providers/dashboard_providers.dart';
import 'package:questly/features/focus/domain/models/focus_session.dart';
import 'package:questly/shared/models/quest.dart';
import 'package:questly/shared/widgets/questly_celebration_dialog.dart';
import 'package:questly/shared/widgets/questly_grid_background.dart';

class FocusScreen extends ConsumerStatefulWidget {
  const FocusScreen({super.key});

  @override
  ConsumerState<FocusScreen> createState() => _FocusScreenState();
}

class _FocusScreenState extends ConsumerState<FocusScreen>
    with SingleTickerProviderStateMixin {
  FocusMode _selectedMode = FocusMode.pomodoro;
  TimerState _timerState = TimerState.idle;
  int _remainingSeconds = 25 * 60;
  Timer? _timer;
  DateTime? _startedAt;
  int _completedCycles = 0;
  Quest? _linkedQuest;

  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _remainingSeconds = _selectedMode.defaultSeconds;
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _timer?.cancel();
    _pulseController.dispose();
    super.dispose();
  }

  void _selectMode(FocusMode mode) {
    if (_timerState == TimerState.running) return;
    setState(() {
      _selectedMode = mode;
      _remainingSeconds = mode.defaultSeconds;
      _timerState = TimerState.idle;
    });
  }

  void _startTimer() {
    HapticFeedback.mediumImpact();
    _startedAt ??= DateTime.now();
    setState(() => _timerState = TimerState.running);
    _timer?.cancel();
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_remainingSeconds > 0) {
        setState(() => _remainingSeconds--);
      } else {
        _onSessionComplete();
      }
    });
  }

  void _pauseTimer() {
    HapticFeedback.lightImpact();
    _timer?.cancel();
    setState(() => _timerState = TimerState.paused);
  }

  void _resetTimer() {
    HapticFeedback.lightImpact();
    _timer?.cancel();
    setState(() {
      _timerState = TimerState.idle;
      _remainingSeconds = _selectedMode.defaultSeconds;
      _startedAt = null;
    });
  }

  void _adjustTime(int deltaSeconds) {
    if (_timerState == TimerState.running) return;
    setState(() {
      final updated = _remainingSeconds + deltaSeconds;
      if (updated > 60 && updated <= 120 * 60) {
        _remainingSeconds = updated;
      }
    });
  }

  Future<void> _onSessionComplete() async {
    HapticFeedback.heavyImpact();
    _timer?.cancel();
    setState(() {
      _timerState = TimerState.completed;
      _completedCycles = (_completedCycles + 1) % 4;
    });

    final xpEarned = switch (_selectedMode) {
      FocusMode.pomodoro => 60,
      FocusMode.deepWork => 120,
      FocusMode.flowState => 220,
      FocusMode.shortBreak => 10,
      FocusMode.longBreak => 20,
    };

    final repo = ref.read(focusRepositoryProvider);
    await repo.saveSession(
      FocusSession(
        id: 'session_${DateTime.now().millisecondsSinceEpoch}',
        mode: _selectedMode,
        plannedSeconds: _selectedMode.defaultSeconds,
        elapsedSeconds: _selectedMode.defaultSeconds,
        isCompleted: true,
        xpEarned: xpEarned,
        startedAt: _startedAt ?? DateTime.now(),
        endedAt: DateTime.now(),
      ),
    );

    // Refresh dashboard stats reactively
    ref.read(dashboardStateProvider.notifier).refresh();

    if (mounted) {
      QuestlyCelebrationDialog.show(
        context,
        title: '${_selectedMode.displayName} Completed!',
        xpReward: xpEarned,
        badge: 'Deep Flow Master',
      );
      _resetTimer();
    }
  }

  void _openQuestSelectorSheet() async {
    final questRepo = ref.read(questRepositoryProvider);
    final activeQuests = await questRepo.getActiveQuests();

    if (!mounted) return;

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (ctx) => Container(
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: const BoxDecoration(
          color: AppColors.darkCard,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
          border: Border(top: BorderSide(color: AppColors.darkBorder)),
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: AppColors.darkBorder,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              'LINK A QUEST TO THIS FOCUS SPRINT',
              style: AppTypography.titleSmall.copyWith(
                color: AppColors.limePrimary,
                letterSpacing: 1.0,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: AppSpacing.xs),
            Text(
              'Keep your target task in direct view while the clock ticks.',
              style: AppTypography.caption.copyWith(color: AppColors.textSecondary),
            ),
            const SizedBox(height: AppSpacing.md),
            if (activeQuests.isEmpty)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 24.0),
                child: Center(
                  child: Text(
                    'No active quests found. Create one from the Dashboard!',
                    style: AppTypography.bodySmall.copyWith(color: AppColors.textTertiary),
                  ),
                ),
              )
            else
              ...activeQuests.map((q) => ListTile(
                    contentPadding: EdgeInsets.zero,
                    leading: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppColors.limePrimary.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Icon(q.category.icon, color: AppColors.limePrimary, size: 18),
                    ),
                    title: Text(
                      q.title,
                      style: AppTypography.titleSmall.copyWith(fontWeight: FontWeight.bold),
                    ),
                    subtitle: Text(
                      '${q.subtasks.where((s) => s.isCompleted).length}/${q.subtasks.length} Subtasks · +${q.xpReward} XP',
                      style: AppTypography.caption.copyWith(color: AppColors.textSecondary),
                    ),
                    trailing: _linkedQuest?.id == q.id
                        ? const Icon(Icons.check_circle, color: AppColors.limePrimary)
                        : null,
                    onTap: () {
                      setState(() => _linkedQuest = q);
                      Navigator.pop(ctx);
                    },
                  )),
            const SizedBox(height: AppSpacing.sm),
            if (_linkedQuest != null)
              SizedBox(
                width: double.infinity,
                child: TextButton(
                  onPressed: () {
                    setState(() => _linkedQuest = null);
                    Navigator.pop(ctx);
                  },
                  child: const Text('UNLINK QUEST', style: TextStyle(color: Colors.redAccent)),
                ),
              ),
          ],
        ),
      ),
    );
  }

  String _formatTime(int totalSeconds) {
    final minutes = totalSeconds ~/ 60;
    final seconds = totalSeconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final totalSec = _selectedMode.defaultSeconds;
    final progress = totalSec > 0
        ? (1.0 - (_remainingSeconds / totalSec)).clamp(0.0, 1.0)
        : 0.0;
    final isRunning = _timerState == TimerState.running;

    return Scaffold(
      backgroundColor: AppColors.darkBase,
      body: QuestlyGridBackground(
        child: SafeArea(
          child: Column(
            children: [
              // Top Bar
              Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.md,
                  vertical: AppSpacing.sm,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    IconButton(
                      icon: const Icon(Icons.close, color: AppColors.textPrimary),
                      onPressed: () => context.pop(),
                    ),
                    Row(
                      children: [
                        Container(
                          width: 8,
                          height: 8,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: isRunning ? AppColors.limePrimary : AppColors.textTertiary,
                            boxShadow: isRunning
                                ? [
                                    BoxShadow(
                                      color: AppColors.limePrimary.withValues(alpha: 0.7),
                                      blurRadius: 6,
                                      spreadRadius: 2,
                                    ),
                                  ]
                                : null,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          isRunning ? 'SPRINT IN PROGRESS' : 'POMODORO CHAMBER',
                          style: AppTypography.captionBold.copyWith(
                            letterSpacing: 1.5,
                            color: isRunning ? AppColors.limePrimary : AppColors.textPrimary,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(width: 48), // balance
                  ],
                ),
              ),

              const SizedBox(height: AppSpacing.xs),

              // Mode Selector Tabs
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                physics: const BouncingScrollPhysics(),
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
                child: Row(
                  children: [
                    _ModePill(
                      mode: FocusMode.pomodoro,
                      isSelected: _selectedMode == FocusMode.pomodoro,
                      onTap: () => _selectMode(FocusMode.pomodoro),
                    ),
                    const SizedBox(width: 8),
                    _ModePill(
                      mode: FocusMode.deepWork,
                      isSelected: _selectedMode == FocusMode.deepWork,
                      onTap: () => _selectMode(FocusMode.deepWork),
                    ),
                    const SizedBox(width: 8),
                    _ModePill(
                      mode: FocusMode.flowState,
                      isSelected: _selectedMode == FocusMode.flowState,
                      onTap: () => _selectMode(FocusMode.flowState),
                    ),
                    const SizedBox(width: 8),
                    _ModePill(
                      mode: FocusMode.shortBreak,
                      isSelected: _selectedMode == FocusMode.shortBreak,
                      onTap: () => _selectMode(FocusMode.shortBreak),
                    ),
                    const SizedBox(width: 8),
                    _ModePill(
                      mode: FocusMode.longBreak,
                      isSelected: _selectedMode == FocusMode.longBreak,
                      onTap: () => _selectMode(FocusMode.longBreak),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: AppSpacing.md),

              // Cycle Progress Dots
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    'CYCLE ${_completedCycles + 1}/4',
                    style: TextStyle(
                      fontFamily: GoogleFonts.spaceMono().fontFamily,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textTertiary,
                      letterSpacing: 1.0,
                    ),
                  ),
                  const SizedBox(width: 10),
                  for (int i = 0; i < 4; i++) ...[
                    Container(
                      width: 8,
                      height: 8,
                      margin: const EdgeInsets.symmetric(horizontal: 2.5),
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: i < _completedCycles
                            ? AppColors.limePrimary
                            : i == _completedCycles && isRunning
                                ? AppColors.limePrimary.withValues(alpha: 0.6)
                                : AppColors.darkBorder,
                        border: Border.all(
                          color: i <= _completedCycles
                              ? AppColors.limePrimary
                              : AppColors.darkBorder,
                          width: 1.2,
                        ),
                      ),
                    ),
                  ],
                ],
              ),

              const Spacer(),

              // Circular Countdown Timer
              Center(
                child: SizedBox(
                  width: 270,
                  height: 270,
                  child: Stack(
                    alignment: Alignment.center,
                    children: [
                      // Ambient Glow Aura
                      AnimatedBuilder(
                        animation: _pulseController,
                        builder: (context, _) {
                          return Container(
                            width: 260,
                            height: 260,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: isRunning
                                      ? AppColors.limePrimary.withValues(
                                          alpha: 0.12 +
                                              0.08 * _pulseController.value,
                                        )
                                      : Colors.transparent,
                                  blurRadius: 40,
                                  spreadRadius: 10,
                                ),
                              ],
                            ),
                          );
                        },
                      ),

                      // Custom Arc Painter
                      CustomPaint(
                        size: const Size(260, 260),
                        painter: _PomodoroRingPainter(
                          progress: progress,
                          isRunning: isRunning,
                        ),
                      ),

                      // Center Digits & Info
                      Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            _formatTime(_remainingSeconds),
                            style: AppTypography.displayLarge.copyWith(
                              fontSize: 56,
                              letterSpacing: 1.5,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Text(
                            _selectedMode.displayName.toUpperCase(),
                            style: AppTypography.captionBold.copyWith(
                              color: AppColors.limePrimary,
                              letterSpacing: 1.2,
                            ),
                          ),
                          if (!isRunning) ...[
                            const SizedBox(height: 8),
                            Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                _TimeAdjustButton(
                                  label: '-5M',
                                  onTap: () => _adjustTime(-5 * 60),
                                ),
                                const SizedBox(width: 8),
                                _TimeAdjustButton(
                                  label: '+5M',
                                  onTap: () => _adjustTime(5 * 60),
                                ),
                              ],
                            ),
                          ],
                        ],
                      ),
                    ],
                  ),
                ),
              ),

              const Spacer(),

              // Linked Quest Focus Card
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                child: InkWell(
                  onTap: _openQuestSelectorSheet,
                  borderRadius: BorderRadius.circular(16),
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    decoration: BoxDecoration(
                      color: AppColors.darkCard,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: _linkedQuest != null
                            ? AppColors.limePrimary.withValues(alpha: 0.4)
                            : AppColors.darkBorder,
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          _linkedQuest != null
                              ? _linkedQuest!.category.icon
                              : Icons.add_task_rounded,
                          size: 18,
                          color: _linkedQuest != null
                              ? AppColors.limePrimary
                              : AppColors.textTertiary,
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                _linkedQuest != null
                                    ? 'FOCUS TARGET: ${_linkedQuest!.title.toUpperCase()}'
                                    : 'NO QUEST LINKED (TAP TO ASSIGN)',
                                style: AppTypography.captionBold.copyWith(
                                  fontSize: 11,
                                  color: _linkedQuest != null
                                      ? AppColors.textPrimary
                                      : AppColors.textTertiary,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              if (_linkedQuest != null)
                                Text(
                                  '${_linkedQuest!.subtasks.where((s) => s.isCompleted).length}/${_linkedQuest!.subtasks.length} Subtasks done',
                                  style: AppTypography.caption.copyWith(
                                    fontSize: 10,
                                    color: AppColors.limePrimary,
                                  ),
                                ),
                            ],
                          ),
                        ),
                        const Icon(
                          Icons.swap_horiz_rounded,
                          size: 16,
                          color: AppColors.textSecondary,
                        ),
                      ],
                    ),
                  ),
                ),
              ),

              const SizedBox(height: AppSpacing.md),

              // Control Buttons Bar (Reset | Start/Pause | Skip)
              Padding(
                padding: const EdgeInsets.symmetric(
                  horizontal: AppSpacing.lg,
                  vertical: AppSpacing.md,
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Reset Button
                    IconButton(
                      icon: const Icon(Icons.refresh_rounded, color: AppColors.textSecondary),
                      iconSize: 26,
                      onPressed: _resetTimer,
                      tooltip: 'Reset Timer',
                    ),
                    const SizedBox(width: AppSpacing.md),

                    // Primary Play/Pause Floating Action
                    GestureDetector(
                      onTap: isRunning ? _pauseTimer : _startTimer,
                      child: Container(
                        width: 76,
                        height: 76,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: AppColors.limePrimary,
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.limePrimary.withValues(alpha: 0.45),
                              blurRadius: 18,
                              spreadRadius: 2,
                            ),
                          ],
                        ),
                        child: Icon(
                          isRunning ? Icons.pause_rounded : Icons.play_arrow_rounded,
                          size: 40,
                          color: AppColors.darkBase,
                        ),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),

                    // Skip / Complete Step
                    IconButton(
                      icon: const Icon(Icons.skip_next_rounded, color: AppColors.textSecondary),
                      iconSize: 28,
                      onPressed: _onSessionComplete,
                      tooltip: 'Complete Sesh (+XP)',
                    ),
                  ],
                ),
              ),

              const SizedBox(height: AppSpacing.sm),
            ],
          ),
        ),
      ),
    );
  }
}

class _ModePill extends StatelessWidget {
  final FocusMode mode;
  final bool isSelected;
  final VoidCallback onTap;

  const _ModePill({
    required this.mode,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected
              ? AppColors.limePrimary
              : AppColors.darkCard,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? AppColors.limePrimary : AppColors.darkBorder,
          ),
        ),
        child: Text(
          mode.displayName.toUpperCase(),
          style: AppTypography.captionBold.copyWith(
            color: isSelected ? AppColors.darkBase : AppColors.textPrimary,
            letterSpacing: 0.8,
            fontSize: 11,
          ),
        ),
      ),
    );
  }
}

class _TimeAdjustButton extends StatelessWidget {
  final String label;
  final VoidCallback onTap;

  const _TimeAdjustButton({required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
        decoration: BoxDecoration(
          color: AppColors.darkCard,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: AppColors.darkBorder),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 10,
            fontFamily: GoogleFonts.spaceMono().fontFamily,
            fontWeight: FontWeight.bold,
            color: AppColors.textSecondary,
          ),
        ),
      ),
    );
  }
}

class _PomodoroRingPainter extends CustomPainter {
  final double progress;
  final bool isRunning;

  _PomodoroRingPainter({required this.progress, required this.isRunning});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = (size.width - 24) / 2;

    // Track Background
    final trackPaint = Paint()
      ..color = AppColors.darkBorder
      ..style = PaintingStyle.stroke
      ..strokeWidth = 10.0;
    canvas.drawCircle(center, radius, trackPaint);

    if (progress > 0.0) {
      // Progress Sweep Arc
      final sweepAngle = 2 * math.pi * progress;
      final rect = Rect.fromCircle(center: center, radius: radius);

      final progressPaint = Paint()
        ..shader = const SweepGradient(
          startAngle: -math.pi / 2,
          endAngle: 3 * math.pi / 2,
          colors: [
            AppColors.limePrimary,
            Color(0xFF42DFFF),
            AppColors.lavenderAccent,
            AppColors.limePrimary,
          ],
        ).createShader(rect)
        ..style = PaintingStyle.stroke
        ..strokeCap = StrokeCap.round
        ..strokeWidth = 11.0;

      canvas.drawArc(rect, -math.pi / 2, sweepAngle, false, progressPaint);

      // Tip Dot
      final tipAngle = -math.pi / 2 + sweepAngle;
      final tipX = center.dx + radius * math.cos(tipAngle);
      final tipY = center.dy + radius * math.sin(tipAngle);

      final tipPaint = Paint()
        ..color = Colors.white
        ..style = PaintingStyle.fill;
      canvas.drawCircle(Offset(tipX, tipY), 6.0, tipPaint);
    }
  }

  @override
  bool shouldRepaint(covariant _PomodoroRingPainter oldDelegate) {
    return oldDelegate.progress != progress || oldDelegate.isRunning != isRunning;
  }
}
