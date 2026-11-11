import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:questly/app/router/route_names.dart';
import 'package:questly/app/theme/app_colors.dart';
import 'package:questly/app/theme/app_typography.dart';

class FocusSquadBar extends StatelessWidget {
  const FocusSquadBar({super.key});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 104,
      child: ListView(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        children: [
          // Event Showdown Pill
          GestureDetector(
            onTap: () => context.push(RoutePaths.arcade),
            child: Container(
              width: 82,
              margin: const EdgeInsets.only(right: 12),
              child: Column(
                children: [
                  Container(
                    width: 54,
                    height: 54,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: AppColors.darkCard,
                      border: Border.all(
                        color: const Color(0xFFFFD700),
                        width: 1.8,
                      ),
                    ),
                    child: const Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.bolt, color: Color(0xFFFFD700), size: 16),
                          Text(
                            'DUEL',
                            style: TextStyle(
                              color: Color(0xFFFFD700),
                              fontSize: 9,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'IN 04:21 HRS',
                    style: AppTypography.captionBold.copyWith(
                      fontSize: 9,
                      color: const Color(0xFFFFD700),
                    ),
                  ),
                  Text(
                    'SHOWDOWN',
                    style: AppTypography.caption.copyWith(
                      fontSize: 8,
                      color: AppColors.textTertiary,
                    ),
                  ),
                ],
              ),
            ),
          ),

          // User "YOU"
          _buildSquadMember(
            name: 'YOU',
            initials: 'YOU',
            isOnline: true,
            isSelf: true,
            onTap: () => context.push(RoutePaths.profile),
          ),

          // Online focus partners
          _buildSquadMember(
            name: 'ETHERIN...',
            initials: 'ET',
            isOnline: true,
            onTap: () => context.push(RoutePaths.focus),
          ),
          _buildSquadMember(
            name: 'YASHMALI',
            initials: 'YM',
            isOnline: true,
            onTap: () => context.push(RoutePaths.focus),
          ),
          _buildSquadMember(
            name: 'ANXU.AK1',
            initials: 'AX',
            isOnline: true,
            onTap: () => context.push(RoutePaths.focus),
          ),
          _buildSquadMember(
            name: 'SARAH.DEV',
            initials: 'SD',
            isOnline: false,
            onTap: () => context.push(RoutePaths.focus),
          ),
        ],
      ),
    );
  }

  Widget _buildSquadMember({
    required String name,
    required String initials,
    required bool isOnline,
    bool isSelf = false,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 68,
        margin: const EdgeInsets.only(right: 10),
        child: Column(
          children: [
            Stack(
              clipBehavior: Clip.none,
              children: [
                Container(
                  width: 52,
                  height: 52,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: isSelf
                        ? AppColors.limePrimary.withValues(alpha: 0.15)
                        : AppColors.darkCard,
                    border: Border.all(
                      color: isSelf
                          ? AppColors.limePrimary
                          : AppColors.darkBorder,
                      width: 1.5,
                    ),
                  ),
                  child: Center(
                    child: Text(
                      initials,
                      style: TextStyle(
                        fontFamily: AppTypography.displayFont,
                        fontSize: 14,
                        fontWeight: FontWeight.bold,
                        color: isSelf
                            ? AppColors.limePrimary
                            : AppColors.textPrimary,
                      ),
                    ),
                  ),
                ),
                if (isOnline)
                  Positioned(
                    top: 1,
                    right: 1,
                    child: Container(
                      width: 12,
                      height: 12,
                      decoration: BoxDecoration(
                        color: AppColors.limePrimary,
                        shape: BoxShape.circle,
                        border: Border.all(color: AppColors.darkBase, width: 2),
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 4),
            Text(
              name,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: AppTypography.captionBold.copyWith(
                fontSize: 10,
                color: isSelf ? AppColors.limePrimary : AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
