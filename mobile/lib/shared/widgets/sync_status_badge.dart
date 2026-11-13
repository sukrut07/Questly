import 'package:flutter/material.dart';
import 'package:questly/core/storage/sync_queue.dart';

class SyncStatusBadge extends StatelessWidget {
  final AppSyncStatus status;
  final int pendingCount;
  final VoidCallback? onTap;

  const SyncStatusBadge({
    super.key,
    required this.status,
    this.pendingCount = 0,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    Color badgeColor;
    IconData icon;
    String label;

    switch (status) {
      case AppSyncStatus.synced:
        badgeColor = const Color(0xFFB5FF55); // Electric lime
        icon = Icons.cloud_done_rounded;
        label = 'Synced';
        break;
      case AppSyncStatus.syncing:
        badgeColor = const Color(0xFFB9A3FF); // Lavender
        icon = Icons.sync_rounded;
        label = 'Syncing...';
        break;
      case AppSyncStatus.pendingChanges:
        badgeColor = const Color(0xFFFFB347); // Orange
        icon = Icons.cloud_upload_rounded;
        label = pendingCount > 0 ? '$pendingCount pending' : 'Pending';
        break;
      case AppSyncStatus.offline:
        badgeColor = const Color(0xFF888888);
        icon = Icons.cloud_off_rounded;
        label = 'Offline';
        break;
      case AppSyncStatus.error:
        badgeColor = const Color(0xFFFF5252); // Red
        icon = Icons.error_outline_rounded;
        label = 'Sync Error';
        break;
    }

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: const Color(0xFF1A1A1A),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: badgeColor.withValues(alpha: 0.3),
            width: 1,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(icon, size: 14, color: badgeColor),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                color: badgeColor,
                fontSize: 11,
                fontWeight: FontWeight.w600,
                letterSpacing: 0.3,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
