import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:questly/app/app.dart';
import 'package:questly/app/providers/app_providers.dart';

void main() {
  testWidgets('Questly app boots and renders initial navigation shell', (WidgetTester tester) async {
    SharedPreferences.setMockInitialValues({});
    final prefs = await SharedPreferences.getInstance();

    await tester.pumpWidget(
      ProviderScope(
        overrides: [
          sharedPreferencesProvider.overrideWithValue(prefs),
        ],
        child: const QuestlyApp(),
      ),
    );

    // Initial pump
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 300));

    // Verify Bottom Navigation items exist
    expect(find.byType(NavigationBar), findsOneWidget);
    expect(find.text('Home'), findsOneWidget);
    expect(find.text('Quests'), findsOneWidget);
    expect(find.text('Tasks'), findsOneWidget);
    expect(find.text('Analytics'), findsOneWidget);
    expect(find.text('Profile'), findsOneWidget);
  });
}
