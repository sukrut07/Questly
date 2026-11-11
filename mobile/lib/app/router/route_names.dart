class RouteNames {
  RouteNames._();

  static const String home = 'home';
  static const String quests = 'quests';
  static const String insights = 'insights';
  static const String notebook = 'notebook';
  static const String roadmaps = 'roadmaps';

  static const String dashboard = 'home'; // alias for compatibility
  static const String analytics = 'insights'; // alias for compatibility
  static const String tasks = 'quests'; // integrated in quests destination

  // Secondary & modal destinations
  static const String questDetail = 'questDetail';
  static const String createQuest = 'createQuest';
  static const String focus = 'focus';
  static const String noteEditor = 'noteEditor';
  static const String roadmapDetail = 'roadmapDetail';
  static const String createRoadmap = 'createRoadmap';
  static const String profile = 'profile';
  static const String settings = 'settings';
  static const String achievements = 'achievements';
  static const String notifications = 'notifications';
  static const String onboarding = 'onboarding';
  static const String login = 'login';
}

class RoutePaths {
  RoutePaths._();

  static const String home = '/';
  static const String quests = '/quests';
  static const String insights = '/insights';
  static const String notebook = '/notebook';
  static const String roadmaps = '/roadmaps';

  static const String dashboard = '/';
  static const String analytics = '/insights';
  static const String tasks = '/quests';

  static const String questDetail = '/quests/:id';
  static const String createQuest = '/quests/create';
  static const String focus = '/focus';
  static const String noteEditor = '/notebook/edit/:id';
  static const String roadmapDetail = '/roadmaps/:id';
  static const String createRoadmap = '/roadmaps/create';
  static const String profile = '/profile';
  static const String settings = '/settings';
  static const String achievements = '/achievements';
  static const String notifications = '/notifications';
  static const String onboarding = '/onboarding';
  static const String login = '/login';
}
