/**
 * @file index.tsx
 * @description Default home route for the application.
 * @author {{AUTHOR}}
 * @license MIT
 */

import { StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AppScreen } from "@/components/AppScreen";
import { colors, onboardingFonts, spacing } from "@/constants/theme";

export default function HomeScreen() {
  return (
    <AppScreen
      eyebrow="Welcome"
      title="{{DISPLAY_NAME}}"
      supporting="This template is ready. Build something that matters."
    >
      <Text style={styles.placeholder}>Your content goes here.</Text>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    color: colors.inkMuted,
    fontFamily: onboardingFonts.bodyRegular,
    fontSize: 15,
    lineHeight: 22,
  },
});