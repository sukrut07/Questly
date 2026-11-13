import 'dart:convert';

import 'package:questly/core/storage/local_storage.dart';

enum SyncQueueStatus { pending, syncing, synced, failed }

enum AppSyncStatus { synced, syncing, offline, pendingChanges, error }

class SyncQueueItem {
  final String id;
  final String action; // 'create', 'update', 'delete', 'complete'
  final String
  entityType; // 'quest', 'habit', 'goal', 'focus', 'note', 'activity'
  final String endpoint;
  final Map<String, dynamic> payload;
  final String idempotencyKey;
  final SyncQueueStatus status;
  final int retryCount;
  final DateTime createdAt;
  final DateTime? lastAttemptAt;
  final String? errorMessage;

  const SyncQueueItem({
    required this.id,
    required this.action,
    required this.entityType,
    required this.endpoint,
    required this.payload,
    required this.idempotencyKey,
    this.status = SyncQueueStatus.pending,
    this.retryCount = 0,
    required this.createdAt,
    this.lastAttemptAt,
    this.errorMessage,
  });

  SyncQueueItem copyWith({
    SyncQueueStatus? status,
    int? retryCount,
    DateTime? lastAttemptAt,
    String? errorMessage,
  }) {
    return SyncQueueItem(
      id: id,
      action: action,
      entityType: entityType,
      endpoint: endpoint,
      payload: payload,
      idempotencyKey: idempotencyKey,
      status: status ?? this.status,
      retryCount: retryCount ?? this.retryCount,
      createdAt: createdAt,
      lastAttemptAt: lastAttemptAt ?? this.lastAttemptAt,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'action': action,
    'entityType': entityType,
    'endpoint': endpoint,
    'payload': payload,
    'idempotencyKey': idempotencyKey,
    'status': status.name,
    'retryCount': retryCount,
    'createdAt': createdAt.toIso8601String(),
    'lastAttemptAt': lastAttemptAt?.toIso8601String(),
    'errorMessage': errorMessage,
  };

  factory SyncQueueItem.fromJson(Map<String, dynamic> json) {
    return SyncQueueItem(
      id: json['id'] as String,
      action: json['action'] as String,
      entityType: json['entityType'] as String,
      endpoint: json['endpoint'] as String,
      payload: Map<String, dynamic>.from(json['payload'] as Map),
      idempotencyKey: json['idempotencyKey'] as String,
      status: SyncQueueStatus.values.byName(
        json['status'] as String? ?? 'pending',
      ),
      retryCount: json['retryCount'] as int? ?? 0,
      createdAt: DateTime.parse(json['createdAt'] as String),
      lastAttemptAt: json['lastAttemptAt'] != null
          ? DateTime.parse(json['lastAttemptAt'] as String)
          : null,
      errorMessage: json['errorMessage'] as String?,
    );
  }
}

class SyncQueue {
  static const String _storageKey = 'questly_sync_queue';
  final LocalStorage _storage;

  SyncQueue(this._storage);

  List<SyncQueueItem> getItems() {
    final raw = _storage.getString(_storageKey);
    if (raw == null || raw.isEmpty) return [];
    try {
      final List<dynamic> list = jsonDecode(raw) as List<dynamic>;
      return list
          .map((e) => SyncQueueItem.fromJson(e as Map<String, dynamic>))
          .toList();
    } catch (_) {
      return [];
    }
  }

  Future<void> _saveItems(List<SyncQueueItem> items) async {
    final raw = jsonEncode(items.map((e) => e.toJson()).toList());
    await _storage.setString(_storageKey, raw);
  }

  Future<void> enqueue(SyncQueueItem item) async {
    final items = getItems();
    items.removeWhere(
      (existing) =>
          existing.id == item.id ||
          existing.idempotencyKey == item.idempotencyKey,
    );
    items.add(item);
    await _saveItems(items);
  }

  List<SyncQueueItem> getPendingItems() {
    return getItems()
        .where(
          (e) =>
              e.status == SyncQueueStatus.pending ||
              e.status == SyncQueueStatus.failed,
        )
        .toList();
  }

  Future<void> updateStatus(
    String id,
    SyncQueueStatus status, {
    String? errorMessage,
  }) async {
    final items = getItems();
    final index = items.indexWhere((e) => e.id == id);
    if (index != -1) {
      items[index] = items[index].copyWith(
        status: status,
        lastAttemptAt: DateTime.now(),
        retryCount: status == SyncQueueStatus.failed
            ? items[index].retryCount + 1
            : items[index].retryCount,
        errorMessage: errorMessage,
      );
      await _saveItems(items);
    }
  }

  Future<void> remove(String id) async {
    final items = getItems();
    items.removeWhere((e) => e.id == id);
    await _saveItems(items);
  }

  Future<void> clearCompleted() async {
    final items = getItems();
    items.removeWhere((e) => e.status == SyncQueueStatus.synced);
    await _saveItems(items);
  }

  int getPendingCount() {
    return getItems()
        .where(
          (e) =>
              e.status == SyncQueueStatus.pending ||
              e.status == SyncQueueStatus.failed,
        )
        .length;
  }
}
