package com.questly.mobile

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import org.json.JSONObject

class QuestlyWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    companion object {
        fun updateAppWidget(
            context: Context,
            appWidgetManager: AppWidgetManager,
            appWidgetId: Int
        ) {
            val views = RemoteViews(context.packageName, R.layout.widget_small)

            // Read JSON snapshot from Flutter SharedPreferences
            val prefs = context.getSharedPreferences("FlutterSharedPreferences", Context.MODE_PRIVATE)
            val jsonStr = prefs.getString("flutter.questly_home_widget_data", null)

            var xp = 0
            var level = 1
            var rank = "INITIATE"
            var streak = 0

            if (jsonStr != null) {
                try {
                    val obj = JSONObject(jsonStr)
                    xp = obj.optInt("totalXp", 0)
                    level = obj.optInt("userLevel", 1)
                    rank = obj.optString("academicRank", "INITIATE").uppercase()
                    streak = obj.optInt("streakDays", 0)
                } catch (e: Exception) {
                    // fallback to defaults
                }
            }

            views.setTextViewText(R.id.widget_title, "QUESTLY")
            views.setTextViewText(R.id.widget_streak, "${streak}d 🔥")
            views.setTextViewText(R.id.widget_xp, "$xp XP")
            views.setTextViewText(R.id.widget_rank, "LVL $level $rank")

            // Setup deep link to launch MainActivity
            val launchIntent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            val pendingIntent = PendingIntent.getActivity(
                context,
                0,
                launchIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            views.setOnClickPendingIntent(R.id.widget_title, pendingIntent)

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
