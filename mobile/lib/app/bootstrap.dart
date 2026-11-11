import 'dart:async';
import 'dart:developer' as dev;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:questly/app/app.dart';
import 'package:questly/app/providers/app_providers.dart';
import 'package:questly/config/environment.dart';

Future<void> bootstrap({EnvironmentConfig? config}) async {
  if (config != null) {
    EnvironmentConfig.current = config;
  }

  // Catch synchronous and Flutter framework errors
  FlutterError.onError = (details) {
    dev.log(
      details.exceptionAsString(),
      name: 'FlutterError',
      stackTrace: details.stack,
    );
  };

  await runZonedGuarded(() async {
    WidgetsFlutterBinding.ensureInitialized();

    // Initialize SharedPreferences
    final sharedPreferences = await SharedPreferences.getInstance();

    runApp(
      ProviderScope(
        overrides: [
          sharedPreferencesProvider.overrideWithValue(sharedPreferences),
        ],
        child: const QuestlyApp(),
      ),
    );
  }, (error, stack) {
    dev.log(
      'Uncaught async error: $error',
      name: 'ZoneGuard',
      stackTrace: stack,
    );
  });
}
