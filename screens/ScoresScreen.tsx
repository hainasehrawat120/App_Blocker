import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import api from "../api";

const SUBJECT_COLORS = ["#4A90D9", "#27AE60", "#E67E22", "#9B59B6", "#1ABC9C", "#E74C3C"];

const ScoresScreen = () => {
  const insets = useSafeAreaInsets();
  const [subjects, setSubjects] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subjectsRes, sessionsRes] = await Promise.all([
          api.get("/subjects"),
          api.get("/sessions"),
        ]);
        setSubjects(subjectsRes.data || []);
        setSessions(sessionsRes.data || []);
      } catch (error) {
        console.log("Error loading scores data:", error);
        setSubjects([]);
        setSessions([]);
      }
    };

    fetchData();
  }, []);

  const subjectStats = useMemo(() => {
    return subjects.map((subject: any, index: number) => {
      const hoursGoal = 3;
      const hoursCompleted = 0;
      const percent = hoursGoal > 0 ? (hoursCompleted / hoursGoal) * 100 : 0;

      return {
        name: subject.name || `Subject ${index + 1}`,
        icon: subject.icon || "📘",
        percent,
        hoursCompleted,
        hoursGoal,
        color: subject.color || SUBJECT_COLORS[index % SUBJECT_COLORS.length],
      };
    });
  }, [subjects]);

  const overall = useMemo(() => {
    const totalHours = sessions.reduce((sum: number, session: any) => {
      const hours = Number(session.hours);
      return sum + (Number.isFinite(hours) ? hours : 0);
    }, 0);

    const totalGoalHours = subjectStats.reduce(
      (sum: number, stat: any) => sum + Number(stat.hoursGoal || 0),
      0
    );

    const progress = totalGoalHours > 0 ? Math.min(100, (totalHours / totalGoalHours) * 100) : 0;

    return {
      totalHours,
      progress,
      streak: sessions.length,
    };
  }, [sessions, subjectStats]);

  const today = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
          <Text style={styles.headerTitle}>📊 Study Scores</Text>
          <Text style={styles.headerSubtitle}>
            Track your daily study progress and goals
          </Text>
        </View>

        {subjectStats.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No subjects yet</Text>
            <Text style={styles.emptySubtitle}>
              Add subjects in Schedule tab and they will appear here.
            </Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardsScroll}
          >
            {subjectStats.map((subject, i) => (
              <View key={i} style={styles.summaryCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardIcon}>{subject.icon}</Text>
                  <Text style={styles.cardName}>{subject.name}</Text>
                </View>

                <View style={styles.circleContainer}>
                  <View
                    style={[
                      styles.circleOuter,
                      { borderColor: subject.color + "30" },
                    ]}
                  >
                    <View
                      style={[
                        styles.circleProgress,
                        { borderColor: subject.color },
                      ]}
                    >
                      <Text style={[styles.percentText, { color: subject.color }]}>
                        {subject.percent.toFixed(1)}%
                      </Text>
                    </View>
                  </View>
                </View>

                <Text style={styles.hoursText}>
                  {subject.hoursCompleted}h / {subject.hoursGoal}h
                </Text>
                <View style={styles.hoursBar}>
                  <View
                    style={[
                      styles.hoursFill,
                      {
                        width: `${subject.percent}%`,
                        backgroundColor: subject.color,
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        <View style={styles.targetsCard}>
          <View style={styles.targetsHeader}>
            <Text style={styles.targetsTitle}>🎯 Daily Targets</Text>
            <View style={styles.dateBadge}>
              <Text style={styles.dateText}>{today}</Text>
            </View>
          </View>

          {subjectStats.length === 0 ? (
            <Text style={styles.emptyTargets}>No targets yet. Add a subject first.</Text>
          ) : (
            subjectStats.map((target, i) => (
              <View key={i} style={styles.targetItem}>
                <View style={styles.targetInfo}>
                  <Text style={styles.targetName}>{target.name}</Text>
                  <Text style={styles.targetHours}>
                    {target.hoursCompleted.toFixed(1)}h / {target.hoursGoal.toFixed(1)}h
                  </Text>
                </View>
                <View style={styles.targetRight}>
                  <Text
                    style={[
                      styles.targetPercent,
                      { color: target.percent >= 100 ? "#27AE60" : target.color },
                    ]}
                  >
                    {Math.round(target.percent)}%
                  </Text>
                  <View style={styles.targetBar}>
                    <View
                      style={[
                        styles.targetFill,
                        {
                          width: `${Math.min(target.percent, 100)}%`,
                          backgroundColor: target.color,
                        },
                      ]}
                    />
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.overallRow}>
          <View style={styles.overallCard}>
            <Text style={styles.overallNumber}>{overall.totalHours.toFixed(1)}h</Text>
            <Text style={styles.overallLabel}>Total Logged</Text>
          </View>
          <View style={styles.overallCard}>
            <Text style={styles.overallNumber}>{Math.round(overall.progress)}%</Text>
            <Text style={styles.overallLabel}>Goal Progress</Text>
          </View>
          <View style={styles.overallCard}>
            <Text style={styles.overallNumber}>🔥 {overall.streak}</Text>
            <Text style={styles.overallLabel}>Sessions</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default ScoresScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f4f6f9" },

  header: {
    backgroundColor: "#0a5568",
    paddingHorizontal: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#fff", marginBottom: 6 },
  headerSubtitle: { fontSize: 14, color: "rgba(255,255,255,0.85)", lineHeight: 20 },

  emptyCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 18,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    alignItems: "center",
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", color: "#222", marginBottom: 6 },
  emptySubtitle: { fontSize: 13, color: "#777", textAlign: "center" },

  cardsScroll: { paddingHorizontal: 16, paddingTop: 20, gap: 12 },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    width: 160,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  cardIcon: { fontSize: 18, marginRight: 6 },
  cardName: { fontSize: 14, fontWeight: "700", color: "#333" },

  circleContainer: { marginBottom: 12 },
  circleOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  circleProgress: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  percentText: { fontSize: 14, fontWeight: "800" },

  hoursText: { fontSize: 12, color: "#888", marginBottom: 6 },
  hoursBar: {
    width: "100%",
    height: 5,
    backgroundColor: "#eee",
    borderRadius: 3,
  },
  hoursFill: { height: "100%", borderRadius: 3 },

  targetsCard: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 18,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  targetsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  targetsTitle: { fontSize: 17, fontWeight: "700", color: "#222" },
  dateBadge: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  dateText: { fontSize: 12, color: "#27AE60", fontWeight: "600" },
  emptyTargets: { fontSize: 13, color: "#888", textAlign: "center", paddingVertical: 12 },

  targetItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  targetInfo: { flex: 1 },
  targetName: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 3 },
  targetHours: { fontSize: 12, color: "#888" },
  targetRight: { width: 80, alignItems: "flex-end" },
  targetPercent: { fontSize: 14, fontWeight: "700", marginBottom: 4 },
  targetBar: {
    width: "100%",
    height: 5,
    backgroundColor: "#eee",
    borderRadius: 3,
  },
  targetFill: { height: "100%", borderRadius: 3 },

  overallRow: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 30,
    gap: 10,
  },
  overallCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  overallNumber: { fontSize: 20, fontWeight: "800", color: "#222", marginBottom: 4 },
  overallLabel: { fontSize: 11, color: "#888", fontWeight: "500" },
});
