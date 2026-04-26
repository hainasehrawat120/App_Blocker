import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ScrollView,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ResetPasswordScreen = ({ navigation }: any) => {
    const [email, setEmail] = useState("");

    const sendResetLink = () => {
        if (!email.trim()) {
            Alert.alert("Please enter your email address");
            return;
        }
        Alert.alert(
            "Reset Link Sent",
            "Check your email for the password reset link."
        );
    };

    const insets = useSafeAreaInsets();

    return (
        <View style={styles.container}>
            <StatusBar backgroundColor="transparent" translucent barStyle="light-content" />
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : undefined}
                style={styles.keyboardView}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View style={[styles.headerSection, { paddingTop: insets.top + 60 }]}>
                        <View style={styles.logoContainer}>
                            <View style={styles.logoBox}>
                                <View style={styles.barsContainer}>
                                    <View style={[styles.bar, styles.barShort]} />
                                    <View style={[styles.bar, styles.barMedium]} />
                                    <View style={[styles.bar, styles.barTall]} />
                                    <View style={[styles.bar, styles.barMedium]} />
                                </View>
                            </View>
                        </View>
                        <Text style={styles.appName}>StudyFlow</Text>
                        <Text style={styles.welcomeText}>
                            Recover access to your account
                        </Text>
                    </View>

                    {/* White Card */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Reset Password</Text>
                        <Text style={styles.cardSubtitle}>
                            Enter your email to receive a password reset link
                        </Text>

                        {/* Email */}
                        <Text style={styles.label}>Email Address</Text>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputIcon}>✉</Text>
                            <TextInput
                                placeholder="you@example.com"
                                placeholderTextColor="#aaa"
                                style={styles.input}
                                onChangeText={setEmail}
                                value={email}
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        {/* Send Reset Link Button */}
                        <TouchableOpacity style={styles.resetButton} onPress={sendResetLink}>
                            <Text style={styles.resetButtonText}>Send Reset Link</Text>
                        </TouchableOpacity>

                        {/* Back to Login */}
                        <View style={styles.backRow}>
                            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                                <Text style={styles.backLink}>← Back to Login</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

export default ResetPasswordScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#0f9d8a" },
    keyboardView: { flex: 1 },
    scrollContent: { flexGrow: 1, alignItems: "center", paddingBottom: 30 },

    headerSection: { alignItems: "center", paddingBottom: 30 },
    logoContainer: { marginBottom: 14 },
    logoBox: {
        width: 70, height: 70, borderRadius: 18,
        backgroundColor: "rgba(255,255,255,0.2)",
        justifyContent: "center", alignItems: "center",
    },
    barsContainer: { flexDirection: "row", alignItems: "flex-end", gap: 5 },
    bar: { width: 8, backgroundColor: "#fff", borderRadius: 3 },
    barShort: { height: 16 },
    barMedium: { height: 26 },
    barTall: { height: 36 },
    appName: { fontSize: 26, fontWeight: "700", color: "#fff", marginBottom: 6 },
    welcomeText: { fontSize: 14, color: "rgba(255,255,255,0.85)" },

    card: {
        backgroundColor: "#fff", borderRadius: 22, width: "88%",
        paddingHorizontal: 24, paddingVertical: 30,
        shadowColor: "#000", shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12, shadowRadius: 16, elevation: 10,
    },
    cardTitle: {
        fontSize: 20, fontWeight: "700", color: "#222",
        textAlign: "center", marginBottom: 10,
    },
    cardSubtitle: {
        fontSize: 14, color: "#777", textAlign: "center",
        marginBottom: 24, lineHeight: 20,
    },

    label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 7 },
    inputContainer: {
        flexDirection: "row", alignItems: "center",
        borderWidth: 1.2, borderColor: "#ddd", borderRadius: 12,
        paddingHorizontal: 12, marginBottom: 24, height: 50, backgroundColor: "#fafafa",
    },
    inputIcon: { fontSize: 18, marginRight: 10, color: "#999" },
    input: { flex: 1, fontSize: 15, color: "#333", paddingVertical: 0 },

    resetButton: {
        backgroundColor: "#0f9d8a", borderRadius: 12, height: 50,
        justifyContent: "center", alignItems: "center", marginBottom: 22,
    },
    resetButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },

    backRow: { alignItems: "center" },
    backLink: { fontSize: 14, color: "#0f9d8a", fontWeight: "600" },
});
