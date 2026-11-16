import 'package:flutter/material.dart';
import 'package:questly/app/theme/app_colors.dart';
import 'package:questly/app/theme/app_spacing.dart';
import 'package:questly/app/theme/app_typography.dart';
import 'package:questly/shared/widgets/questly_card.dart';

class WorkloadBalancerCard extends StatelessWidget {
  final int plannedMinutes;
  final int capacityMinutes;

  const WorkloadBalancerCard({
    super.key,
    this.plannedMinutes = 45,
    this.capacityMinutes = 180,
  });

  @override
  Widget build(BuildContext context) {
    final ratio = capacityMinutes > 0
        ? (plannedMinutes / capacityMinutes).clamp(0.0, 1.0)
        : 0.0;

    final String statusLabel;
    final Color statusColor;
    final String advice;

    if (ratio < 0.4) {
      statusLabel = 'LIGHT';
      statusColor = AppColors.limePrimary;
      advice = 'Light schedule today. Good opportunity for spaced revision or practice.';
    } else if (ratio <= 0.85) {
      statusLabel = 'OPTIMAL';
      statusColor = const Color(0xFF42DFFF);
      advice =
          'Balanced focus volume. Pacing is sustainable for high retention.';
    } else {
      statusLabel = 'HEAVY';
      statusColor = const Color(0xFFFF806B);
      advice = 'High task density. Consider spacing larger coursework across multiple days.';
    }

    return QuestlyCard(
      borderColor: AppColors.darkBorder,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Text(
                    'Workload Balancer',
                    style: AppTypography.titleSmall.copyWith(
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.xs),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 6,
                      vertical: 2,
                    ),
                    decoration: BoxDecoration(
                      color: statusColor.withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      statusLabel,
                      style: AppTypography.captionBold.copyWith(
                        color: statusColor,
                        fontSize: 10,
                      ),
                    ),
                  ),
                ],
              ),
              Text(
                'Planned: ${plannedMinutes}m  •  Capacity: ${capacityMinutes}m',
                style: AppTypography.caption.copyWith(
                  color: AppColors.textSecondary,
                  fontSize: 11,
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.xs),
          Text(
            advice,
            style: AppTypography.bodySmall.copyWith(
              color: AppColors.textSecondary,
              fontSize: 12,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Container(
            height: 6,
            width: double.infinity,
            decoration: BoxDecoration(
              color: AppColors.darkBorder,
              borderRadius: BorderRadius.circular(4),
            ),
            child: FractionallySizedBox(
              alignment: Alignment.centerLeft,
              widthFactor: ratio,
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [statusColor.withValues(alpha: 0.8), statusColor],
                  ),
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
