import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { facilityLabel, FacilityFilter } from '../../utils/facilities';

export function FacilitySelector({ value, onChange, disabled = false, style }: {
  value: FacilityFilter; onChange: (value: FacilityFilter) => void; disabled?: boolean; style?: StyleProp<ViewStyle>;
}) {
  const options: FacilityFilter[] = [1, 2, 'unassigned'];
  const [open, setOpen] = useState(false);
  return <View style={[styles.container, style]}>
    <TouchableOpacity accessibilityRole="button"
      accessibilityLabel={`Chọn cơ sở, ${facilityLabel(value)}`}
      accessibilityState={{ expanded: open, disabled }} disabled={disabled}
      onPress={() => setOpen(!open)} style={[styles.trigger, disabled && styles.disabled]}>
      <View style={styles.copy}>
        <Text style={styles.caption}>Cơ sở ăn</Text>
        <Text style={styles.selectedLabel}>{facilityLabel(value)}</Text>
      </View>
      <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={colors.primaryDark} />
    </TouchableOpacity>
    {open && <View style={styles.menu}>{options.map(option => <TouchableOpacity key={option} accessibilityRole="button"
      accessibilityLabel={facilityLabel(option)} accessibilityState={{ selected: value === option, disabled }}
      disabled={disabled} onPress={() => { setOpen(false); onChange(option); }}
      style={[styles.option, value === option && styles.active]}>
      <Text style={[styles.label, value === option && styles.activeLabel]}>{facilityLabel(option)}</Text>
      {value === option && <Ionicons name="checkmark" size={18} color={colors.primary} />}
    </TouchableOpacity>)}</View>}
  </View>;
}

const styles = StyleSheet.create({
  container: { width: 240, maxWidth: '100%', alignSelf: 'flex-start', marginVertical: 12 },
  trigger: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  copy: { flex: 1 },
  caption: { fontSize: 11, color: colors.textSecondary, marginBottom: 2 },
  selectedLabel: { fontSize: 14, fontWeight: '700', color: colors.primaryDark },
  disabled: { opacity: 0.5 },
  menu: { marginTop: 6, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, overflow: 'hidden' },
  option: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, gap: 12 },
  active: { backgroundColor: colors.primaryLight },
  label: { fontSize: 12, fontWeight: '600', color: colors.textSecondary },
  activeLabel: { color: colors.primaryDark },
});
