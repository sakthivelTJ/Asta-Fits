import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme/colors';

export const SystemWindow = ({ title, subtitle, icon = 'flash', color = COLORS.primary, children }) => {
  return (
    <View style={[styles.container, { borderColor: `${color}60` }]}>
      <View style={styles.headerRow}>
        <View style={[styles.iconBox, { backgroundColor: `${color}20` }]}>
          <Ionicons name={icon} size={18} color={color} />
        </View>

        <View style={styles.headerTextGroup}>
          <Text style={styles.systemTag}>[ SYSTEM MESSAGE ]</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
      </View>

      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

      {children ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.panel,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerTextGroup: {
    flex: 1,
  },
  systemTag: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.primary,
    letterSpacing: 1.5,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 1,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.muted,
    marginTop: 8,
    lineHeight: 18,
  },
  body: {
    marginTop: 12,
  },
});
