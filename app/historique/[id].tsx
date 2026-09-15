import { Feather, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import {
    FlatList,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { getAbonneById, getRelevesByAbonneId } from '@/data/abonnes';

export default function HistoriqueReleveScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const abonne = getAbonneById(id);
  const releves = useMemo(() => getRelevesByAbonneId(id), [id]);

  const { totalConsomme, moyenneMensuelle } = useMemo(() => {
    if (releves.length === 0) return { totalConsomme: 0, moyenneMensuelle: 0 };
    const total = releves.reduce((somme, r) => somme + r.consommation, 0);
    return {
      totalConsomme: total,
      moyenneMensuelle: Math.round(total / releves.length),
    };
  }, [releves]);

  if (!abonne) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Feather name="alert-circle" size={28} color="#94A3B8" />
          <Text style={styles.notFoundText}>Abonné introuvable</Text>
          <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
            <Text style={styles.backLinkText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={22} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Historique</Text>
        <View style={{ width: 22 }} />
      </View>

      <FlatList
        data={releves}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            {/* Fiche abonné */}
            <View style={styles.abonneCard}>
              <View style={styles.avatarContainer}>
                <Ionicons name="person" size={20} color="#FFFFFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.abonneNom}>{abonne.nom}</Text>
                <Text style={styles.abonneMeta}>{abonne.numeroCompteur}</Text>
              </View>
            </View>

            {/* Statistiques */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>{releves.length}</Text>
                <Text style={styles.statLabel}>Relevés</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>
                  {totalConsomme.toLocaleString('fr-FR')}
                </Text>
                <Text style={styles.statLabel}>Total kWh</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statValue}>
                  {moyenneMensuelle.toLocaleString('fr-FR')}
                </Text>
                <Text style={styles.statLabel}>Moy. kWh</Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Relevés récents</Text>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="clock" size={28} color="#CBD5E1" />
            <Text style={styles.emptyStateText}>Aucun relevé enregistré pour le moment</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <View style={styles.timelineRow}>
            <View style={styles.timelineMarkerColumn}>
              <View style={[styles.timelineDot, index === 0 && styles.timelineDotLatest]} />
              {index < releves.length - 1 && <View style={styles.timelineLine} />}
            </View>

            <View style={styles.releveCard}>
              <View style={styles.releveCardTop}>
                <Text style={styles.releveDate}>{item.date}</Text>
                {index === 0 && (
                  <View style={styles.badgeRecent}>
                    <Text style={styles.badgeRecentText}>Dernier</Text>
                  </View>
                )}
              </View>
              <View style={styles.releveCardBottom}>
                <View>
                  <Text style={styles.releveLabel}>Index relevé</Text>
                  <Text style={styles.releveIndex}>
                    {item.index.toLocaleString('fr-FR')} kWh
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.releveLabel}>Consommation</Text>
                  <Text style={styles.releveConso}>
                    +{item.consommation.toLocaleString('fr-FR')} kWh
                  </Text>
                </View>
              </View>
              {item.remarque && (
                <Text style={styles.releveRemarque}>{item.remarque}</Text>
              )}
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  abonneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  abonneNom: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  abonneMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  statLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 10,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 12,
  },
  timelineMarkerColumn: {
    alignItems: 'center',
    width: 14,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#CBD5E1',
    marginTop: 6,
  },
  timelineDotLatest: {
    backgroundColor: '#2563EB',
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#E2E8F0',
    marginTop: 2,
  },
  releveCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  releveCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  releveDate: {
    fontSize: 12,
    color: '#94A3B8',
  },
  badgeRecent: {
    backgroundColor: '#DBEAFE',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeRecentText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
  },
  releveCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  releveLabel: {
    fontSize: 11,
    color: '#94A3B8',
  },
  releveIndex: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  releveConso: {
    fontSize: 15,
    fontWeight: '700',
    color: '#16A34A',
    marginTop: 2,
  },
  releveRemarque: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 8,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  notFoundText: {
    fontSize: 14,
    color: '#94A3B8',
  },
  backLink: {
    marginTop: 8,
  },
  backLinkText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563EB',
  },
});