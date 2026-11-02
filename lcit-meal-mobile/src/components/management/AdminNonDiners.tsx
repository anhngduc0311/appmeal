import React, { useRef, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../providers/AuthProvider';
import { mealService } from '../../services/mealService';
import type { MealRegistration } from '../../types';
import { colors } from '../../theme/colors';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { ModalBackdrop } from '../common/ModalBackdrop';
import { ModalCard } from '../common/ModalCard';
import { ResultBanner } from '../common/ResultBanner';

type Props = { records: MealRegistration[]; disabled: boolean; facility: string; date: string };

export function AdminNonDiners({ records, disabled, facility, date }: Props) {
  const { role, user, isMockMode } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const savingRef = useRef(false);
  const [notice, setNotice] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);
  if (role !== 'admin') return null;

  const candidates = records.filter(record =>
    ['confirmed', 'pending'].includes(record.status) && record.userId !== user?.id);
  const name = (record: MealRegistration) => record.user?.fullName || record.userName || `Cán bộ #${record.userId}`;
  const visible = candidates.filter(record => name(record).toLocaleLowerCase('vi').includes(search.trim().toLocaleLowerCase('vi')));
  const chosen = candidates.filter(record => selected.includes(record.id));
  const slots = chosen.reduce((total, record) => total + 1 + Number(record.guestCount || 0), 0);
  const close = () => { if (!savingRef.current) setOpen(false); };
  const save = async () => {
    if (savingRef.current || !chosen.length) return;
    savingRef.current = true;
    setSaving(true);
    setNotice(null);
    const failed: number[] = [];
    let removed = 0;
    let failure = '';
    try {
      for (const record of chosen) {
        try {
          const result = await mealService.cancelRegistrationOnBehalf(record.id, isMockMode);
          if (result.status !== 'cancelled') throw new Error('Suất ăn chưa được cắt, vui lòng tải lại danh sách.');
          removed += 1;
        } catch (error) {
          failed.push(record.id);
          failure ||= error instanceof Error ? error.message : 'Vui lòng thử lại.';
        }
      }
      setSelected(failed);
      setNotice({ variant: failed.length ? 'error' : 'success', message:
        failed.length ? `Đã cắt ${removed}/${chosen.length} người. ${failed.length} người chưa cắt được: ${failure}` : `Đã cắt suất của ${removed} người không ăn hôm nay.` });
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['management', 'registrations'] }),
        queryClient.invalidateQueries({ queryKey: ['registrations'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['meals'] }),
      ]);
      if (!failed.length) setOpen(false);
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return <View style={styles.wrapper}>
    {notice && !open && <ResultBanner {...notice} onDismiss={() => setNotice(null)} />}
    <Button title="Chọn người không ăn" variant="outline" disabled={disabled}
      leftIcon={<Ionicons name="checkbox-outline" size={20} color={colors.primary} />}
      onPress={() => { setSelected([]); setSearch(''); setNotice(null); setOpen(true); }} />
    <Modal visible={open} transparent animationType="slide" onRequestClose={close}>
      <ModalBackdrop style={styles.backdrop}>
        <ModalCard style={styles.dialog}>
          <Text style={styles.title}>Chọn người không ăn hôm nay</Text>
          <Text style={styles.detail}>{facility} · {date}</Text>
          <Text style={styles.detail}>Tích những người không ăn rồi nhấn lưu. Suất của khách đi kèm cũng sẽ được cắt. Suất đã hoàn thành không thể cắt.</Text>
          {notice && <ResultBanner {...notice} />}
          <Input value={search} onChangeText={setSearch} placeholder="Tìm tên cán bộ" accessibilityLabel="Tìm người không ăn" editable={!saving} />
          {visible.length === 0 && <Text style={styles.detail}>Không có suất ăn phù hợp để cắt.</Text>}
          {visible.map(record => {
            const checked = selected.includes(record.id);
            return <TouchableOpacity key={record.id} accessibilityRole="checkbox" accessibilityState={{ checked, disabled: saving }}
              accessibilityLabel={`${name(record)} không ăn`} disabled={saving} style={[styles.person, checked && styles.selected]}
              onPress={() => setSelected(ids => checked ? ids.filter(id => id !== record.id) : [...ids, record.id])}>
              <Ionicons name={checked ? 'checkbox' : 'square-outline'} size={24} color={colors.primary} />
              <View style={styles.copy}><Text style={styles.name}>{name(record)}</Text>
                <Text style={styles.detail}>{record.guestCount ? `1 suất cán bộ + ${record.guestCount} suất khách` : '1 suất cán bộ'}{record.status === 'pending' ? ' · Chờ duyệt cắt' : ''}</Text></View>
            </TouchableOpacity>;
          })}
          <Text style={styles.detail}>Đã chọn {chosen.length} người · Cắt {slots} suất</Text>
          <View style={styles.actions}>
            <Button title="Đóng" variant="secondary" disabled={saving} onPress={close} style={styles.half} />
            <Button title={`Lưu (${chosen.length})`} loading={saving} disabled={!chosen.length} onPress={() => { void save(); }} style={styles.half} />
          </View>
        </ModalCard>
      </ModalBackdrop>
    </Modal>
  </View>;
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16, gap: 8 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  dialog: { width: '100%', maxWidth: 560, backgroundColor: colors.surface, borderRadius: 20, padding: 20, gap: 12 },
  title: { fontSize: 19, fontWeight: '700', color: colors.text },
  detail: { fontSize: 13, lineHeight: 20, color: colors.textSecondary },
  person: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, minHeight: 56, borderWidth: 1, borderColor: colors.border, borderRadius: 12 },
  selected: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  copy: { flex: 1 }, name: { color: colors.text, fontSize: 14, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 12 }, half: { flex: 1 },
});
