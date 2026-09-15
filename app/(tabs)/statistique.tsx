import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { fetchHistorique, fetchMe, PublicUser, ReleveHistorique } from '../../api';

// --- Tarif : à ajuster selon le barème réel de facturation ---
const TARIF_FCFA_PAR_KWH = 79;

function formatFCFA(kwh: number) {
  const montant = Math.round(kwh * TARIF_FCFA_PAR_KWH);
  return `${montant.toLocaleString('fr-FR')} FCFA`;
}

// --- Mini graphique de tendance (ligne + zone) ---
function MiniLineChart({
  data,
  width,
  height,
  color = '#0066FF',
}: {
  data: number[];
  width: number;
  height: number;
  color?: string;
}) {
  const points = useMemo(() => {
    if (data.length < 2) return [];
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const stepX = width / (data.length - 1);
    const padY = 10;
    return data.map((v, i) => ({
      x: i * stepX,
      y: padY + (1 - (v - min) / range) * (height - padY * 2),
    }));
  }, [data, width, height]);

  if (points.length < 2) {
    return (
      <View style={{ width, height, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#94A3B8', fontSize: 11 }}>Pas encore de données</Text>
      </View>
    );
  }

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;
  const last = points[points.length - 1];

  return (
    <Svg width={width} height={height}>
      <Defs>
        <LinearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity={0.4} />
          <Stop offset="1" stopColor={color} stopOpacity={0.0} />
        </LinearGradient>
      </Defs>
      <Path d={areaPath} fill="url(#chartFill)" stroke="none" />
      <Path d={linePath} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={last.x} cy={last.y} r={4} fill={color} />
      <Circle cx={last.x} cy={last.y} r={7} fill={color} fillOpacity={0.25} />
    </Svg>
  );
}

const CHART_WIDTH = 310;
const CHART_HEIGHT = 120;

export default function ClientStatsScreen() {
  const router = useRouter();

  // Client connecté + historique de consommation, chargés depuis l'API
  const [client, setClient] = useState<PublicUser | null>(null);
  const [historique, setHistorique] = useState<ReleveHistorique[]>([]);
  const [loading, setLoading] = useState(true);

  const chargerDonnees = useCallback(async () => {
    setLoading(true);
    try {
      const user = await fetchMe();
      if (!user) {
        // Pas de session valide -> retour à l'écran de connexion
        router.replace('/(auth)/login');
        return;
      }
      setClient(user);

      const hist = await fetchHistorique();
      setHistorique(hist);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    chargerDonnees();
  }, [chargerDonnees]);

  // Calculs statistiques basés sur l'historique réel du client
  const totalReleves = historique.length;

  const { totalKwh, moyenneKwh, maxKwh, minKwh } = useMemo(() => {
    if (totalReleves === 0) return { totalKwh: 0, moyenneKwh: 0, maxKwh: 0, minKwh: 0 };

    let sum = 0;
    let max = -Infinity;
    let min = Infinity;

    historique.forEach((item) => {
      sum += item.consommation;
      if (item.consommation > max) max = item.consommation;
      if (item.consommation < min) min = item.consommation;
    });

    return {
      totalKwh: sum,
      moyenneKwh: Math.round(sum / totalReleves),
      maxKwh: max,
      minKwh: min,
    };
  }, [historique, totalReleves]);

  const dernierReleve = historique[historique.length - 1];

  // Données de consommation pour le graphe
  const trendData = useMemo(() => {
    return historique.map((r) => r.consommation);
  }, [historique]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={PRIMARY_BLUE} />
        <Text style={styles.loadingText}>Chargement de vos statistiques...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.brandTitle}>E2C · STATISTIQUES</Text>
          <Text style={styles.brandSubtitle}>Bilan de consommation</Text>
        </View>

        {/* Informations du compteur */}
        <View style={styles.infoCard}>
          <View style={styles.avatarContainer}>
            <Ionicons name="flash" size={18} color="#FFFFFF" />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardNom}>{client?.nom ?? '—'}</Text>
            <Text style={styles.cardMeta}>Compteur : {client?.numero_compteur ?? '—'}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{client?.type_logement ?? '—'}</Text>
          </View>
        </View>

        {/* --- Section Graphique d'Énergie --- */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeaderRow}>
            <View>
              <Text style={styles.chartSmallLabel}>Évolution de l'énergie</Text>
              <Text style={styles.chartBigValue}>
                {dernierReleve?.consommation ?? 0} <Text style={styles.chartBigValueUnit}>kWh (dernier mois)</Text>
              </Text>
            </View>
          </View>

          <View style={styles.chartWrap}>
            <MiniLineChart data={trendData} width={CHART_WIDTH} height={CHART_HEIGHT} />
          </View>

          <View style={styles.chartLegendRow}>
            <Text style={styles.chartLegendText}>Historique global des relevés (kWh)</Text>
          </View>
        </View>

        {/* Résumé rapide (Grille de stats) */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{totalKwh.toLocaleString('fr-FR')} kWh</Text>
            <Text style={styles.statLabel}>Consommation Totale</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{formatFCFA(totalKwh)}</Text>
            <Text style={styles.statLabel}>Montant cumulé estimé</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{moyenneKwh} kWh</Text>
            <Text style={styles.statLabel}>Moyenne mensuelle</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{totalReleves}</Text>
            <Text style={styles.statLabel}>Relevés enregistrés</Text>
          </View>
        </View>

        {/* Section Records / Extrêmes */}
        <Text style={styles.sectionTitle}>Analyse comparative</Text>

        <View style={styles.cardDetail}>
          <View style={styles.detailRow}>
            <View style={styles.detailIconWrap}>
              <Feather name="arrow-up-right" size={16} color="#34D399" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.detailLabel}>Mois le plus haut</Text>
              <Text style={styles.detailValue}>{totalReleves > 0 ? maxKwh : 0} kWh</Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.detailRow}>
            <View style={styles.detailIconWrap}>
              <Feather name="arrow-down-right" size={16} color="#F87171" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.detailLabel}>Mois le plus bas</Text>
              <Text style={styles.detailValue}>{totalReleves > 0 ? minKwh : 0} kWh</Text>
            </View>
          </View>

          <View style={styles.separator} />

          <View style={styles.detailRow}>
            <View style={styles.detailIconWrap}>
              <Feather name="activity" size={16} color="#60A5FA" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.detailLabel}>Dernier index relevé</Text>
              <Text style={styles.detailValue}>{dernierReleve ? dernierReleve.indexActuel : 0} kWh</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const PRIMARY_BLUE = '#0066FF';
const BG = '#0F172A';
const CARD_BG = '#1E293BE6';
const BORDER = '#334155';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#94A3B8',
    fontSize: 13,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    marginBottom: 16,
  },
  brandTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: PRIMARY_BLUE,
    letterSpacing: 1.5,
  },
  brandSubtitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 2,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: PRIMARY_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  cardNom: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardMeta: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  badge: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#93C5FD',
  },
  chartCard: {
    backgroundColor: CARD_BG,
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  chartHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  chartSmallLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginBottom: 4,
  },
  chartBigValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  chartBigValueUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  chartWrap: {
    alignItems: 'center',
    marginVertical: 10,
  },
  chartLegendRow: {
    alignItems: 'center',
    marginTop: 4,
  },
  chartLegendText: {
    fontSize: 11,
    color: '#64748B',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: PRIMARY_BLUE,
  },
  statLabel: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 12,
  },
  cardDetail: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 4,
  },
  detailIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BORDER,
  },
  detailLabel: {
    fontSize: 12,
    color: '#94A3B8',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginTop: 1,
  },
  separator: {
    height: 1,
    backgroundColor: BORDER,
    marginVertical: 12,
  },
});