import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

import { fetchHistorique, fetchMe, logout, PublicUser, ReleveHistorique } from '../../api';

// Remplacez par le chemin correct de votre image dans les assets
const BACKGROUND_IMAGE = require('@/assets/images/background.png');

// --- Tarif : à ajuster selon le barème réel de facturation ---
const TARIF_FCFA_PAR_KWH = 79;

function formatFCFA(kwh: number) {
  const montant = Math.round(kwh * TARIF_FCFA_PAR_KWH);
  return `${montant.toLocaleString('fr-FR')} FCFA`;
}

function formatFCFACompact(kwh: number) {
  const montant = Math.round(kwh * TARIF_FCFA_PAR_KWH);
  if (montant >= 1000) return `${Math.round(montant / 100) / 10}k FCFA`;
  return `${montant} FCFA`;
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

const CHART_WIDTH = 300;
const CHART_HEIGHT = 100;

export default function HomeScreen() {
  const router = useRouter();

  // Client connecté + historique de consommation, chargés depuis l'API
  // (remplace les anciennes données statiques CLIENT_ACTUEL / HISTORIQUE_CONSO_CLIENT)
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

  // Première lettre du nom du client, affichée dans l'avatar à côté du logo
  const initiale = client?.nom?.trim()?.charAt(0)?.toUpperCase() ?? '?';

  const handleAvatarPress = () => {
    Alert.alert(
      client?.nom || 'Mon compte',
      client?.email || undefined,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  // Données dérivées de l'historique du client connecté
  const dernierReleve = historique[historique.length - 1];
  const avantDernierReleve = historique[historique.length - 2];

  const kwhCeMois = dernierReleve?.consommation ?? 0;
  const precedentKwh = avantDernierReleve?.consommation ?? kwhCeMois;

  // Calcul de la tendance en pourcentage par rapport au relevé précédent
  const tendancePct = useMemo(() => {
    if (precedentKwh === 0) return 0;
    return Math.round(((kwhCeMois - precedentKwh) / precedentKwh) * 100);
  }, [kwhCeMois, precedentKwh]);

  const trendData = useMemo(() => {
    return historique.slice(-7).map((r) => r.consommation);
  }, [historique]);

  const derniersReleves = useMemo(() => {
    return [...historique].reverse().slice(0, 3);
  }, [historique]);

  if (loading) {
    return (
      <ImageBackground source={BACKGROUND_IMAGE} style={styles.backgroundImage} resizeMode="cover">
        <SafeAreaView style={[styles.container, styles.loadingContainer]}>
          <ActivityIndicator size="large" color="#0066FF" />
          <Text style={styles.loadingText}>Chargement de vos données...</Text>
        </SafeAreaView>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={BACKGROUND_IMAGE} style={styles.backgroundImage} resizeMode="cover">
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* En-tête */}
          <View style={styles.header}>
            <Image
              source={require('../../assets/images/E2C1.png')}
              style={styles.logo}
            />
            <View style={styles.headerRight}>
              <TouchableOpacity style={styles.avatarButton} onPress={handleAvatarPress}>
                <Text style={styles.avatarButtonText}>{initiale}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.bellButton}>
                <Feather name="bell" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          

          {/* Hero : consommation du mois */}
          <View style={styles.heroRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroValue}>
                {kwhCeMois.toLocaleString('fr-FR')} <Text style={styles.heroUnit}>kWh</Text>
              </Text>
              <Text style={styles.heroLabel}>Consommation du mois en cours</Text>
              <Text style={styles.heroFcfa}>≈ {formatFCFA(kwhCeMois)}</Text>
            </View>
            <View style={styles.heroIconWrap}>
              <Feather name="zap" size={26} color="#FFFFFF" />
            </View>
          </View>

          {/* Carte graphique + pills */}
          <View style={styles.chartCard}>
            <View style={styles.chartHeaderRow}>
              <View>
                <Text style={styles.chartSmallLabel}>Compteur N°</Text>
                <Text style={styles.chartBigValue}>
                  {client?.numero_compteur ?? '—'}
                </Text>
              </View>
              <TouchableOpacity style={styles.periodPill}>
                <Text style={styles.periodPillText}>{client?.type_logement ?? '—'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.chartWrap}>
              <MiniLineChart data={trendData} width={CHART_WIDTH} height={CHART_HEIGHT} />
            </View>

            <View style={styles.pillsRow}>
              <View style={[styles.pill, styles.pillPrimary]}>
                <Text style={styles.pillLabelPrimary}>Index Actuel</Text>
                <Text style={styles.pillValuePrimary}>{dernierReleve?.indexActuel ?? 0}</Text>
              </View>
              <View style={styles.pill}>
                <Text style={styles.pillLabel}>Index Précédent</Text>
                <Text style={styles.pillValue}>{dernierReleve?.indexPrecedent ?? 0}</Text>
              </View>
              <View style={styles.pill}>
                <Text style={styles.pillLabel}>Montant Estimé</Text>
                <Text style={styles.pillValue}>{formatFCFACompact(kwhCeMois)}</Text>
              </View>
            </View>

            <View style={styles.trendFooter}>
              <Feather
                name={tendancePct >= 0 ? 'arrow-up-right' : 'arrow-down-right'}
                size={14}
                color={tendancePct >= 0 ? '#34D399' : '#F87171'}
              />
              <Text style={[styles.trendFooterText, { color: tendancePct >= 0 ? '#34D399' : '#F87171' }]}>
                {tendancePct >= 0 ? '+' : ''}
                {tendancePct}%
              </Text>
              <Text style={styles.trendFooterLabel}>vs mois précédent</Text>
            </View>
          </View>

          {/* Action principale */}
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={() => router.push('/(tabs)/historique')}>
            <Text style={styles.primaryButtonText}>Voir mon historique détaillé</Text>
            <Feather name="arrow-right" size={16} color="#FFFFFF" />
          </TouchableOpacity>

          {/* Derniers relevés du client */}
          <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Mes derniers relevés</Text>
          {derniersReleves.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="inbox" size={22} color="#94A3B8" />
              <Text style={styles.emptyStateText}>Aucun relevé pour l'instant</Text>
            </View>
          ) : (
            derniersReleves.map((releve, index) => (
              <View
                key={index}
                style={styles.releveRow}>
                <View style={styles.avatarContainer}>
                  <Ionicons name="flash-outline" size={16} color="#FFFFFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.releveNom}>{releve.mois}</Text>
                  <Text style={styles.releveDate}>Index : {releve.indexPrecedent} ➔ {releve.indexActuel}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.releveConso}>{releve.consommation} kWh</Text>
                  <Text style={styles.releveFcfa}>{formatFCFA(releve.consommation)}</Text>
                </View>
              </View>
            ))
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const PRIMARY_BLUE = '#0066FF';
const LIGHT_BLUE_BG = '#1E293B';
const BORDER_COLOR = '#334155';

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.90)', // Fond bleu nuit profond et élégant
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
    paddingTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    paddingTop: 30,
    paddingBottom: 22,
  },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: PRIMARY_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  bellButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: LIGHT_BLUE_BG,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0',
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  heroValue: {
    fontSize: 34,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroUnit: {
    fontSize: 16,
    fontWeight: '700',
    color: PRIMARY_BLUE,
  },
  heroLabel: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
  },
  heroFcfa: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E2E8F0',
    marginTop: 6,
  },
  heroIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: PRIMARY_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: PRIMARY_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  chartCard: {
    backgroundColor: '#1E293BE6',
    borderRadius: 24,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
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
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  periodPill: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  periodPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#93C5FD',
  },
  chartWrap: {
    alignItems: 'center',
    marginVertical: 8,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  pill: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  pillPrimary: {
    backgroundColor: PRIMARY_BLUE,
    borderColor: PRIMARY_BLUE,
  },
  pillLabel: {
    fontSize: 10,
    color: '#94A3B8',
    marginBottom: 4,
  },
  pillLabelPrimary: {
    fontSize: 10,
    color: '#E0F2FE',
    marginBottom: 4,
    fontWeight: '600',
  },
  pillValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pillValuePrimary: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  trendFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
  },
  trendFooterText: {
    fontSize: 12,
    fontWeight: '700',
  },
  trendFooterLabel: {
    fontSize: 11,
    color: '#94A3B8',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: PRIMARY_BLUE,
    borderRadius: 20,
    height: 50,
    marginBottom: 26,
    shadowColor: PRIMARY_BLUE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  releveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1E293BE6',
    padding: 14,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: BORDER_COLOR,
  },
  avatarContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: PRIMARY_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  releveNom: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  releveDate: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  releveConso: {
    fontSize: 13,
    fontWeight: '700',
    color: '#34D399',
  },
  releveFcfa: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyStateText: {
    fontSize: 12,
    color: '#94A3B8',
  },
});