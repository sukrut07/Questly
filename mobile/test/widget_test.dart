import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:questly/app/app.dart';
import 'package:questly/app/providers/app_providers.dart';
import 'package:questly/features/dashboard/presentation/screens/main_scaffold.dart';

void main() {
  testWidgets('Questly app boots and renders initial navigation shell', (
    WidgetTester tester,
  ) async {
    SharedPreferences.setMockInitialValues({});
    final prefs = await SharedPreferences.getInstance();

    await tester.pumpWidget(
      ProviderScope(
        overrides: [sharedPreferencesProvider.overrideWithValue(prefs)],
        child: const QuestlyApp(),
      ),
    );

    // Initial pump
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 300));

    // Verify MainScaffold is present
    expect(find.byType(MainScaffold), findsOneWidget);

    // Verify Bottom Navigation labels exist in MainScaffold
    expect(
      find.descendant(
        of: find.byType(MainScaffold),
        matching: find.text('Home'),
      ),
      findsWidgets,
    );
    expect(
      find.descendant(
        of: find.byType(MainScaffold),
        matching: find.text('Quests'),
      ),
      findsWidgets,
    );
    expect(
      find.descendant(
        of: find.byType(MainScaffold),
        matching: find.text('Insights'),
      ),
      findsWidgets,
    );
    expect(
      find.descendant(
        of: find.byType(MainScaffold),
        matching: find.text('Notebook'),
      ),
      findsWidgets,
    );
    expect(
      find.descendant(
        of: find.byType(MainScaffold),
        matching: find.text('Roadmaps'),
      ),
      findsWidgets,
    );
  });
}
