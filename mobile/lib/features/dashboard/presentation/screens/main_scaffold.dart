import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:questly/app/theme/app_colors.dart';

class MainScaffold extends StatelessWidget {
  final StatefulNavigationShell navigationShell;

  const MainScaffold({super.key, required this.navigationShell});

  void _onDestinationSelected(int index) {
    navigationShell.goBranch(
      index,
      initialLocation: index == navigationShell.currentIndex,
    );
  }

  @override
  Widget build(BuildContext context) {
    final selectedIndex = navigationShell.currentIndex;

    return Scaffold(
      backgroundColor: AppColors.darkBase,
      body: navigationShell,
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: AppColors.darkCard,
          border: Border(
            top: BorderSide(
              color: AppColors.darkBorder,
              width: 1,
            ),
          ),
        ),
        child: SafeArea(
          top: false,
          child: SizedBox(
            height: 64,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildNavItem(0, Icons.home_rounded, Icons.home_outlined, 'Home', selectedIndex),
                _buildNavItem(1, Icons.flag_rounded, Icons.flag_outlined, 'Quests', selectedIndex),
                _buildNavItem(2, Icons.insights_rounded, Icons.insights_outlined, 'Insights', selectedIndex),
                _buildNavItem(3, Icons.edit_note_rounded, Icons.edit_note_outlined, 'Notebook', selectedIndex),
                _buildNavItem(4, Icons.alt_route_rounded, Icons.alt_route_outlined, 'Roadmaps', selectedIndex),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(
    int index,
    IconData selectedIcon,
    IconData unselectedIcon,
    String label,
    int selectedIndex,
  ) {
    final isSelected = selectedIndex == index;

    return Expanded(
      child: InkWell(
        onTap: () => _onDestinationSelected(index),
        splashColor: Colors.transparent,
        highlightColor: Colors.transparent,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              isSelected ? selectedIcon : unselectedIcon,
              size: 24,
              color: isSelected ? AppColors.limePrimary : AppColors.textTertiary,
            ),
            const SizedBox(height: 3),
            Text(
              label,
              style: TextStyle(
                fontFamily: GoogleFonts.inter().fontFamily,
                fontSize: 10,
                fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                color: isSelected ? AppColors.limePrimary : AppColors.textTertiary,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
