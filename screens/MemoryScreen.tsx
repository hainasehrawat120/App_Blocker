import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MemoryScreen = () => {
    const insets = useSafeAreaInsets();

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
                    <Text style={styles.headerTitle}>🧠 Smart Forgetting Curve Tracker</Text>
                    <Text style={styles.headerSubtitle}>
                        Optimize your memory retention using Ebbinghaus' theory
                    </Text>
                </View>

                {/* Forgetting Curve Card */}
                <View style={styles.curveCard}>
                    <Text style={styles.curveTitle}>The Forgetting Curve</Text>
                    <Text style={styles.curveSubtitle}>Retention % over time</Text>

                    {/* Simplified chart visualization */}
                    <View style={styles.chartContainer}>
                        {/* Y-axis labels */}
                        <View style={styles.yAxis}>
                            <Text style={styles.yLabel}>100%</Text>
                            <Text style={styles.yLabel}>75%</Text>
                            <Text style={styles.yLabel}>50%</Text>
                            <Text style={styles.yLabel}>25%</Text>
                            <Text style={styles.yLabel}>0%</Text>
                        </View>
                        {/* Chart area */}
                        <View style={styles.chartArea}>
                            {/* Curve bars (simplified representation) */}
                            <View style={styles.chartBars}>
                                <View style={[styles.chartBar, { height: "95%" }]}>
                                    <View style={[styles.barFill, { height: "100%", backgroundColor: "#0f9d8a" }]} />
                                </View>
                                <View style={[styles.chartBar, { height: "95%" }]}>
                                    <View style={[styles.barFill, { height: "75%", backgroundColor: "#27AE60" }]} />
                                </View>
                                <View style={[styles.chartBar, { height: "95%" }]}>
                                    <View style={[styles.barFill, { height: "55%", backgroundColor: "#E67E22" }]} />
                                </View>
                                <View style={[styles.chartBar, { height: "95%" }]}>
                                    <View style={[styles.barFill, { height: "40%", backgroundColor: "#E74C3C" }]} />
                                </View>
                                <View style={[styles.chartBar, { height: "95%" }]}>
                                    <View style={[styles.barFill, { height: "30%", backgroundColor: "#E74C3C" }]} />
                                </View>
                                <View style={[styles.chartBar, { height: "95%" }]}>
                                    <View style={[styles.barFill, { height: "22%", backgroundColor: "#C0392B" }]} />
                                </View>
                            </View>
                            {/* X-axis */}
                            <View style={styles.xAxis}>
                                <Text style={styles.xLabel}>1h</Text>
                                <Text style={styles.xLabel}>1d</Text>
                                <Text style={styles.xLabel}>3d</Text>
                                <Text style={styles.xLabel}>7d</Text>
                                <Text style={styles.xLabel}>14d</Text>
                                <Text style={styles.xLabel}>30d</Text>
                            </View>
                        </View>
                    </View>

                    {/* Legend */}
                    <View style={styles.legendRow}>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: "#0f9d8a" }]} />
                            <Text style={styles.legendText}>With review</Text>
                        </View>
                        <View style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: "#E74C3C" }]} />
                            <Text style={styles.legendText}>Without review</Text>
                        </View>
                    </View>
                </View>

                {/* Add Topic Button */}
                <TouchableOpacity style={styles.addButton}>
                    <Text style={styles.addButtonText}>+ Add New Topic</Text>
                </TouchableOpacity>

                {/* Stats Cards */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>3</Text>
                        <Text style={styles.statLabel}>Due for Revision</Text>
                        <View style={styles.statBadge}>
                            <Text style={styles.statBadgeText}>⚠️ Review Now</Text>
                        </View>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>78%</Text>
                        <Text style={styles.statLabel}>Avg. Retention</Text>
                        <View style={[styles.statBadge, styles.goodBadge]}>
                            <Text style={[styles.statBadgeText, styles.goodBadgeText]}>
                                📈 Good
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Topics List */}
                <View style={styles.topicsCard}>
                    <Text style={styles.topicsTitle}>📋 Topics Being Tracked</Text>
                    {[
                        { name: "Quantum Mechanics", retention: 85, next: "Tomorrow", color: "#27AE60" },
                        { name: "French Revolution", retention: 62, next: "Today", color: "#E67E22" },
                        { name: "Organic Chemistry", retention: 45, next: "Overdue", color: "#E74C3C" },
                    ].map((topic, i) => (
                        <View key={i} style={styles.topicItem}>
                            <View style={styles.topicInfo}>
                                <Text style={styles.topicName}>{topic.name}</Text>
                                <Text style={styles.topicNext}>Next review: {topic.next}</Text>
                            </View>
                            <View style={styles.retentionContainer}>
                                <Text style={[styles.retentionText, { color: topic.color }]}>
                                    {topic.retention}%
                                </Text>
                                <View style={styles.retentionBar}>
                                    <View
                                        style={[
                                            styles.retentionFill,
                                            {
                                                width: `${topic.retention}%`,
                                                backgroundColor: topic.color,
                                            },
                                        ]}
                                    />
                                </View>
                            </View>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

export default MemoryScreen;

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

    /* Curve Card */
    curveCard: {
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
    curveTitle: { fontSize: 16, fontWeight: "700", color: "#222", marginBottom: 4 },
    curveSubtitle: { fontSize: 13, color: "#888", marginBottom: 16 },

    chartContainer: { flexDirection: "row", height: 160, marginBottom: 12 },
    yAxis: {
        justifyContent: "space-between",
        marginRight: 8,
        paddingBottom: 20,
    },
    yLabel: { fontSize: 10, color: "#aaa", width: 35, textAlign: "right" },
    chartArea: { flex: 1 },
    chartBars: {
        flex: 1,
        flexDirection: "row",
        alignItems: "flex-end",
        justifyContent: "space-around",
        gap: 6,
    },
    chartBar: {
        flex: 1,
        justifyContent: "flex-end",
        borderRadius: 6,
        overflow: "hidden",
    },
    barFill: { borderRadius: 6 },
    xAxis: {
        flexDirection: "row",
        justifyContent: "space-around",
        paddingTop: 6,
    },
    xLabel: { fontSize: 10, color: "#aaa" },

    legendRow: { flexDirection: "row", justifyContent: "center", gap: 20 },
    legendItem: { flexDirection: "row", alignItems: "center" },
    legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
    legendText: { fontSize: 12, color: "#777" },

    /* Add Button */
    addButton: {
        backgroundColor: "#0f9d8a",
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: "center",
    },
    addButtonText: { color: "#fff", fontSize: 15, fontWeight: "700" },

    /* Stats */
    statsRow: {
        flexDirection: "row",
        marginHorizontal: 16,
        marginTop: 16,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 6,
        elevation: 2,
    },
    statNumber: { fontSize: 28, fontWeight: "800", color: "#222", marginBottom: 4 },
    statLabel: { fontSize: 12, color: "#888", marginBottom: 8 },
    statBadge: {
        backgroundColor: "#FFF3E0",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    statBadgeText: { fontSize: 11, color: "#E67E22", fontWeight: "600" },
    goodBadge: { backgroundColor: "#E8F5E9" },
    goodBadgeText: { color: "#27AE60" },

    /* Topics */
    topicsCard: {
        backgroundColor: "#fff",
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 30,
        borderRadius: 18,
        padding: 18,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    topicsTitle: { fontSize: 16, fontWeight: "700", color: "#222", marginBottom: 14 },
    topicItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: "#f0f0f0",
    },
    topicInfo: { flex: 1 },
    topicName: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 3 },
    topicNext: { fontSize: 12, color: "#888" },
    retentionContainer: { alignItems: "flex-end", width: 70 },
    retentionText: { fontSize: 15, fontWeight: "700", marginBottom: 4 },
    retentionBar: {
        width: "100%",
        height: 5,
        backgroundColor: "#eee",
        borderRadius: 3,
    },
    retentionFill: { height: "100%", borderRadius: 3 },
});
