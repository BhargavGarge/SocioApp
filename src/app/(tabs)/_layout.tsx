import React from "react";
import { Tabs } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import NotificationProvider from "../../providers/NotificationProvider";
import { FeedProvider } from "../../../FeedContext";
export default function TabsLayout() {
  return (
    <FeedProvider>
      <NotificationProvider>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: "black",
            tabBarShowLabel: false,
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              headerTitle: "For you",
              tabBarIcon: ({ color }) => (
                <FontAwesome name="home" size={30} color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="new"
            options={{
              headerTitle: "Create post",
              tabBarIcon: ({ color }) => (
                <FontAwesome name="plus-square-o" size={30} color={color} />
              ),
            }}
          />

          <Tabs.Screen
            name="profile"
            options={{
              headerTitle: "Profile",
              tabBarIcon: ({ color }) => (
                <FontAwesome name="user" size={30} color={color} />
              ),
            }}
          />
        </Tabs>
      </NotificationProvider>
    </FeedProvider>
  );
}
