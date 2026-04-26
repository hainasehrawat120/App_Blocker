import React, { useEffect, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  Animated,
  Dimensions,
  StatusBar,
} from "react-native";
import SplashScreen from "react-native-splash-screen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

const { width } = Dimensions.get("window");

const SPLASH_SHOWN_KEY = "genzfocus_splash_shown";

type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
};

type Props = NativeStackScreenProps<RootStackParamList, "Splash">;

const Splashscreen = ({ navigation }: Props) => {
  // Animation refs
  const logoScale = useRef(new Animated.Value(0.4)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(30)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const glowOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    SplashScreen.hide();
    let timer: ReturnType<typeof setTimeout>;

    const checkAndNavigate = async () => {
      try {
        const alreadyShown = await AsyncStorage.getItem(SPLASH_SHOWN_KEY);

        if (alreadyShown === "true") {
          navigation.replace("Auth");
          return;
        }

        await AsyncStorage.setItem(SPLASH_SHOWN_KEY, "true");

        Animated.sequence([
          Animated.parallel([
            Animated.spring(logoScale, {
              toValue: 1,
              tension: 60,
              friction: 7,
              useNativeDriver: true,
            }),
            Animated.timing(logoOpacity, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.timing(glowOpacity, {
              toValue: 0.5,
              duration: 700,
              useNativeDriver: true,
            }),
          ]),
          Animated.parallel([
            Animated.timing(titleOpacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
            Animated.spring(titleTranslateY, {
              toValue: 0,
              tension: 80,
              friction: 9,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(subtitleOpacity, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
        ]).start();

        timer = setTimeout(() => {
          navigation.replace("Auth");
        }, 2800);
      } catch (e) {
        navigation.replace("Auth");
      }
    };

    checkAndNavigate();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor="#0a4f5e"
        barStyle="light-content"
        translucent={false}
      />

      {/* Background gradient layers */}
      <View style={styles.bgTop} />
      <View style={styles.bgBottom} />

      {/* Glow circle behind logo */}
      <Animated.View style={[styles.glowCircle, { opacity: glowOpacity }]} />

      {/* Logo */}
      <Animated.View
        style={[
          styles.logoWrapper,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}
      >
        <Image
          source={require("../assets/images/logo.jpeg")}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>

      {/* App name */}
      <Animated.Text
        style={[
          styles.title,
          {
            opacity: titleOpacity,
            transform: [{ translateY: titleTranslateY }],
          },
        ]}
      >
        GenzFocus
      </Animated.Text>

      {/* Tagline */}
      <Animated.Text style={[styles.subtitle, { opacity: subtitleOpacity }]}>
        Focus better. Achieve more.
      </Animated.Text>

      {/* Decorative dots */}
      <View style={styles.dotsRow}>
        {[0, 1, 2].map((i) => (
          <View
            key={i}
            style={[styles.dot, i === 1 && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
};

export default Splashscreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a4f5e",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  // Layered background to simulate gradient
  bgTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "55%",
    backgroundColor: "#0f7a8a",
    borderBottomLeftRadius: 200,
    borderBottomRightRadius: 200,
  },
  bgBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "45%",
    backgroundColor: "#083a47",
  },
  // Soft glow behind logo
  glowCircle: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: "#14b8a6",
    shadowColor: "#14b8a6",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 60,
    elevation: 20,
  },
  logoWrapper: {
    width: 150,
    height: 150,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 18,
  },
  logo: {
    width: 220,
    height: 220,
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#ffffff",
    letterSpacing: 0.5,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.75)",
    letterSpacing: 0.3,
    marginBottom: 48,
  },
  dotsRow: {
    position: "absolute",
    bottom: 48,
    flexDirection: "row",
    gap: 8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  dotActive: {
    width: 22,
    backgroundColor: "#f0ca3e",
  },
});
