import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:questly/app/providers/app_providers.dart';
import 'package:questly/app/theme/app_colors.dart';
import 'package:questly/app/theme/app_spacing.dart';
import 'package:questly/app/theme/app_typography.dart';
import 'package:questly/features/focus/domain/models/focus_session.dart';
import 'package:questly/shared/widgets/questly_button.dart';
import 'package:questly/shared/widgets/questly_grid_background.dart';

class FocusScreen extends ConsumerStatefulWidget {
  const FocusScreen({super.key});

  @override
  ConsumerState<FocusScreen> createState() => _FocusScreenState();
}

class _FocusScreenState extends ConsumerState<FocusScreen> {
  FocusMode _selectedMode = FocusMode.pomodoro;
  TimerState _timerState = TimerState.idle;
  int _remainingSeconds = 25 * 60;
  Timer? _timer;
  DateTime? _startedAt;

  @override
  void initState() {
    super.initState();
    _remainingSeconds = _selectedMode.defaultSeconds;
  }

  @override
  void dispose() {
    _timer?.cancel();
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
    _timer?.cancel();
    setState(() => _timerState = TimerState.paused);
  }

  void _resetTimer() {
    _timer?.cancel();
    setState(() {
      _timerState = TimerState.idle;
      _remainingSeconds = _selectedMode.defaultSeconds;
      _startedAt = null;
    });
  }

  Future<void> _onSessionComplete() async {
    _timer?.cancel();
    setState(() => _timerState = TimerState.completed);

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

    if (mounted) {
      showDialog(
        context: context,
        builder: (ctx) => AlertDialog(
          backgroundColor: AppColors.darkCard,
          title: Text(
            'FOCUS SESSION COMPLETE!',
            style: AppTypography.titleLarge.copyWith(color: AppColors.limePrimary),
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'You crushed a ${_selectedMode.displayName} focus block.',
                style: const TextStyle(color: AppColors.textPrimary),
              ),
              const SizedBox(height: AppSpacing.md),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                decoration: BoxDecoration(
                  color: AppColors.limePrimary.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.limePrimary),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.bolt, color: AppColors.limePrimary),
                    const SizedBox(width: 8),
                    Text(
                      '+$xpEarned XP REWARDED',
                      style: AppTypography.titleMedium.copyWith(color: AppColors.limePrimary),
                    ),
                  ],
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
              child: const Text('GREAT', style: TextStyle(color: AppColors.limePrimary)),
              onPressed: () {
                Navigator.pop(ctx);
                _resetTimer();
              },
            ),
          ],
        ),
      );
    }
  }

  String _formatTime(int totalSeconds) {
    final minutes = totalSeconds ~/ 60;
    final seconds = totalSeconds % 60;
    return '${minutes.toString().padLeft(2, '0')}:${seconds.toString().padLeft(2, '0')}';
  }

  @override
  Widget build(BuildContext context) {
    final totalSec = _selectedMode.defaultSeconds;
    final progress = totalSec > 0 ? (1.0 - (_remainingSeconds / totalSec)).clamp(0.0, 1.0) : 0.0;

    return Scaffold(
      backgroundColor: AppColors.darkBase,
      body: QuestlyGridBackground(
        child: SafeArea(
          child: Column(
            children: [
              // Header
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
                    Text(
                      'DEEP FOCUS',
                      style: AppTypography.titleMedium.copyWith(letterSpacing: 1.5),
                    ),
                    const SizedBox(width: 48), // balance
                  ],
                ),
              ),

              const SizedBox(height: AppSpacing.md),

              // Mode Selector Tabs
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
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
                  ],
                ),
              ),

              const Spacer(),

              // Circular Countdown Timer
              Center(
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    // Outer glow blur
                    Container(
                      width: 260,
                      height: 260,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: _timerState == TimerState.running
                                ? AppColors.limePrimary.withValues(alpha: 0.15)
                                : Colors.transparent,
                            blurRadius: 36,
                            spreadRadius: 8,
                          ),
                        ],
                      ),
                    ),

                    // Progress Arc
                    SizedBox(
                      width: 250,
                      height: 250,
                      child: CircularProgressIndicator(
                        value: progress,
                        strokeWidth: 10,
                        backgroundColor: AppColors.darkBorder,
                        valueColor: const AlwaysStoppedAnimation(AppColors.limePrimary),
                      ),
                    ),

                    // Center Digits
                    Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          _formatTime(_remainingSeconds),
                          style: AppTypography.displayLarge.copyWith(
                            fontSize: 54,
                            letterSpacing: 2.0,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _selectedMode.displayName.toUpperCase(),
                          style: AppTypography.captionBold.copyWith(
                            color: AppColors.lavenderAccent,
                            letterSpacing: 2.0,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),

              const Spacer(),

              // Action Controls
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.xl),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    if (_timerState == TimerState.running || _timerState == TimerState.paused)
                      IconButton(
                        icon: const Icon(Icons.refresh, color: AppColors.textTertiary, size: 28),
                        onPressed: _resetTimer,
                      ),
                    const SizedBox(width: AppSpacing.md),
                    if (_timerState == TimerState.running)
                      QuestlyButton(
                        text: 'PAUSE',
                        icon: Icons.pause,
                        variant: QuestlyButtonVariant.secondaryLavender,
                        size: QuestlyButtonSize.large,
                        onPressed: _pauseTimer,
                      )
                    else
                      QuestlyButton(
                        text: _timerState == TimerState.paused ? 'RESUME' : 'START FOCUS',
                        icon: Icons.play_arrow,
                        variant: QuestlyButtonVariant.primaryLime,
                        size: QuestlyButtonSize.large,
                        onPressed: _startTimer,
                      ),
                  ],
                ),
              ),

              const SizedBox(height: AppSpacing.xxl),
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
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.limePrimary : AppColors.darkCard,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? AppColors.limePrimary : AppColors.darkBorder,
          ),
        ),
        child: Text(
          '${mode.displayName} (${mode.defaultMinutes}m)',
          style: TextStyle(
            color: isSelected ? AppColors.darkBase : AppColors.textPrimary,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
            fontSize: 12,
          ),
        ),
      ),
    );
  }
}
