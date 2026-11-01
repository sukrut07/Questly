package com.example.ui.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.widget.RemoteViews
import com.example.MainActivity
import com.example.R

class QuestlyCompactWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        val data = QuestlyWidgetData.load(context)
        for (widgetId in appWidgetIds) {
            val views = RemoteViews(context.packageName, R.layout.widget_questly_compact).apply {
                setTextViewText(R.id.widget_compact_streak, "🔥 ${data.currentStreak}d")
                setTextViewText(R.id.widget_compact_level, "LEVEL ${String.format("%02d", data.level)}")
                setTextViewText(R.id.widget_compact_xp_text, "${data.currentXp} / ${data.requiredXp} XP")
                setProgressBar(R.id.widget_compact_progress, 100, data.progressPercent, false)
                setTextViewText(
                    R.id.widget_compact_today_stats,
                    "Today: ${data.todayCompletedQuests}/${data.targetQuests} Quests • ${data.todayFocusMins}m Focus"
                )

                // Tapping background navigates to Home
                setOnClickPendingIntent(
                    R.id.widget_compact_root,
                    createNavigationPendingIntent(context, "home", requestCode = 1001)
                )

                // Tapping "Start Focus" button navigates directly to Focus Chamber
                setOnClickPendingIntent(
                    R.id.widget_compact_action_btn,
                    createNavigationPendingIntent(context, "focus", requestCode = 1002)
                )
            }
            appWidgetManager.updateAppWidget(widgetId, views)
        }
    }
}

class QuestlyExpandedWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        val data = QuestlyWidgetData.load(context)
        for (widgetId in appWidgetIds) {
            val views = RemoteViews(context.packageName, R.layout.widget_questly_expanded).apply {
                setTextViewText(R.id.widget_expanded_streak, "🔥 Streak: ${data.currentStreak} days")
                setTextViewText(
                    R.id.widget_expanded_stage_title,
                    "${data.worldStage.uppercase()} — LEVEL ${String.format("%02d", data.level)}"
                )
                setTextViewText(R.id.widget_expanded_xp_text, "${data.currentXp} / ${data.requiredXp} XP")
                setProgressBar(R.id.widget_expanded_progress, 100, data.progressPercent, false)

                setTextViewText(
                    R.id.widget_expanded_focus_text,
                    "⏱ Today's Focus: ${data.todayFocusMins} / ${data.targetFocusMins} min"
                )
                setTextViewText(
                    R.id.widget_expanded_quests_text,
                    "⚔ Daily Quests: ${data.todayCompletedQuests} / ${data.targetQuests} complete"
                )
                setTextViewText(
                    R.id.widget_expanded_quest_title,
                    "${data.recommendedQuestTitle} (${data.recommendedQuestMins}m)"
                )

                // Tapping root opens Home
                setOnClickPendingIntent(
                    R.id.widget_expanded_root,
                    createNavigationPendingIntent(context, "home", requestCode = 2001)
                )

                // Tapping world banner opens Adventure Map
                setOnClickPendingIntent(
                    R.id.widget_expanded_world_banner,
                    createNavigationPendingIntent(context, "adventure", requestCode = 2002)
                )

                // Tapping daily momentum row opens Analytics
                setOnClickPendingIntent(
                    R.id.widget_expanded_momentum,
                    createNavigationPendingIntent(context, "analytics", requestCode = 2003)
                )

                // Tapping quest card opens Quests screen
                setOnClickPendingIntent(
                    R.id.widget_expanded_quest_card,
                    createNavigationPendingIntent(context, "quests", requestCode = 2004)
                )

                // Action buttons
                setOnClickPendingIntent(
                    R.id.widget_expanded_btn_focus,
                    createNavigationPendingIntent(context, "focus", requestCode = 2005)
                )
                setOnClickPendingIntent(
                    R.id.widget_expanded_btn_quests,
                    createNavigationPendingIntent(context, "quests", requestCode = 2006)
                )
            }
            appWidgetManager.updateAppWidget(widgetId, views)
        }
    }
}

object QuestlyWidgetUpdater {

    fun syncAndRefresh(context: Context, data: QuestlyWidgetData) {
        data.save(context)
        updateAllWidgets(context)
    }

    fun updateAllWidgets(context: Context) {
        val appWidgetManager = AppWidgetManager.getInstance(context) ?: return

        // Update compact widgets
        val compactComponent = ComponentName(context, QuestlyCompactWidgetProvider::class.java)
        val compactIds = appWidgetManager.getAppWidgetIds(compactComponent)
        if (compactIds != null && compactIds.isNotEmpty()) {
            val compactProvider = QuestlyCompactWidgetProvider()
            compactProvider.onUpdate(context, appWidgetManager, compactIds)
        }

        // Update expanded widgets
        val expandedComponent = ComponentName(context, QuestlyExpandedWidgetProvider::class.java)
        val expandedIds = appWidgetManager.getAppWidgetIds(expandedComponent)
        if (expandedIds != null && expandedIds.isNotEmpty()) {
            val expandedProvider = QuestlyExpandedWidgetProvider()
            expandedProvider.onUpdate(context, appWidgetManager, expandedIds)
        }
    }
}

private fun createNavigationPendingIntent(context: Context, destination: String, requestCode: Int): PendingIntent {
    val intent = Intent(context, MainActivity::class.java).apply {
        flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
        putExtra("EXTRA_DESTINATION", destination)
    }
    return PendingIntent.getActivity(
        context,
        requestCode,
        intent,
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )
}
