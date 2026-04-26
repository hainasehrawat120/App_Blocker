import React from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
} from "react-native";

export default function Dashbord() {

  const registerUser = async () => {
    try {
      const response = await fetch("http://10.0.2.2:3000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "Test",
          email: "test@gmail.com",
          password: "123",
        }),
      });

      const data = await response.json();
      console.log(data);
      Alert.alert("Success", JSON.stringify(data));
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Backend not connected");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>

      <Button title="Register User" onPress={registerUser} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
  },
});
