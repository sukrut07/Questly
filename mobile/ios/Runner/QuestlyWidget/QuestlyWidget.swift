//
//  QuestlyWidget.swift
//  Runner
//
//  Created for Questly 2.0 WidgetKit Integration.
//

import WidgetKit
import SwiftUI

struct QuestlyEntry: TimelineEntry {
    let date: Date
    let streakDays: Int
    let completedQuests: Int
    let totalQuests: Int
}

struct QuestlyTimelineProvider: TimelineProvider {
    func placeholder(in context: Context) -> QuestlyEntry {
        QuestlyEntry(date: Date(), streakDays: 14, completedQuests: 3, totalQuests: 5)
    }

    func getSnapshot(in context: Context, completion: @escaping (QuestlyEntry) -> Void) {
        let entry = readSharedEntry()
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<QuestlyEntry>) -> Void) {
        let entry = readSharedEntry()
        // Refresh every 30 minutes (subject to iOS WidgetKit budget)
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 30, to: Date()) ?? Date()
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }

    private func readSharedEntry() -> QuestlyEntry {
        let userDefaults = UserDefaults(suiteName: "group.com.questly.app")
        let streak = userDefaults?.integer(forKey: "widget_streak_days") ?? 14
        let completed = userDefaults?.integer(forKey: "widget_completed_quests") ?? 3
        let total = userDefaults?.integer(forKey: "widget_total_quests") ?? 5
        return QuestlyEntry(
            date: Date(),
            streakDays: max(1, streak),
            completedQuests: completed,
            totalQuests: max(1, total)
        )
    }
}

struct QuestlyWidgetEntryView : View {
    var entry: QuestlyTimelineProvider.Entry
    @Environment(\.widgetFamily) var family

    var body: some View {
        ZStack {
            Color(red: 0.06, green: 0.06, blue: 0.06) // #101010 Dark Charcoal

            VStack(alignment: .leading, spacing: 6) {
                HStack {
                    Text("QUESTLY")
                        .font(.system(size: 11, weight: .bold, design: .monospaced))
                        .foregroundColor(Color(red: 0.71, green: 1.0, blue: 0.33)) // #B5FF55 Lime
                    Spacer()
                    Image(systemName: "flame.fill")
                        .foregroundColor(Color(red: 0.73, green: 0.64, blue: 1.0)) // #B9A3FF Lavender
                        .font(.system(size: 12))
                }

                Spacer()

                VStack(alignment: .leading, spacing: 1) {
                    Text("\(entry.streakDays)")
                        .font(.system(size: 32, weight: .black, design: .rounded))
                        .foregroundColor(.white)
                    Text("DAY STREAK")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundColor(Color(red: 0.73, green: 0.64, blue: 1.0))
                }

                Spacer()

                Text("\(entry.completedQuests) / \(entry.totalQuests) Quests Done")
                    .font(.system(size: 10, weight: .medium))
                    .foregroundColor(Color.gray)
            }
            .padding(14)
        }
        .widgetURL(URL(string: "questly://dashboard"))
    }
}

@main
struct QuestlyWidget: Widget {
    let kind: String = "QuestlyWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: QuestlyTimelineProvider()) { entry in
            QuestlyWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Questly Momentum")
        .description("Track your current streak and today's quest progress.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
