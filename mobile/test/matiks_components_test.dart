import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:questly/shared/widgets/questly_button.dart';
import 'package:questly/shared/widgets/questly_card.dart';
import 'package:questly/shared/widgets/questly_heatmap.dart';
import 'package:questly/shared/widgets/questly_xp_indicator.dart';

void main() {
  group('Matiks UI Components', () {
    testWidgets('QuestlyButton renders and triggers tap callback', (
      tester,
    ) async {
      bool tapped = false;

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: QuestlyButton(
              text: 'START FOCUS',
              onPressed: () => tapped = true,
              variant: QuestlyButtonVariant.primaryLime,
            ),
          ),
        ),
      );

      expect(find.text('START FOCUS'), findsOneWidget);
      await tester.tap(find.byType(QuestlyButton));
      await tester.pumpAndSettle();

      expect(tapped, isTrue);
    });

    testWidgets('QuestlyCard renders child content', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(
          home: Scaffold(body: QuestlyCard(child: Text('Card Content'))),
        ),
      );

      expect(find.text('Card Content'), findsOneWidget);
    });

    testWidgets('QuestlyXPIndicator renders XP amount', (tester) async {
      await tester.pumpWidget(
        const MaterialApp(home: Scaffold(body: QuestlyXPIndicator(xp: 2450))),
      );

      expect(find.text('2450 XP'), findsOneWidget);
    });

    testWidgets('QuestlyHeatmap renders without overflow', (tester) async {
      final now = DateTime.now();
      final data = {
        '2026-01-01': HeatmapDayData(date: now, count: 3, xpEarned: 150),
      };

      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: QuestlyHeatmap(activityData: data, weeksToShow: 8),
          ),
        ),
      );

      expect(find.byType(QuestlyHeatmap), findsOneWidget);
    });
  });
}
