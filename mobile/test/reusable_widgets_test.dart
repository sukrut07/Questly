import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:questly/shared/widgets/app_button.dart';
import 'package:questly/shared/widgets/app_card.dart';
import 'package:questly/shared/widgets/stat_badge.dart';
import 'package:questly/shared/widgets/xp_progress_bar.dart';

void main() {
  testWidgets('AppButton renders label and responds to taps', (
    WidgetTester tester,
  ) async {
    var pressed = false;
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: AppButton(
            label: 'Test Button',
            onPressed: () => pressed = true,
          ),
        ),
      ),
    );

    expect(find.text('Test Button'), findsOneWidget);
    await tester.tap(find.text('Test Button'));
    await tester.pump();
    expect(pressed, true);
  });

  testWidgets('AppCard renders child and padding', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(body: AppCard(child: Text('Card Content'))),
      ),
    );

    expect(find.text('Card Content'), findsOneWidget);
  });

  testWidgets('XpProgressBar renders progress percentage', (
    WidgetTester tester,
  ) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: XpProgressBar(currentXp: 150, requiredXp: 300, progress: 0.5),
        ),
      ),
    );

    expect(find.text('150 / 300 XP (50%)'), findsOneWidget);
  });

  testWidgets('StatBadge renders text and icon', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(
        home: Scaffold(
          body: StatBadge(
            label: 'Legendary',
            icon: Icons.shield_rounded,
            color: Colors.amber,
          ),
        ),
      ),
    );

    expect(find.text('Legendary'), findsOneWidget);
    expect(find.byIcon(Icons.shield_rounded), findsOneWidget);
  });
}
