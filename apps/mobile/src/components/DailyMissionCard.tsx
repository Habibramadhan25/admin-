import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { THEME } from '../theme/colors';
import { MOCK_USER } from '../data/mockData';

interface DailyMissionCardProps {
  onContinueReading?: () => void;
}

export const DailyMissionCard: React.FC<DailyMissionCardProps> = ({ onContinueReading }) => {
  const [claimed, setClaimed] = useState(false);
  const defaultMission = {
    title: 'Membaca 15 Menit',
    current: 12,
    target: 15,
    unit: 'menit',
    rewardCoins: 50,
    rewardXp: 50,
  };
  const mission = MOCK_USER.dailyMission ?? defaultMission;
  const progressPct = Math.min(100, Math.round((mission.current / mission.target) * 100));

  const weekDays = [
    { day: 'Sen', completed: true },
    { day: 'Sel', completed: true },
    { day: 'Rab', completed: true },
    { day: 'Kam', completed: true },
    { day: 'Jum', completed: true },
    { day: 'Sab', completed: true },
    { day: 'Min', completed: true },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Header Row */}
        <View style={styles.headerRow}>
          <View style={styles.titleWithIcon}>
            <View style={styles.targetIconCircle}>
              <Text style={styles.targetIcon}>🎯</Text>
            </View>
            <View>
              <Text style={styles.title}>Tantangan Siswa Juara</Text>
              <Text style={styles.subtitle}>{mission.title}</Text>
            </View>
          </View>
          <View style={styles.rewardBadge}>
            <Text style={styles.rewardText}>+{mission.rewardCoins} 🪙 | +{mission.rewardXp} XP</Text>
          </View>
        </View>

        {/* Progress Bar Row */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Progres Hari Ini</Text>
            <Text style={styles.progressValue}>
              {mission.current} / {mission.target} {mission.unit} ({progressPct}%)
            </Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${progressPct}%` }]} />
          </View>
        </View>

        {/* Weekly Reading Streak Dots */}
        <View style={styles.streakSection}>
          <View style={styles.streakTitleRow}>
            <Text style={styles.streakText}>🔥 Semangat Membaca Minggu Ini:</Text>
            <Text style={styles.streakCountBadge}>7 Hari Beruntun!</Text>
          </View>
          <View style={styles.daysRow}>
            {weekDays.map((d, index) => (
              <View key={index} style={styles.dayItem}>
                <View style={[styles.dayCircle, d.completed ? styles.dayCircleActive : null]}>
                  <Text style={styles.dayCheck}>{d.completed ? '✓' : ''}</Text>
                </View>
                <Text style={styles.dayLabel}>{d.day}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[styles.actionBtn, claimed ? styles.actionBtnClaimed : null]}
            onPress={() => {
              if (progressPct >= 80 && !claimed) {
                setClaimed(true);
              } else if (onContinueReading) {
                onContinueReading();
              }
            }}
          >
            <Text style={styles.actionBtnText}>
              {claimed
                ? '🎉 Hadiah Sudah Diklaim!'
                : progressPct >= 80
                ? '🎁 Klaim +50 Koin & XP'
                : '📖 Baca 3 Menit Lagi →'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 24,
    width: '100%',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 2,
    borderColor: '#E0E7FF',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  targetIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
  },
  targetIcon: {
    fontSize: 18,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366F1',
    marginTop: 1,
  },
  rewardBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  rewardText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#059669',
  },
  progressContainer: {
    marginBottom: 14,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  progressValue: {
    fontSize: 11,
    fontWeight: '800',
    color: '#4F46E5',
  },
  track: {
    height: 10,
    backgroundColor: '#EEF2FF',
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  fill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 10,
  },
  streakSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  streakTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  streakCountBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EA580C',
    backgroundColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  dayItem: {
    alignItems: 'center',
    gap: 4,
  },
  dayCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayCircleActive: {
    backgroundColor: '#FF6B00',
  },
  dayCheck: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  actionRow: {
    alignItems: 'center',
  },
  actionBtn: {
    width: '100%',
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  actionBtnClaimed: {
    backgroundColor: '#10B981',
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});
