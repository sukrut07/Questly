import 'package:flutter_test/flutter_test.dart';
import 'package:questly/features/dashboard/data/repositories/widget_repository.dart';
import 'package:questly/features/dashboard/domain/models/dashboard_widget_config.dart';

import 'sync_queue_test.dart';

void main() {
  group('WidgetRepository In-App Widget Tests', () {
    late MockLocalStorage storage;
    late WidgetRepository repo;

    setUp(() {
      storage = MockLocalStorage();
      repo = WidgetRepositoryImpl(storage);
    });

    test('getWidgets returns default list when storage is empty', () async {
      final widgets = await repo.getWidgets();
      expect(widgets.isNotEmpty, true);
      expect(widgets.length, DashboardWidgetConfig.defaultWidgets.length);
      expect(widgets.first.type, DashboardWidgetType.focusSquad);
    });

    test('toggleVisibility persists widget hidden state', () async {
      final widgets = await repo.getWidgets();
      final target = widgets.first;

      await repo.toggleVisibility(target.id, false);

      final updated = await repo.getWidgets();
      final updatedTarget = updated.firstWhere((w) => w.id == target.id);
      expect(updatedTarget.isVisible, false);
    });

    test('reorderWidgets reorders items correctly', () async {
      final initial = await repo.getWidgets();
      final firstId = initial[0].id;
      final secondId = initial[1].id;

      await repo.reorderWidgets(0, 2);

      final updated = await repo.getWidgets();
      expect(updated[0].id, secondId);
      expect(updated[1].id, firstId);
    });

    test('restoreDefaults restores original layout', () async {
      await repo.toggleVisibility('w_focus_squad', false);
      await repo.restoreDefaults();

      final restored = await repo.getWidgets();
      final focusSquad = restored.firstWhere((w) => w.id == 'w_focus_squad');
      expect(focusSquad.isVisible, true);
    });
  });
}
