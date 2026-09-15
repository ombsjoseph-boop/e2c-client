import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { fetchMe, logout, PublicUser } from '../../api';

export default function ParametresScreen() {
  const router = useRouter();

  const [client, setClient] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  const chargerDonnees = useCallback(async () => {
    setLoading(true);
    try {
      const user = await fetchMe();
      if (!user) {
        router.replace('/(auth)/login');
        return;
      }
      setClient(user);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    chargerDonnees();
  }, [chargerDonnees]);

  const initiale = client?.nom?.trim()?.charAt(0)?.toUpperCase() ?? '?';

  const handleLogout = () => {
    Alert.alert('Se déconnecter', 'Voulez-vous vraiment vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Se déconnecter',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={PRIMARY_BLUE} />
        <Text style={styles.loadingText}>Chargement de votre profil...</Text>
      </SafeAreaView>
    );
  }

  // Adresse structurée reconstituée à partir des colonnes ville/quartier/ruelle
  const adresseDetails = [client?.ville, client?.quartier, client?.ruelle]
    .filter(Boolean)
    .join(', ');

  const infosCompte = [
    { icon: 'mail-outline' as const, label: 'Email', valeur: client?.email },
    { icon: 'call-outline' as const, label: 'Téléphone', valeur: client?.telephone },
  ];

  const infosBranchement = [
    { icon: 'flash-outline' as const, label: 'Numéro de compteur', valeur: client?.numero_compteur },
    { icon: 'home-outline' as const, label: 'Type de logement', valeur: client?.type_logement },
    { icon: 'location-outline' as const, label: 'Adresse', valeur: adresseDetails || client?.adresse },
    { icon: 'flag-outline' as const, label: 'Point de repère', valeur: client?.point_repere },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.brandTitle}>E2C · PARAMÈTRES</Text>
          <Text style={styles.brandSubtitle}>Mon profil</Text>
        </View>

        {/* Carte profil */}
        <View style={styles.profileCard}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>{initiale}</Text>
          </View>
          <Text style={styles.profileNom}>{client?.nom ?? '—'}</Text>
          <Text style={styles.profileEmail}>{client?.email ?? '—'}</Text>
        </View>

        {/* Informations du compte */}
        <Text style={styles.sectionTitle}>Informations du compte</Text>
        <View style={styles.cardDetail}>
          {infosCompte.map((item, index) => (
            <View key={item.label}>
              <View style={styles.detailRow}>
                <View style={styles.detailIconWrap}>
                  <Ionicons name={item.icon} size={16} color="#93C5FD" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailLabel}>{item.label}</Text>
                  <Text style={styles.detailValue}>{item.valeur || 'Non renseigné'}</Text>
                </View>
              </View>
              {index < infosCompte.length - 1 && <View style={styles.separator} />}
            </View>
          ))}
        </View>

        {/* Informations de branchement */}
        <Text style={styles.sectionTitle}>Informations de branchement</Text>
        <View style={styles.cardDetail}>
          {infosBranchement.map((item, index) => (
            <View key={item.label}>
              <View style={styles.detailRow}>
                <View style={styles.detailIconWrap}>
                  <Ionicons name={item.icon} size={16} color="#93C5FD" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailLabel}>{item.label}</Text>
                  <Text style={styles.detailValue}>{item.valeur || 'Non renseigné'}</Text>
                </View>
              </View>
              {index < infosBranchement.length - 1 && <View style={styles.separator} />}
            </View>
          ))}
        </View>

        {/* Bouton de déconnexion */}
        <TouchableOpacity style={styles.logoutButton} activeOpacity={0.85} onPress={handleLogout}>
          <Feather name="log-out" size={16} color="#F87171" />
          <Text style={styles.logoutButtonText}>Se déconnecter</Text>
        </TouchableOpacity>

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
  profileCard: {
    alignItems: 'center',
    backgroundColor: CARD_BG,
    borderRadius: 20,
    paddingVertical: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: PRIMARY_BLUE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarLargeText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  profileNom: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileEmail: {
    fontSize: 13,
    color: '#94A3B8',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 10,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardDetail: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
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
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1E293BE6',
    borderRadius: 16,
    height: 50,
    borderWidth: 1,
    borderColor: '#F8717140',
  },
  logoutButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F87171',
  },
});