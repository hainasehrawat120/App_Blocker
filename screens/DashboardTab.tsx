import React from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    StatusBar,
    Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DashboardTab = ({ navigation }: any) => {
    const insets = useSafeAreaInsets();

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#0a5568" translucent={false} barStyle="light-content" />
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Branded Header */}
                <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                    <Image
                        source={require("../assets/images/logo.jpeg")}
                        style={styles.headerLogo}
                        resizeMode="contain"
                    />
                    <View style={styles.headerTextGroup}>
                        <Text style={styles.headerAppName}>GenzFocus</Text>
                        <Text style={styles.headerTagline}>Your focus companion</Text>
                    </View>
                </View>

                <View style={styles.content}>
                    <Text style={styles.greeting}>Welcome back!</Text>
                    <Text style={styles.subtitle}>Here is your study overview for today.</Text>

                    {/* Memory Reminder Card */}
                    <View style={styles.memoryCard}>
                        <View style={styles.memoryHeader}>
                            <Text style={styles.memoryTitle}>🧠 MEMORY REMINDER</Text>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>2 Due</Text>
                            </View>
                        </View>

                        <Text style={styles.memoryDesc}>
                            2 Topics need revision today to maintain optimal retention!
                        </Text>

                        <View style={styles.topicList}>
                            <Text style={styles.topicItem}>• Physics: Quantum Basics</Text>
                            <Text style={styles.topicItem}>• History: French Revolution</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.reinforceBtn}
                            onPress={() => navigation.navigate("Memory")}
                        >
                            <Text style={styles.reinforceBtnText}>Start Reinforcing →</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Quick Stats */}
                    <View style={styles.statsRow}>
                        <TouchableOpacity
                            style={styles.statBox}
                            onPress={() => navigation.navigate("Schedule")}
                        >
                            <Text style={styles.statIcon}>📅</Text>
                            <Text style={styles.statValue}>4</Text>
                            <Text style={styles.statLabel}>Classes Today</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.statBox}
                            onPress={() => navigation.navigate("Focus")}
                        >
                            <Text style={styles.statIcon}>🎯</Text>
                            <Text style={styles.statValue}>120m</Text>
                            <Text style={styles.statLabel}>Focus Goal</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </ScrollView>
        </View>
    );
};

export default DashboardTab;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f0f4f8" },

    /* Branded Header */
    header: {
        backgroundColor: "#0a5568",
        paddingHorizontal: 20,
        paddingBottom: 20,
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
    },
    headerLogo: {
        width: 64,
        height: 64,
    },
    headerTextGroup: {
        flex: 1,
    },
    headerAppName: {
        fontSize: 22,
        fontWeight: "800",
        color: "#fff",
        letterSpacing: 0.3,
    },
    headerTagline: {
        fontSize: 12,
        color: "rgba(255,255,255,0.75)",
        marginTop: 1,
    },

    content: { padding: 20 },
    greeting: { fontSize: 28, fontWeight: "800", color: "#222", marginBottom: 4 },
    subtitle: { fontSize: 14, color: "#777", marginBottom: 24 },

    /* Memory Card */
    memoryCard: {
        backgroundColor: "#0a5568",
        borderRadius: 20,
        padding: 24,
        shadowColor: "#0a5568",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
        marginBottom: 24,
    },
    memoryHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    memoryTitle: { fontSize: 16, fontWeight: "700", color: "#fff", letterSpacing: 0.5 },
    badge: {
        backgroundColor: "#E74C3C",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
    memoryDesc: { fontSize: 15, color: "rgba(255,255,255,0.9)", lineHeight: 22, marginBottom: 16 },

    topicList: { marginBottom: 20, backgroundColor: "rgba(255,255,255,0.1)", padding: 12, borderRadius: 12 },
    topicItem: { color: "#fff", fontSize: 14, marginBottom: 6, fontWeight: "500" },

    reinforceBtn: {
        backgroundColor: "#fff",
        paddingVertical: 14,
        borderRadius: 14,
        alignItems: "center",
    },
    reinforceBtnText: { color: "#0a5568", fontSize: 16, fontWeight: "700" },

    /* Quick Stats */
    statsRow: { flexDirection: "row", gap: 16 },
    statBox: {
        flex: 1,
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 16,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statIcon: { fontSize: 24, marginBottom: 8 },
    statValue: { fontSize: 22, fontWeight: "800", color: "#222", marginBottom: 2 },
    statLabel: { fontSize: 13, color: "#777", fontWeight: "500" },
});
