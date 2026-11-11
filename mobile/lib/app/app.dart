import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:questly/app/providers/app_providers.dart';
import 'package:questly/app/router/app_router.dart';
import 'package:questly/app/theme/app_theme.dart';
import 'package:questly/config/environment.dart';

class QuestlyApp extends ConsumerWidget {
  const QuestlyApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(appRouterProvider);
    final themeMode = ref.watch(themeModeProvider);

    return MaterialApp.router(
      title: EnvironmentConfig.current.appTitle,
      debugShowCheckedModeBanner: false,
      themeMode: themeMode,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      routerConfig: router,
      builder: (context, child) {
        return MediaQuery(
          // Protect against extreme OS font scaling disrupting layouts
          data: MediaQuery.of(context).copyWith(
            textScaler: MediaQuery.of(context).textScaler
                .clamp(minScaleFactor: 0.85, maxScaleFactor: 1.25),
          ),
          child: child ?? const SizedBox.shrink(),
        );
      },
    );
  }
}
