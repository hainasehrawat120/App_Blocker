import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    StatusBar,
    Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const FocusScreen = () => {
    const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
    const [isRunning, setIsRunning] = useState(false);
    const [newSite, setNewSite] = useState("");
    const [blockedSites, setBlockedSites] = useState([
        { id: "1", name: "Facebook", url: "facebook.com" },
        { id: "2", name: "TikTok", url: "tiktok.com" },
        { id: "3", name: "Instagram", url: "instagram.com" },
        { id: "4", name: "Twitter / X", url: "x.com" },
    ]);

    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            setIsRunning(false);
            Alert.alert("🎉 Focus session complete!", "Great job staying focused!");
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning, timeLeft]);

    const toggleTimer = () => {
        setIsRunning(!isRunning);
    };

    const resetTimer = () => {
        setIsRunning(false);
        setTimeLeft(25 * 60);
    };

    const addSite = () => {
        if (!newSite.trim()) return;
        setBlockedSites([
            ...blockedSites,
            { id: Date.now().toString(), name: newSite, url: newSite.toLowerCase() },
        ]);
        setNewSite("");
    };

    const removeSite = (id: string) => {
        setBlockedSites(blockedSites.filter((s) => s.id !== id));
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    };

    const progress = ((25 * 60 - timeLeft) / (25 * 60)) * 100;
    const insets = useSafeAreaInsets();

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
                    <Text style={styles.headerTitle}>🎯 Focus Mode</Text>
                    <Text style={styles.headerSubtitle}>
                        Block distractions and stay focused on your studies
                    </Text>
                </View>

                {/* Timer Card */}
                <View style={styles.timerCard}>
                    <Text style={styles.timerLabel}>Focus Timer</Text>

                    {/* Timer Circle */}
                    <View style={styles.timerCircle}>
                        <View style={styles.timerInner}>
                            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
                            <Text style={styles.timerStatus}>
                                {isRunning ? "Focusing..." : timeLeft < 25 * 60 ? "Paused" : "Ready"}
                            </Text>
                        </View>
                    </View>

                    {/* Progress Bar */}
                    <View style={styles.progressBarContainer}>
                        <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                    </View>
                    <Text style={styles.progressText}>
                        {Math.round(progress)}% complete
                    </Text>

                    {/* Timer Controls */}
                    <View style={styles.timerControls}>
                        <TouchableOpacity
                            style={[styles.timerButton, isRunning && styles.pauseButton]}
                            onPress={toggleTimer}
                        >
                            <Text style={styles.timerButtonText}>
                                {isRunning ? "⏸  Pause" : "▶  Start Focus Session"}
                            </Text>
                        </TouchableOpacity>
                        {timeLeft < 25 * 60 && (
                            <TouchableOpacity style={styles.resetButton} onPress={resetTimer}>
                                <Text style={styles.resetText}>🔄 Reset</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Blocked Sites */}
                <View style={styles.blockedCard}>
                    <Text style={styles.blockedTitle}>🚫 Blocked Sites</Text>
                    <Text style={styles.blockedSubtitle}>
                        Manage distracting websites during focus sessions
                    </Text>

                    {/* Add Site Input */}
                    <View style={styles.addRow}>
                        <TextInput
                            placeholder="Add site to block..."
                            placeholderTextColor="#aaa"
                            style={styles.addInput}
                            value={newSite}
                            onChangeText={setNewSite}
                            onSubmitEditing={addSite}
                        />
                        <TouchableOpacity style={styles.addBtn} onPress={addSite}>
                            <Text style={styles.addBtnText}>+ Add</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Sites List */}
                    {blockedSites.map((site) => (
                        <View key={site.id} style={styles.siteItem}>
                            <View style={styles.siteIconBox}>
                                <Text style={styles.siteIcon}>🌐</Text>
                            </View>
                            <View style={styles.siteInfo}>
                                <Text style={styles.siteName}>{site.name}</Text>
                                <Text style={styles.siteUrl}>{site.url}</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.removeBtn}
                                onPress={() => removeSite(site.id)}
                            >
                                <Text style={styles.removeText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

export default FocusScreen;

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

    /* Timer Card */
    timerCard: {
        backgroundColor: "#fff",
        marginHorizontal: 16,
        marginTop: 20,
        borderRadius: 18,
        padding: 24,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
    },
    timerLabel: { fontSize: 16, fontWeight: "700", color: "#222", marginBottom: 20 },

    timerCircle: {
        width: 180,
        height: 180,
        borderRadius: 90,
        borderWidth: 6,
        borderColor: "#0f9d8a",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
        backgroundColor: "#f0faf8",
    },
    timerInner: { alignItems: "center" },
    timerText: { fontSize: 44, fontWeight: "800", color: "#222", letterSpacing: 2 },
    timerStatus: { fontSize: 13, color: "#888", marginTop: 4 },

    progressBarContainer: {
        width: "100%",
        height: 6,
        backgroundColor: "#eee",
        borderRadius: 3,
        marginBottom: 6,
    },
    progressBarFill: {
        height: "100%",
        backgroundColor: "#0f9d8a",
        borderRadius: 3,
    },
    progressText: { fontSize: 12, color: "#aaa", marginBottom: 18 },

    timerControls: { width: "100%", alignItems: "center" },
    timerButton: {
        backgroundColor: "#0f9d8a",
        borderRadius: 14,
        paddingVertical: 14,
        width: "100%",
        alignItems: "center",
    },
    pauseButton: { backgroundColor: "#E67E22" },
    timerButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
    resetButton: { marginTop: 12 },
    resetText: { fontSize: 14, color: "#888", fontWeight: "600" },

    /* Blocked Sites */
    blockedCard: {
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
    blockedTitle: { fontSize: 16, fontWeight: "700", color: "#222", marginBottom: 4 },
    blockedSubtitle: { fontSize: 13, color: "#888", marginBottom: 14 },

    addRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
    addInput: {
        flex: 1,
        borderWidth: 1.2,
        borderColor: "#ddd",
        borderRadius: 12,
        paddingHorizontal: 14,
        fontSize: 14,
        height: 44,
        backgroundColor: "#fafafa",
        color: "#333",
    },
    addBtn: {
        backgroundColor: "#0f9d8a",
        borderRadius: 12,
        paddingHorizontal: 16,
        justifyContent: "center",
    },
    addBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },

    siteItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: "#f0f0f0",
    },
    siteIconBox: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: "#FDE8E8",
        justifyContent: "center",
        alignItems: "center",
        marginRight: 12,
    },
    siteIcon: { fontSize: 16 },
    siteInfo: { flex: 1 },
    siteName: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 2 },
    siteUrl: { fontSize: 12, color: "#999" },
    removeBtn: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: "#FDE8E8",
        justifyContent: "center",
        alignItems: "center",
    },
    removeText: { fontSize: 14, color: "#E74C3C", fontWeight: "700" },
});
