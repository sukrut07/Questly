import 'package:flutter/material.dart';
import 'package:questly/app/theme/app_colors.dart';
import 'package:questly/app/theme/app_spacing.dart';
import 'package:questly/app/theme/app_typography.dart';
import 'package:questly/shared/widgets/app_button.dart';

enum AppPermissionType {
  notifications,
  exactAlarms,
  camera,
  photos,
  healthFitness,
}

enum AppPermissionStatus { granted, denied, permanentlyDenied, notDetermined }

class PermissionRationale {
  final String title;
  final String whyNeeded;
  final String whatIsAccessed;
  final bool isOptional;
  final String denialConsequence;

  const PermissionRationale({
    required this.title,
    required this.whyNeeded,
    required this.whatIsAccessed,
    this.isOptional = true,
    required this.denialConsequence,
  });
}

class PermissionService {
  static final Map<AppPermissionType, PermissionRationale> rationales = {
    AppPermissionType.notifications: const PermissionRationale(
      title: 'Daily Reminders & Streak Shield',
      whyNeeded: 'Alert you before daily quests expire so you never lose your consistency streak.',
      whatIsAccessed: 'Permission to post local system notifications.',
      denialConsequence: 'You will not receive timely quest reminders or streak freeze alerts.',
    ),
    AppPermissionType.exactAlarms: const PermissionRationale(
      title: 'Exact Focus Pomodoro Alarms',
      whyNeeded:
          'Deliver precise alarm chimes when a deep work session finishes.',
      whatIsAccessed: 'Android exact alarm scheduling service.',
      denialConsequence: 'Timers may chime with a short delay if the device is in low-power sleep.',
    ),
    AppPermissionType.camera: const PermissionRationale(
      title: 'Document & Evidence Scanner',
      whyNeeded: 'Capture handwritten study notes, whiteboard diagrams, or workout proof.',
      whatIsAccessed: 'Device camera hardware.',
      denialConsequence:
          'You will need to manually type notes or select pre-existing images.',
    ),
    AppPermissionType.photos: const PermissionRationale(
      title: 'Knowledge Note Attachments',
      whyNeeded: 'Attach diagrams, textbook scans, and screenshots directly inside notebook entries.',
      whatIsAccessed: 'Selected images in your device photo library.',
      denialConsequence:
          'Notes will be limited to Markdown text and code blocks.',
    ),
    AppPermissionType.healthFitness: const PermissionRationale(
      title: 'Fitness & Movement Tracking (Opt-In)',
      whyNeeded: 'Automatically award fitness quest XP when you complete workout rings.',
      whatIsAccessed: 'Health Connect / Apple Health daily active minutes and workout counts.',
      denialConsequence: 'You can still track fitness quests manually by tapping to complete them.',
    ),
  };

  static Future<bool> showContextualRequest({
    required BuildContext context,
    required AppPermissionType type,
    required Future<bool> Function() onRequest,
  }) async {
    final rationale = rationales[type]!;

    final shouldProceed = await showDialog<bool>(
      context: context,
      barrierDismissible: true,
      builder: (dialogCtx) => AlertDialog(
        backgroundColor: AppColors.darkSurface,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: AppColors.darkBorder, width: 1),
        ),
        title: Text(
          rationale.title,
          style: AppTypography.titleMedium.copyWith(
            fontFamily: 'Oswald',
            letterSpacing: 0.8,
            color: AppColors.limePrimary,
          ),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              rationale.whyNeeded,
              style: AppTypography.bodyMedium.copyWith(
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            Container(
              padding: const EdgeInsets.all(AppSpacing.sm),
              decoration: BoxDecoration(
                color: AppColors.darkCard,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.darkBorder),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'DATA ACCESSED:',
                    style: AppTypography.labelSmall.copyWith(
                      color: AppColors.lavenderSecondary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    rationale.whatIsAccessed,
                    style: AppTypography.bodySmall.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  Text(
                    'IF DENIED:',
                    style: AppTypography.labelSmall.copyWith(
                      color: AppColors.error,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    rationale.denialConsequence,
                    style: AppTypography.bodySmall.copyWith(
                      color: AppColors.textTertiary,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogCtx).pop(false),
            child: Text(
              'NOT NOW',
              style: AppTypography.labelMedium.copyWith(
                color: AppColors.textTertiary,
              ),
            ),
          ),
          AppButton(
            label: 'CONTINUE',
            onPressed: () => Navigator.of(dialogCtx).pop(true),
          ),
        ],
      ),
    );

    if (shouldProceed == true) {
      return await onRequest();
    }
    return false;
  }
}
