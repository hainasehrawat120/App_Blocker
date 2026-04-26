import axios from "axios";
import { NativeModules, Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DEFAULT_PORT = 3000;
const WEB_ENV_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  process.env.REACT_APP_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL;

function extractHostFromScriptUrl(scriptUrl) {
  if (!scriptUrl) {
    return null;
  }

  const match = scriptUrl.match(/^https?:\/\/([^/:]+)(?::\d+)?\//i);
  return match ? match[1] : null;
}

function getDevHost() {
  const scriptUrl = NativeModules.SourceCode?.scriptURL;
  return extractHostFromScriptUrl(scriptUrl);
}

function getFallbackHost() {
  if (Platform.OS === "android") {
    // Real Android devices should use localhost + adb reverse.
    // This also works on emulator when reverse is enabled.
    return "localhost";
  }

  return "localhost";
}

export function getApiBaseUrl() {
  if (WEB_ENV_BASE_URL) {
    return WEB_ENV_BASE_URL;
  }

  if (Platform.OS === "web") {
    return "http://localhost:3000";
  }

  const host = getDevHost() || getFallbackHost();
  return `http://${host}:${DEFAULT_PORT}`;
}

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
});

// Intercept requests to attach token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("jwt_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // Ignore
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
