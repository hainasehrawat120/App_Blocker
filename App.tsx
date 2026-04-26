import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import Splashscreen from "./component/splashscreen";
import LoginScreen from "./screens/LoginScreen";
import SignUpScreen from "./screens/SignUpScreen";
import ResetPasswordScreen from "./screens/ResetPasswordScreen";
import DashboardTab from "./screens/DashboardTab";
import ScheduleScreen from "./screens/ScheduleScreen";
import MemoryScreen from "./screens/MemoryScreen";
import FocusScreen from "./screens/FocusScreen";
import ScoresScreen from "./screens/ScoresScreen";

const RootStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabIcon = ({
  icon,
  label,
  focused,
}: {
  icon: string;
  label: string;
  focused: boolean;
}) => (
  <View style={[styles.iconContainer, focused && styles.iconContainerFocused]}>
    <Text style={[styles.icon, focused && styles.iconFocused]}>{icon}</Text>
    <Text numberOfLines={1} style={[styles.label, focused && styles.labelFocused]}>
      {label}
    </Text>
  </View>
);

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 76,
          paddingBottom: 10,
          paddingTop: 10,
          backgroundColor: "#fff",
          borderTopWidth: 1,
          borderTopColor: "#eef1f4",
          elevation: 14,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -5 },
          shadowOpacity: 0.1,
          shadowRadius: 14,
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: "#007181",
        tabBarInactiveTintColor: "#999",
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardTab}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={"🏠"} label="Home" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={"📅"} label="Schedule" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Memory"
        component={MemoryScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={"🧠"} label="Memory" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Focus"
        component={FocusScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={"🎯"} label="Focus" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Scores"
        component={ScoresScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={"📊"} label="Scores" focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const AuthScreens = () => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
      <AuthStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </AuthStack.Navigator>
  );
};

const App = () => {
  return (
    <NavigationContainer>
      <RootStack.Navigator
        initialRouteName="Splash"
        screenOptions={{ headerShown: false }}
      >
        <RootStack.Screen name="Splash" component={Splashscreen} />
        <RootStack.Screen name="Auth" component={AuthScreens} />
        <RootStack.Screen name="Main" component={MainTabs} />
      </RootStack.Navigator>
    </NavigationContainer>
  );
};

export default App;

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 74,
    borderRadius: 16,
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  iconContainerFocused: {
    backgroundColor: "#eaf6f7",
  },
  icon: {
    fontSize: 20,
    lineHeight: 22,
    marginBottom: 2,
    color: "#8f8f8f",
    fontWeight: "700",
    includeFontPadding: false,
  },
  iconFocused: {
    color: "#007181",
  },
  label: {
    fontSize: 12,
    color: "#8f8f8f",
    fontWeight: "600",
    textAlign: "center",
  },
  labelFocused: {
    color: "#007181",
    fontWeight: "700",
  },
});
