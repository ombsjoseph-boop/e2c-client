import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { fetchHistorique, fetchMe, PublicUser, ReleveHistorique } from '../../api';

// --- Tarif : à ajuster selon le barème réel de facturation ---
const TARIF_FCFA_PAR_KWH = 79;

function formatFCFA(kwh: number) {
  const montant = Math.round(kwh * TARIF_FCFA_PAR_KWH);
  return `${montant.toLocaleString('fr-FR')} FCFA`;
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('fr-FR');
}

export default function HistoriqueGlobalScreen() {
  const router = useRouter();
  const [recherche, setRecherche] = useState('');

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

  // Tous les relevés du client, du plus récent au plus ancien
  const tousLesReleves = useMemo(() => {
    return [...historique].reverse();
  }, [historique]);

  const relevesFiltres = useMemo(() => {
    const q = recherche.trim().toLowerCase();
    if (!q) return tousLesReleves;
    return tousLesReleves.filter(
      (item) =>
        item.mois.toLowerCase().includes(q) ||
        formatDate(item.date_releve).toLowerCase().includes(q) ||
        item.consommation.toString().includes(q)
    );
  }, [recherche, tousLesReleves]);

  const totalReleves = tousLesReleves.length;
  const totalKwh = useMemo(
    () => tousLesReleves.reduce((somme, x) => somme + x.consommation, 0),
    [tousLesReleves]
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={PRIMARY_BLUE} />
        <Text style={styles.loadingText}>Chargement de votre historique...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Historique</Text>
          <Text style={styles.greetingDate}>Compteur : {client?.numero_compteur ?? '—'}</Text>
        </View>
      </View>

      {/* Résumé */}
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{totalReleves}</Text>
          <Text style={styles.statLabel}>Relevés au total</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{totalKwh.toLocaleString('fr-FR')}</Text>
          <Text style={styles.statLabel}>kWh cumulés</Text>
        </View>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchBar}>
        <Feather name="search" size={18} color="#94A3B8" />
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher par mois, date ou kWh..."
          placeholderTextColor="#64748B"
          value={recherche}
          onChangeText={setRecherche}
        />
      </View>

      {/* Liste des relevés */}
      <FlatList
        data={relevesFiltres}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="inbox" size={26} color="#64748B" />
            <Text style={styles.emptyStateText}>Aucun relevé trouvé</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.avatarContainer}>
              <Ionicons name="flash-outline" size={16} color="#FFFFFF" />
            </View>

            <View style={styles.cardInfo}>
              <Text style={styles.cardNom}>{item.mois}</Text>
              <Text style={styles.cardMeta}>
                Index : {item.indexPrecedent} ➔ {item.indexActuel} · {formatDate(item.date_releve)}
              </Text>
            </View>

            <View style={styles.cardRight}>
              <Text style={styles.cardConso}>+{item.consommation} kWh</Text>
              <Text style={styles.cardFcfa}>{formatFCFA(item.consommation)}</Text>
            </View>
          </View>
        )}
      />
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  greetingDate: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
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
    fontSize: 22,
    fontWeight: '800',
    color: PRIMARY_BLUE,
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: BORDER,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: BORDER,
  },
  avatarContainer: {
    width: 38,
    height: 38,
    borderRadius: 12,
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
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  cardRight: {
    alignItems: 'flex-end',
  },
  cardConso: {
    fontSize: 13,
    fontWeight: '700',
    color: '#34D399',
  },
  cardFcfa: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 8,
  },
  emptyStateText: {
    fontSize: 13,
    color: '#94A3B8',
  },
});