import React, { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    StatusBar,
    Modal,
    TextInput,
    Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SUBJECT_COLORS = ["#4A90D9", "#E67E22", "#27AE60", "#9B59B6", "#E74C3C", "#007181"];
const SUBJECT_ICONS  = ["📐", "⚡", "🧪", "📖", "🎨", "💻", "🌍", "🔬"];

type Subject = { id: string; subject: string; time: string; day: string; color: string; icon: string };
type Session = { id: string; date: string; totalHours: string; note: string };
type Goal    = { id: string; text: string; done: boolean };

import api from "../api";
import { useEffect } from "react";

const ScheduleScreen = () => {
    const insets = useSafeAreaInsets();
    const getDateString = (daysOffset = 0) => {
        const date = new Date();
        date.setDate(date.getDate() + daysOffset);
        const year = date.getFullYear();
        const month = `${date.getMonth() + 1}`.padStart(2, "0");
        const day = `${date.getDate()}`.padStart(2, "0");
        return `${year}-${month}-${day}`;
    };

    /* ── State ─────────────────────────────────────────────────── */
    const [topics, setTopics]     = useState<any[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [sessions, setSessions]     = useState<Session[]>([]);
    const [sessionSaved, setSessionSaved] = useState(false);
    const [goals, setGoals]       = useState<Goal[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const today = getDateString(0);
            const [subjRes, topicsRes, sessRes, goalsRes] = await Promise.all([
                api.get("/subjects"),
                api.get("/topics"),
                api.get("/sessions"),
                api.get(`/goals?date=${today}`)
            ]);
            setSubjects(subjRes.data.map((s: any) => ({ ...s, subject: s.name })));
            setTopics(topicsRes.data);
            setSessions(
                sessRes.data.map((s: any) => ({
                    ...s,
                    totalHours: String(s.totalHours ?? s.hours ?? ""),
                }))
            );
            setGoals(goalsRes.data);
        } catch (error) {
            console.log("Error fetching data:", error);
        }
    };

    /* ── Modal visibility ──────────────────────────────────────── */
    const [topicModal,   setTopicModal]   = useState(false);
    const [subjectModal, setSubjectModal] = useState(false);
    const [sessionModal, setSessionModal] = useState(false);
    const [statsModal,   setStatsModal]   = useState(false);
    const [goalsModal,   setGoalsModal]   = useState(false);

    /* ── Input state ───────────────────────────────────────────── */
    const [newTopic,       setNewTopic]       = useState("");
    const [newSubName,     setNewSubName]     = useState("");
    const [newSubTime,     setNewSubTime]     = useState("");
    const [newSubDay,      setNewSubDay]      = useState("Today");
    const [selColor,       setSelColor]       = useState(SUBJECT_COLORS[0]);
    const [selIcon,        setSelIcon]        = useState(SUBJECT_ICONS[0]);
    const [sessionTotalHours, setSessionTotalHours] = useState("");
    const [sessionNote,       setSessionNote]       = useState("");
    const [sessionDate,    setSessionDate]    = useState("Today");
    const [newGoal,        setNewGoal]        = useState("");

    /* ── Handlers ──────────────────────────────────────────────── */
    const addTopic = async () => {
        if (!newTopic.trim()) return Alert.alert("Enter a topic name");
        try {
            const res = await api.post("/topics", { name: newTopic.trim() });
            setTopics(p => [...p, res.data]);
            setNewTopic(""); setTopicModal(false);
        } catch (e) { Alert.alert("Error adding topic"); }
    };

    const deleteTopic = async (id: string, index: number) => {
        if (id) {
            try {
                await api.delete(`/topics/${id}`);
                setTopics(p => p.filter(t => t.id !== id));
            } catch (e) { Alert.alert("Error deleting topic"); }
        } else {
            setTopics(p => p.filter((_, j) => j !== index));
        }
    };

    const addSubject = async () => {
        if (!newSubName.trim() || !newSubTime.trim())
            return Alert.alert("Fill in subject name and time");
        try {
            const res = await api.post("/subjects", {
                name: newSubName.trim(), time: newSubTime.trim(), day: newSubDay, color: selColor, icon: selIcon
            });
            setSubjects(p => [...p, { ...res.data, subject: res.data.name }]);
            setNewSubName(""); setNewSubTime(""); setNewSubDay("Today"); setSubjectModal(false);
        } catch (e) { Alert.alert("Error adding subject"); }
    };

    const deleteSubject = (id: string) =>
        Alert.alert("Remove Subject", "Are you sure?", [
            { text: "Cancel", style: "cancel" },
            { text: "Remove", style: "destructive", onPress: async () => {
                try {
                    await api.delete(`/subjects/${id}`);
                    setSubjects(p => p.filter(s => s.id !== id));
                } catch (e) { Alert.alert("Error deleting subject"); }
            }},
        ]);

    const addSession = async () => {
        if (!sessionTotalHours.trim())
            return Alert.alert("Enter total study hours for the day");
        try {
            const normalizedDate = sessionDate === "Tomorrow" ? getDateString(1) : getDateString(0);
            const hoursValue = Number(sessionTotalHours.trim());
            if (Number.isNaN(hoursValue)) {
                Alert.alert("Invalid hours", "Please enter a valid number of hours.");
                return;
            }
            const res = await api.post("/sessions", {
                date: normalizedDate,
                hours: hoursValue,
                note: sessionNote.trim()
            });
            setSessions(p => [...p, { ...res.data, totalHours: res.data.hours.toString() }]);
            setSessionTotalHours(""); setSessionNote("");
            setSessionSaved(true);
        } catch (e) { Alert.alert("Error saving session"); }
    };

    const closeSessionModal = () => {
        setSessionModal(false);
        setSessionSaved(false);
        setSessionDate("Today");
    };

    const addGoal = async () => {
        if (!newGoal.trim()) return;
        try {
            const today = getDateString(0);
            const res = await api.post("/goals", { text: newGoal.trim(), date: today });
            setGoals(p => [...p, res.data]);
            setNewGoal("");
        } catch (e) { Alert.alert("Error adding goal"); }
    };

    const toggleGoal = async (id: string, done: boolean) => {
        try {
            await api.put(`/goals/${id}`, { done: !done });
            setGoals(p => p.map(g => g.id === id ? { ...g, done: !done } : g));
        } catch (e) { Alert.alert("Error toggling goal"); }
    };

    const deleteGoal = async (id: string) => {
        try {
            await api.delete(`/goals/${id}`);
            setGoals(p => p.filter(g => g.id !== id));
        } catch (e) { Alert.alert("Error deleting goal"); }
    };

    /* ── Render ────────────────────────────────────────────────── */
    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="#0a5568" translucent={false} barStyle="light-content" />
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* ── Banner ── */}
                <View style={[styles.banner, { paddingTop: insets.top + 20 }]}>
                    <Text style={styles.bannerLabel}>📚 Topics Due for Review</Text>
                    <View style={styles.tagsRow}>
                        {topics.map((t: any, i) => (
                            <TouchableOpacity key={t.id || i} style={styles.tag}
                                onLongPress={() => deleteTopic(t.id, i)}>
                                <Text style={styles.tagText}>{t.name || t}  ✕</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <View style={styles.bannerButtons}>
                        <TouchableOpacity style={styles.reinforceButton}>
                            <Text style={styles.reinforceText}>Start Reinforcing →</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.addTopicButton} onPress={() => setTopicModal(true)}>
                            <Text style={styles.addTopicText}>＋ Add Topic</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* ── Schedule Card ── */}
                <View style={styles.card}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardTitle}>📅 Today's Schedule</Text>
                        <TouchableOpacity style={styles.addSubjectBtn} onPress={() => setSubjectModal(true)}>
                            <Text style={styles.addSubjectBtnText}>＋ Add Subject</Text>
                        </TouchableOpacity>
                    </View>

                    {subjects.length === 0 && (
                        <Text style={styles.emptyText}>No subjects yet. Add one above!</Text>
                    )}
                    {subjects.map(item => (
                        <View key={item.id} style={styles.scheduleItem}>
                            <View style={[styles.subjectIcon, { backgroundColor: item.color + "18" }]}>
                                <Text style={styles.subjectEmoji}>{item.icon}</Text>
                            </View>
                            <View style={styles.scheduleInfo}>
                                <Text style={styles.subjectName}>{item.subject}</Text>
                                <Text style={styles.scheduleTime}>🕐 {item.time}</Text>
                            </View>
                            <View style={[styles.dayBadge, item.day === "Tomorrow" && styles.tomorrowBadge]}>
                                <Text style={[styles.dayText, item.day === "Tomorrow" && styles.tomorrowText]}>
                                    {item.day}
                                </Text>
                            </View>
                            <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteSubject(item.id)}>
                                <Text style={styles.deleteBtnText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                {/* ── Sessions Card ── */}
                {sessions.length > 0 && (
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>🕐 Study Sessions</Text>
                        {sessions.map(s => (
                            <View key={s.id} style={styles.sessionRow}>
                                <Text style={styles.sessionIcon}>📅</Text>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.subjectName}>{s.totalHours} hrs — {s.date}</Text>
                                    {s.note ? <Text style={styles.scheduleTime}>{s.note}</Text> : null}
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                {/* ── Quick Actions ── */}
                <View style={styles.quickActions}>
                    <Text style={styles.quickTitle}>⚡ Quick Actions</Text>
                    <View style={styles.actionsRow}>
                        <TouchableOpacity style={styles.actionCard} onPress={() => setSessionModal(true)}>
                            <Text style={styles.actionIcon}>➕</Text>
                            <Text style={styles.actionText}>Add Session</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionCard} onPress={() => setStatsModal(true)}>
                            <Text style={styles.actionIcon}>📊</Text>
                            <Text style={styles.actionText}>View Stats</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionCard} onPress={() => setGoalsModal(true)}>
                            <Text style={styles.actionIcon}>🎯</Text>
                            <Text style={styles.actionText}>Set Goals</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* ══ Add Topic Modal ══ */}
            <Modal visible={topicModal} transparent animationType="slide">
                <View style={styles.overlay}>
                    <View style={styles.modalBox}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>📚 Add New Topic</Text>
                            <TouchableOpacity style={styles.closeBtn} onPress={() => setTopicModal(false)}>
                                <Text style={styles.closeBtnText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <TextInput style={styles.input} placeholder="e.g. Newton's Laws"
                            placeholderTextColor="#aaa" value={newTopic} onChangeText={setNewTopic}
                            autoFocus />
                        <View style={styles.modalBtns}>
                            <TouchableOpacity style={styles.cancelBtn} onPress={() => setTopicModal(false)}>
                                <Text style={styles.cancelBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.saveBtn} onPress={addTopic}>
                                <Text style={styles.saveBtnText}>Add Topic</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* ══ Add Subject Modal ══ */}
            <Modal visible={subjectModal} transparent animationType="slide">
                <View style={styles.overlay}>
                    <ScrollView contentContainerStyle={styles.overlayScroll}>
                        <View style={styles.modalBox}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>📝 Add New Subject</Text>
                                <TouchableOpacity style={styles.closeBtn} onPress={() => setSubjectModal(false)}>
                                    <Text style={styles.closeBtnText}>✕</Text>
                                </TouchableOpacity>
                            </View>
                            <TextInput style={styles.input} placeholder="Subject name (e.g. Biology)"
                                placeholderTextColor="#aaa" value={newSubName} onChangeText={setNewSubName} />
                            <TextInput style={styles.input} placeholder="Time (e.g. 6:00 PM - 7:00 PM)"
                                placeholderTextColor="#aaa" value={newSubTime} onChangeText={setNewSubTime} />
                            <Text style={styles.pickerLabel}>Day</Text>
                            <View style={styles.dayRow}>
                                {["Today", "Tomorrow"].map(d => (
                                    <TouchableOpacity key={d}
                                        style={[styles.dayOption, newSubDay === d && styles.dayOptionActive]}
                                        onPress={() => setNewSubDay(d)}>
                                        <Text style={[styles.dayOptionText, newSubDay === d && styles.dayOptionTextActive]}>{d}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <Text style={styles.pickerLabel}>Color</Text>
                            <View style={styles.colorRow}>
                                {SUBJECT_COLORS.map(c => (
                                    <TouchableOpacity key={c}
                                        style={[styles.colorDot, { backgroundColor: c }, selColor === c && styles.colorDotSelected]}
                                        onPress={() => setSelColor(c)} />
                                ))}
                            </View>
                            <Text style={styles.pickerLabel}>Icon</Text>
                            <View style={styles.iconRow}>
                                {SUBJECT_ICONS.map(ic => (
                                    <TouchableOpacity key={ic}
                                        style={[styles.iconOption, selIcon === ic && styles.iconOptionActive]}
                                        onPress={() => setSelIcon(ic)}>
                                        <Text style={styles.iconOptionText}>{ic}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <View style={styles.modalBtns}>
                                <TouchableOpacity style={styles.cancelBtn} onPress={() => setSubjectModal(false)}>
                                    <Text style={styles.cancelBtnText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.saveBtn} onPress={addSubject}>
                                    <Text style={styles.saveBtnText}>Add</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </View>
            </Modal>

            {/* ══ Add Session Modal ══ */}
            <Modal visible={sessionModal} transparent animationType="slide">
                <View style={styles.overlay}>
                    <View style={styles.modalBox}>
                        {/* Header row with X close */}
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>➕ Add Study Session</Text>
                            <TouchableOpacity style={styles.closeBtn} onPress={closeSessionModal}>
                                <Text style={styles.closeBtnText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {sessionSaved ? (
                            /* ── Success state ── */
                            <View style={styles.successBox}>
                                <Text style={styles.successIcon}>✅</Text>
                                <Text style={styles.successTitle}>Session Added!</Text>
                                <Text style={styles.successSub}>Your study session has been logged.</Text>
                                <TouchableOpacity style={[styles.saveBtn, { marginTop: 20 }]} onPress={closeSessionModal}>
                                    <Text style={styles.saveBtnText}>Close</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            /* ── Form state ── */
                            <View>
                                <Text style={styles.pickerLabel}>Date</Text>
                                <View style={styles.dayRow}>
                                    {["Today", "Tomorrow"].map(d => (
                                        <TouchableOpacity key={d}
                                            style={[styles.dayOption, sessionDate === d && styles.dayOptionActive]}
                                            onPress={() => setSessionDate(d)}>
                                            <Text style={[styles.dayOptionText, sessionDate === d && styles.dayOptionTextActive]}>{d}</Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                                <TextInput style={styles.input} placeholder="Total study hours (e.g. 3)"
                                    placeholderTextColor="#aaa" keyboardType="numeric"
                                    value={sessionTotalHours} onChangeText={setSessionTotalHours} />
                                <TextInput style={styles.input} placeholder="Note (optional, e.g. Mock test day)"
                                    placeholderTextColor="#aaa" value={sessionNote} onChangeText={setSessionNote} />
                                <View style={styles.modalBtns}>
                                    <TouchableOpacity style={styles.cancelBtn} onPress={closeSessionModal}>
                                        <Text style={styles.cancelBtnText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={styles.saveBtn} onPress={addSession}>
                                        <Text style={styles.saveBtnText}>Save Session</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>

            {/* ══ Stats Modal ══ */}
            <Modal visible={statsModal} transparent animationType="slide">
                <View style={styles.overlay}>
                    <View style={styles.modalBox}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>📊 Study Stats</Text>
                            <TouchableOpacity style={styles.closeBtn} onPress={() => setStatsModal(false)}>
                                <Text style={styles.closeBtnText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.statRow}>
                            <Text style={styles.statLabel}>Subjects Added</Text>
                            <Text style={styles.statValue}>{subjects.length}</Text>
                        </View>
                        <View style={styles.statRow}>
                            <Text style={styles.statLabel}>Topics Due</Text>
                            <Text style={styles.statValue}>{topics.length}</Text>
                        </View>
                        <View style={styles.statRow}>
                            <Text style={styles.statLabel}>Sessions Logged</Text>
                            <Text style={styles.statValue}>{sessions.length}</Text>
                        </View>
                        <View style={styles.statRow}>
                            <Text style={styles.statLabel}>Goals Set</Text>
                            <Text style={styles.statValue}>{goals.length}</Text>
                        </View>
                        <View style={styles.statRow}>
                            <Text style={styles.statLabel}>Goals Completed</Text>
                            <Text style={[styles.statValue, { color: "#27AE60" }]}>{goals.filter(g => g.done).length}</Text>
                        </View>
                        <TouchableOpacity style={[styles.saveBtn, { marginTop: 18 }]} onPress={() => setStatsModal(false)}>
                            <Text style={styles.saveBtnText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* ══ Goals Modal ══ */}
            <Modal visible={goalsModal} transparent animationType="slide">
                <View style={styles.overlay}>
                    <View style={styles.modalBox}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>🎯 My Goals</Text>
                            <TouchableOpacity style={styles.closeBtn} onPress={() => setGoalsModal(false)}>
                                <Text style={styles.closeBtnText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={{ maxHeight: 220 }}>
                            {goals.map(g => (
                                <View key={g.id} style={styles.goalRow}>
                                    <TouchableOpacity style={[styles.checkbox, g.done && styles.checkboxDone]}
                                        onPress={() => toggleGoal(g.id, g.done)}>
                                        {g.done && <Text style={styles.checkmark}>✓</Text>}
                                    </TouchableOpacity>
                                    <Text style={[styles.goalText, g.done && styles.goalTextDone]}>{g.text}</Text>
                                    <TouchableOpacity onPress={() => deleteGoal(g.id)}>
                                        <Text style={styles.goalDelete}>✕</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </ScrollView>
                        <View style={[styles.dayRow, { marginTop: 14 }]}>
                            <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]}
                                placeholder="New goal..." placeholderTextColor="#aaa"
                                value={newGoal} onChangeText={setNewGoal} />
                            <TouchableOpacity style={[styles.saveBtn, { marginLeft: 10, paddingHorizontal: 18 }]}
                                onPress={addGoal}>
                                <Text style={styles.saveBtnText}>Add</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={[styles.cancelBtn, { marginTop: 12 }]} onPress={() => setGoalsModal(false)}>
                            <Text style={styles.cancelBtnText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

export default ScheduleScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f4f6f9" },

    /* Banner */
    banner: { backgroundColor: "#0a5568", paddingHorizontal: 20, paddingBottom: 24, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
    bannerLabel: { fontSize: 14, color: "rgba(255,255,255,0.85)", marginBottom: 12, fontWeight: "600" },
    tagsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 },
    tag: { backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
    tagText: { color: "#fff", fontSize: 13, fontWeight: "500" },
    bannerButtons: { flexDirection: "row", gap: 10 },
    reinforceButton: { flex: 1, backgroundColor: "#fff", borderRadius: 12, paddingVertical: 12, alignItems: "center" },
    reinforceText: { color: "#007181", fontSize: 15, fontWeight: "700" },
    addTopicButton: { flex: 1, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 12, paddingVertical: 12, alignItems: "center", borderWidth: 1.5, borderColor: "rgba(255,255,255,0.6)" },
    addTopicText: { color: "#fff", fontSize: 15, fontWeight: "700" },

    /* Cards */
    card: { backgroundColor: "#fff", marginHorizontal: 16, marginTop: 20, borderRadius: 18, padding: 18, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
    cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
    cardTitle: { fontSize: 17, fontWeight: "700", color: "#222" },
    addSubjectBtn: { backgroundColor: "#007181", paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20 },
    addSubjectBtnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
    emptyText: { color: "#aaa", textAlign: "center", paddingVertical: 16, fontSize: 14 },

    scheduleItem: { flexDirection: "row", alignItems: "center", paddingVertical: 14, borderTopWidth: 1, borderTopColor: "#f0f0f0" },
    subjectIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center", marginRight: 14 },
    subjectEmoji: { fontSize: 20 },
    scheduleInfo: { flex: 1 },
    subjectName: { fontSize: 15, fontWeight: "600", color: "#333", marginBottom: 4 },
    scheduleTime: { fontSize: 13, color: "#888" },
    dayBadge: { backgroundColor: "#E8F5E9", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
    dayText: { fontSize: 12, color: "#27AE60", fontWeight: "600" },
    tomorrowBadge: { backgroundColor: "#FFF3E0" },
    tomorrowText: { color: "#E67E22" },
    deleteBtn: { marginLeft: 10, padding: 6, backgroundColor: "#FFEBEE", borderRadius: 10 },
    deleteBtnText: { fontSize: 13, color: "#E74C3C", fontWeight: "700" },

    sessionRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, borderTopWidth: 1, borderTopColor: "#f0f0f0" },
    sessionIcon: { fontSize: 22, marginRight: 14 },

    /* Quick Actions */
    quickActions: { marginHorizontal: 16, marginTop: 20, marginBottom: 30 },
    quickTitle: { fontSize: 17, fontWeight: "700", color: "#222", marginBottom: 14 },
    actionsRow: { flexDirection: "row", gap: 12 },
    actionCard: { flex: 1, backgroundColor: "#fff", borderRadius: 16, paddingVertical: 18, alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
    actionIcon: { fontSize: 24, marginBottom: 6 },
    actionText: { fontSize: 12, color: "#555", fontWeight: "600" },

    /* Modals */
    overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end" },
    overlayScroll: { justifyContent: "flex-end", flexGrow: 1 },
    modalBox: { backgroundColor: "#fff", borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 36 },
    modalTitle: { fontSize: 20, fontWeight: "800", color: "#222" },
    input: { borderWidth: 1.5, borderColor: "#e0e0e0", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: "#333", marginBottom: 14, backgroundColor: "#fafafa" },
    pickerLabel: { fontSize: 13, fontWeight: "700", color: "#555", marginBottom: 10 },
    dayRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
    dayOption: { flex: 1, borderWidth: 1.5, borderColor: "#ddd", borderRadius: 10, paddingVertical: 10, alignItems: "center" },
    dayOptionActive: { backgroundColor: "#007181", borderColor: "#007181" },
    dayOptionText: { fontSize: 14, color: "#555", fontWeight: "600" },
    dayOptionTextActive: { color: "#fff" },
    colorRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
    colorDot: { width: 34, height: 34, borderRadius: 17 },
    colorDotSelected: { borderWidth: 3, borderColor: "#222", transform: [{ scale: 1.15 }] },
    iconRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 18 },
    iconOption: { width: 44, height: 44, borderRadius: 12, backgroundColor: "#f0f0f0", justifyContent: "center", alignItems: "center" },
    iconOptionActive: { backgroundColor: "#007181" },
    iconOptionText: { fontSize: 22 },
    modalBtns: { flexDirection: "row", gap: 12 },
    cancelBtn: { flex: 1, borderWidth: 1.5, borderColor: "#ddd", borderRadius: 12, paddingVertical: 14, alignItems: "center" },
    cancelBtnText: { fontSize: 15, fontWeight: "700", color: "#888" },
    saveBtn: { flex: 1, backgroundColor: "#007181", borderRadius: 12, paddingVertical: 14, alignItems: "center" },
    saveBtnText: { fontSize: 15, fontWeight: "700", color: "#fff" },

    /* Stats */
    statRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
    statLabel: { fontSize: 15, color: "#555" },
    statValue: { fontSize: 18, fontWeight: "800", color: "#007181" },

    /* Goals */
    goalRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10, gap: 10 },
    checkbox: { width: 24, height: 24, borderRadius: 6, borderWidth: 2, borderColor: "#007181", justifyContent: "center", alignItems: "center" },
    checkboxDone: { backgroundColor: "#007181" },
    checkmark: { color: "#fff", fontSize: 14, fontWeight: "700" },
    goalText: { flex: 1, fontSize: 14, color: "#333" },
    goalTextDone: { color: "#aaa", textDecorationLine: "line-through" },
    goalDelete: { fontSize: 16, color: "#E74C3C", fontWeight: "700" },

    /* Modal header + close */
    modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
    closeBtn: { backgroundColor: "#f0f0f0", width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
    closeBtnText: { fontSize: 15, color: "#555", fontWeight: "700" },

    /* Session success */
    successBox: { alignItems: "center", paddingVertical: 16 },
    successIcon: { fontSize: 48, marginBottom: 12 },
    successTitle: { fontSize: 20, fontWeight: "800", color: "#222", marginBottom: 6 },
    successSub: { fontSize: 14, color: "#888", textAlign: "center" },
});
