import 'package:flutter_test/flutter_test.dart';
import 'package:questly/core/storage/local_storage.dart';
import 'package:questly/core/storage/sync_queue.dart';

class MockLocalStorage implements LocalStorage {
  final Map<String, dynamic> _data = {};

  @override
  Future<bool> setString(String key, String value) async {
    _data[key] = value;
    return true;
  }

  @override
  String? getString(String key) => _data[key] as String?;

  @override
  bool containsKey(String key) => _data.containsKey(key);

  @override
  Future<bool> remove(String key) async {
    _data.remove(key);
    return true;
  }

  @override
  Future<bool> clear() async {
    _data.clear();
    return true;
  }

  @override
  bool? getBool(String key) => _data[key] as bool?;
  @override
  Future<bool> setBool(String key, bool value) async {
    _data[key] = value;
    return true;
  }

  @override
  int? getInt(String key) => _data[key] as int?;
  @override
  Future<bool> setInt(String key, int value) async {
    _data[key] = value;
    return true;
  }

  @override
  double? getDouble(String key) => _data[key] as double?;
  @override
  Future<bool> setDouble(String key, double value) async {
    _data[key] = value;
    return true;
  }

  @override
  List<String>? getStringList(String key) => _data[key] as List<String>?;
  @override
  Future<bool> setStringList(String key, List<String> value) async {
    _data[key] = value;
    return true;
  }
}

void main() {
  group('SyncQueue Offline-First Tests', () {
    late MockLocalStorage storage;
    late SyncQueue syncQueue;

    setUp(() {
      storage = MockLocalStorage();
      syncQueue = SyncQueue(storage);
    });

    test('enqueue adds a pending sync item', () async {
      final item = SyncQueueItem(
        id: 'item-1',
        action: 'complete',
        entityType: 'quest',
        endpoint: '/rest/v1/rpc/record_activity_and_award_xp',
        payload: {'xp': 50},
        idempotencyKey: 'idem-1',
        createdAt: DateTime.now(),
      );

      await syncQueue.enqueue(item);

      final pending = syncQueue.getPendingItems();
      expect(pending.length, 1);
      expect(pending.first.id, 'item-1');
      expect(pending.first.status, SyncQueueStatus.pending);
    });

    test('deduplicates items with identical idempotencyKey', () async {
      final item1 = SyncQueueItem(
        id: 'item-1',
        action: 'complete',
        entityType: 'quest',
        endpoint: '/rest/v1/rpc/record_activity_and_award_xp',
        payload: {'xp': 50},
        idempotencyKey: 'same-key',
        createdAt: DateTime.now(),
      );

      final item2 = SyncQueueItem(
        id: 'item-2',
        action: 'complete',
        entityType: 'quest',
        endpoint: '/rest/v1/rpc/record_activity_and_award_xp',
        payload: {'xp': 50},
        idempotencyKey: 'same-key',
        createdAt: DateTime.now(),
      );

      await syncQueue.enqueue(item1);
      await syncQueue.enqueue(item2);

      final items = syncQueue.getItems();
      expect(items.length, 1);
      expect(items.first.id, 'item-2');
    });

    test('status update and clearCompleted operate correctly', () async {
      final item = SyncQueueItem(
        id: 'item-1',
        action: 'create',
        entityType: 'note',
        endpoint: '/rest/v1/notes',
        payload: {'title': 'Algorithms'},
        idempotencyKey: 'note-1',
        createdAt: DateTime.now(),
      );

      await syncQueue.enqueue(item);
      await syncQueue.updateStatus('item-1', SyncQueueStatus.synced);

      expect(syncQueue.getPendingItems().isEmpty, true);

      await syncQueue.clearCompleted();
      expect(syncQueue.getItems().isEmpty, true);
    });
  });
}

