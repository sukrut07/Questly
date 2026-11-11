/// Global application constants.
class AppConstants {
  AppConstants._();

  static const String appName = 'Questly';
  static const String appVersion = '2.0.0';
  static const String appTagline = 'Turn your goals into quests. Build your streak. Level up your life.';

  // Storage Keys
  static const String themeModeKey = 'questly_theme_mode';
  static const String authTokenKey = 'questly_auth_token';
  static const String refreshTokenKey = 'questly_refresh_token';
  static const String userIdKey = 'questly_user_id';
  static const String onboardingCompletedKey = 'questly_onboarding_completed';

  // Animation Durations
  static const Duration fastAnimationDuration = Duration(milliseconds: 200);
  static const Duration normalAnimationDuration = Duration(milliseconds: 350);
  static const Duration slowAnimationDuration = Duration(milliseconds: 600);

  // Gamification Constants
  static const int baselineLevelXp = 250;
  static const int levelXpStep = 100;
  static const int maxFreezes = 2;
  static const int maxSessionFocusXp = 40;
}
