import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:questly/features/gamification/presentation/widgets/streak_flame_animation.dart';

void main() {
  group('Streak Flame Animation & Dialog Tests', () {
    testWidgets('StreakFlameWidget renders procedural flame with canvas', (
      tester,
    ) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(body: StreakFlameWidget(size: 64, showEmbers: true)),
        ),
      );

      expect(find.byType(StreakFlameWidget), findsOneWidget);
      expect(find.byType(CustomPaint), findsWidgets);
    });

    testWidgets('StreakFlameBadge displays streak count and multiplier', (
      tester,
    ) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(
            body: StreakFlameBadge(streakDays: 14, showMultiplier: true),
          ),
        ),
      );

      expect(find.text('14 DAY STREAK'), findsOneWidget);
      expect(find.text('1.2x'), findsOneWidget);
    });

    testWidgets('Tapping StreakFlameBadge opens StreakFlameDialog', (
      tester,
    ) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(body: StreakFlameBadge(streakDays: 7)),
        ),
      );

      await tester.tap(find.byType(StreakFlameBadge));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      expect(find.byType(StreakFlameDialog), findsOneWidget);
      expect(find.text('7 Days Strong'), findsOneWidget);
      expect(find.text('STREAK MAINTAINED'), findsOneWidget);
      expect(find.text('KEEP THE MOMENTUM'), findsOneWidget);

      // Tap keep the momentum to dismiss
      await tester.tap(find.text('KEEP THE MOMENTUM'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));

      expect(find.byType(StreakFlameDialog), findsNothing);
    });
  });
}
