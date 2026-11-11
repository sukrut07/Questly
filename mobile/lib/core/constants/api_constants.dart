/// API endpoint paths and networking constants.
class ApiConstants {
  ApiConstants._();

  // Authentication Endpoints
  static const String login = '/auth/login';
  static const String register = '/auth/register';
  static const String refresh = '/auth/refresh';
  static const String logout = '/auth/logout';

  // User Profile
  static const String profile = '/user/profile';
  static const String preferences = '/user/preferences';

  // Quests & Tasks
  static const String quests = '/quests';
  static const String questDetail = '/quests/{id}';
  static const String completeQuest = '/quests/{id}/complete';
  static const String tasks = '/tasks';

  // Gamification & Progression
  static const String progression = '/progression';
  static const String streak = '/progression/streak';
  static const String awardXp = '/progression/xp';
  static const String achievements = '/achievements';
  static const String skillTree = '/skills';

  // Analytics & Focus
  static const String analytics = '/analytics/summary';
  static const String focusSessions = '/focus/sessions';

  // Headers
  static const String headerAuthorization = 'Authorization';
  static const String headerContentType = 'Content-Type';
  static const String headerAccept = 'Accept';
  static const String contentTypeJson = 'application/json';
}
