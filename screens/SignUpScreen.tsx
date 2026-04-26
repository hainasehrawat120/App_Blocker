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
    Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import api from "../api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SignUpScreen = ({ navigation }: any) => {
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [agreedTerms, setAgreedTerms] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const signUp = async () => {
        const normalizedName = fullName.trim();
        const normalizedEmail = email.trim().toLowerCase();
        const normalizedPassword = password.trim();

        if (!agreedTerms) {
            Alert.alert("Please agree to the Terms & Conditions");
            return;
        }
        if (!normalizedName || !normalizedEmail || !normalizedPassword) {
            Alert.alert("Sign Up Failed", "Please fill all fields.");
            return;
        }
        if (isSubmitting) return;

        setIsSubmitting(true);
        try {
            console.log("API URL:", api.defaults.baseURL);
            console.log("Attempting register with:", { name: normalizedName, email: normalizedEmail });

            const response = await api.post("/register", {
                name: normalizedName,
                email: normalizedEmail,
                password: normalizedPassword
            });

            console.log("Register response:", response.data);

            if (response.data.token) {
                await AsyncStorage.setItem("jwt_token", response.data.token);
                await AsyncStorage.setItem("user_name", response.data.user.name);
                Alert.alert("Account Created", "Welcome " + normalizedName);
                const parentNavigation = navigation.getParent?.();
                if (parentNavigation?.reset) {
                    parentNavigation.reset({
                        index: 0,
                        routes: [{ name: "Main" }],
                    });
                } else {
                    navigation.navigate("Main");
                }
            }
        } catch (error: any) {
            console.log("Register error:", error.message);
            console.log("Error response:", JSON.stringify(error.response?.data));
            console.log("Error request:", error.request?._url);

            if (error.response) {
                Alert.alert(
                    "Registration Error",
                    error.response?.data?.message ||
                        error.response?.data?.sqlMessage ||
                        "Email might already be in use."
                );
            } else if (error.request) {
                Alert.alert("Network Error", `Could not reach: ${api.defaults.baseURL}/register`);
            } else {
                Alert.alert("Error", error.message);
            }
        } finally {
            setIsSubmitting(false);
        }
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
                    <View style={[styles.headerSection, { paddingTop: insets.top + 50 }]}>
                        <View style={styles.logoContainer}>
                            <Image
                                source={require("../assets/images/logo.jpeg")}
                                style={styles.logoImage}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={styles.appName}>GenzFocus</Text>
                        <Text style={styles.welcomeText}>
                            Create your account to get started
                        </Text>
                    </View>

                    {/* White Card */}
                    <View style={styles.card}>
                        <Text style={styles.cardTitle}>Create Your Account</Text>

                        {/* Full Name */}
                        <Text style={styles.label}>Full Name</Text>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputIcon}>👤</Text>
                            <TextInput
                                placeholder="Enter your full name"
                                placeholderTextColor="#aaa"
                                style={styles.input}
                                onChangeText={setFullName}
                                value={fullName}
                                autoCapitalize="words"
                            />
                        </View>

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

                        {/* Password */}
                        <Text style={styles.label}>Password</Text>
                        <View style={styles.inputContainer}>
                            <Text style={styles.inputIcon}>🔒</Text>
                            <TextInput
                                placeholder="Create a password"
                                placeholderTextColor="#aaa"
                                secureTextEntry={!showPassword}
                                style={styles.input}
                                onChangeText={setPassword}
                                value={password}
                            />
                            <TouchableOpacity
                                onPress={() => setShowPassword(!showPassword)}
                                style={styles.eyeButton}
                            >
                                <Text style={styles.eyeIcon}>
                                    {showPassword ? "👁" : "👁‍🗨"}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Terms */}
                        <TouchableOpacity
                            style={styles.termsRow}
                            onPress={() => setAgreedTerms(!agreedTerms)}
                        >
                            <View
                                style={[
                                    styles.checkbox,
                                    agreedTerms && styles.checkboxChecked,
                                ]}
                            >
                                {agreedTerms && <Text style={styles.checkmark}>✓</Text>}
                            </View>
                            <Text style={styles.termsText}>
                                I agree to the{" "}
                                <Text style={styles.termsLink}>Terms & Conditions</Text> and{" "}
                                <Text style={styles.termsLink}>Privacy Policy</Text>
                            </Text>
                        </TouchableOpacity>

                        {/* Create Account Button */}
                        <TouchableOpacity style={styles.createButton} onPress={signUp}>
                            <Text style={styles.createButtonText}>Create Account</Text>
                        </TouchableOpacity>

                        {/* Divider */}
                        <View style={styles.dividerRow}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>Or continue with</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        {/* Social */}
                        <View style={styles.socialRow}>
                            <TouchableOpacity style={styles.socialButton}>
                                <Text style={styles.socialIcon}>G</Text>
                                <Text style={styles.socialText}>Google</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.socialButton}>
                                <Text style={[styles.socialIcon, styles.fbIcon]}>f</Text>
                                <Text style={styles.socialText}>Facebook</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Login Link */}
                        <View style={styles.loginRow}>
                            <Text style={styles.loginText}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                                <Text style={styles.loginLink}>Login</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
};

export default SignUpScreen;

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#007181" },
    keyboardView: { flex: 1 },
    scrollContent: { flexGrow: 1, alignItems: "center", paddingBottom: 30 },

    headerSection: { alignItems: "center", paddingBottom: 20 },
    logoContainer: { marginBottom: 14 },
    logoImage: {
        width: 150,
        height: 150,
    },
    appName: { fontSize: 28, fontWeight: "800", color: "#fff", marginBottom: 6, letterSpacing: 0.5 },
    welcomeText: { fontSize: 14, color: "rgba(255,255,255,0.85)" },

    card: {
        backgroundColor: "#fff", borderRadius: 22, width: "88%",
        paddingHorizontal: 24, paddingVertical: 28,
        shadowColor: "#000", shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12, shadowRadius: 16, elevation: 10,
    },
    cardTitle: {
        fontSize: 20, fontWeight: "700", color: "#222",
        textAlign: "center", marginBottom: 20,
    },

    label: { fontSize: 14, fontWeight: "600", color: "#333", marginBottom: 7 },
    inputContainer: {
        flexDirection: "row", alignItems: "center",
        borderWidth: 1.2, borderColor: "#ddd", borderRadius: 12,
        paddingHorizontal: 12, marginBottom: 16, height: 50, backgroundColor: "#fafafa",
    },
    inputIcon: { fontSize: 18, marginRight: 10, color: "#999" },
    input: { flex: 1, fontSize: 15, color: "#333", paddingVertical: 0 },
    eyeButton: { padding: 6 },
    eyeIcon: { fontSize: 18, color: "#999" },

    termsRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 22 },
    checkbox: {
        width: 20, height: 20, borderWidth: 1.5, borderColor: "#ccc",
        borderRadius: 4, marginRight: 10, marginTop: 2,
        justifyContent: "center", alignItems: "center",
    },
    checkboxChecked: { backgroundColor: "#008b9e", borderColor: "#008b9e" },
    checkmark: { color: "#fff", fontSize: 13, fontWeight: "700" },
    termsText: { flex: 1, fontSize: 13, color: "#555", lineHeight: 19 },
    termsLink: { color: "#008b9e", fontWeight: "600" },

    createButton: {
        backgroundColor: "#008b9e", borderRadius: 12, height: 50,
        justifyContent: "center", alignItems: "center", marginBottom: 22,
    },
    createButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },

    dividerRow: { flexDirection: "row", alignItems: "center", marginBottom: 18 },
    dividerLine: { flex: 1, height: 1, backgroundColor: "#ddd" },
    dividerText: { marginHorizontal: 12, fontSize: 13, color: "#999" },

    socialRow: {
        flexDirection: "row", justifyContent: "space-between", gap: 12, marginBottom: 22,
    },
    socialButton: {
        flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
        borderWidth: 1.2, borderColor: "#ddd", borderRadius: 12,
        height: 46, backgroundColor: "#fff",
    },
    socialIcon: { fontSize: 18, fontWeight: "700", color: "#DB4437", marginRight: 8 },
    fbIcon: { color: "#4267B2" },
    socialText: { fontSize: 14, fontWeight: "600", color: "#555" },

    loginRow: { flexDirection: "row", justifyContent: "center" },
    loginText: { fontSize: 13, color: "#777" },
    loginLink: { fontSize: 13, color: "#008b9e", fontWeight: "700" },
});
