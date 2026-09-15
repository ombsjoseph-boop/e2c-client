import { Feather, Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

import { getAbonneById, enregistrerReleve as sauvegarderReleve } from '@/data/abonnes';

export default function SaisieReleveScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const abonne = getAbonneById(id);

  const [nouvelIndex, setNouvelIndex] = useState('');
  const [remarque, setRemarque] = useState('');
  const [releveEnregistre, setReleveEnregistre] = useState(false);

  const nouvelIndexNombre = Number(nouvelIndex.replace(',', '.'));
  const indexValide =
    nouvelIndex.trim().length > 0 &&
    !Number.isNaN(nouvelIndexNombre) &&
    abonne !== undefined &&
    nouvelIndexNombre >= abonne.dernierIndex;

  const consommation = useMemo(() => {
    if (!abonne || !indexValide) return null;
    return nouvelIndexNombre - abonne.dernierIndex;
  }, [abonne, indexValide, nouvelIndexNombre]);

  if (!abonne) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFound}>
          <Feather name="alert-circle" size={28} color="#94A3B8" />
          <Text style={styles.notFoundText}>Abonné introuvable</Text>
          <TouchableOpacity style={styles.backLink} onPress={() => router.back()}>
            <Text style={styles.backLinkText}>Retour à la liste</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const enregistrerReleve = () => {
    if (!indexValide || consommation === null) return;

    const releve = sauvegarderReleve(abonne.id, nouvelIndexNombre, remarque || undefined);
    if (!releve) return;

    setReleveEnregistre(true);
    Alert.alert(
      'Relevé enregistré',
      `${consommation.toLocaleString('fr-FR')} kWh consommés par ${abonne.nom}.`,
      [{ text: 'OK', onPress: () => router.back() }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* En-tête */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={22} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nouveau relevé</Text>
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/historique/[id]', params: { id: abonne.id } })}
            style={styles.backButton}>
            <Feather name="clock" size={20} color="#0F172A" />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {/* Carte info abonné */}
          <View style={styles.abonneCard}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person" size={20} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.abonneNom}>{abonne.nom}</Text>
              <Text style={styles.abonneMeta}>{abonne.numeroCompteur}</Text>
              <Text style={styles.abonneMeta}>{abonne.adresse}</Text>
            </View>
          </View>

          {/* Dernier relevé connu */}
          <View style={styles.infoRow}>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Ancien index</Text>
              <Text style={styles.infoValue}>
                {abonne.dernierIndex.toLocaleString('fr-FR')} kWh
              </Text>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>Relevé le</Text>
              <Text style={styles.infoValue}>{abonne.dateDernierReleve}</Text>
            </View>
          </View>

          {/* Saisie du nouvel index */}
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Nouvel index (kWh)</Text>
            <TextInput
              style={[
                styles.indexInput,
                nouvelIndex.length > 0 && !indexValide && styles.indexInputError,
              ]}
              placeholder={`ex : ${abonne.dernierIndex + 50}`}
              placeholderTextColor="#CBD5E1"
              keyboardType="numeric"
              value={nouvelIndex}
              onChangeText={setNouvelIndex}
              editable={!releveEnregistre}
            />
            {nouvelIndex.length > 0 && !indexValide && (
              <Text style={styles.errorText}>
                L'index doit être un nombre supérieur ou égal à {abonne.dernierIndex.toLocaleString('fr-FR')}
              </Text>
            )}
          </View>

          {/* Consommation calculée */}
          {consommation !== null && (
            <View style={styles.consoCard}>
              <Feather name="zap" size={18} color="#2563EB" />
              <View>
                <Text style={styles.consoLabel}>Consommation calculée</Text>
                <Text style={styles.consoValue}>
                  {consommation.toLocaleString('fr-FR')} kWh
                </Text>
              </View>
            </View>
          )}

          {/* Remarque optionnelle */}
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Remarque (optionnel)</Text>
            <TextInput
              style={styles.remarqueInput}
              placeholder="Compteur endommagé, accès difficile..."
              placeholderTextColor="#CBD5E1"
              value={remarque}
              onChangeText={setRemarque}
              multiline
              numberOfLines={3}
              editable={!releveEnregistre}
            />
          </View>
        </ScrollView>

        {/* Bouton d'enregistrement */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!indexValide || releveEnregistre) && styles.submitButtonDisabled,
            ]}
            disabled={!indexValide || releveEnregistre}
            onPress={enregistrerReleve}>
            <Feather
              name={releveEnregistre ? 'check' : 'save'}
              size={18}
              color="#FFFFFF"
            />
            <Text style={styles.submitButtonText}>
              {releveEnregistre ? 'Relevé enregistré' : 'Enregistrer le relevé'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 16,
  },
  abonneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  abonneNom: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  abonneMeta: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  infoBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  infoLabel: {
    fontSize: 11,
    color: '#94A3B8',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  formSection: {
    gap: 6,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  indexInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
  },
  indexInputError: {
    borderColor: '#FCA5A5',
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
  },
  consoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    padding: 14,
  },
  consoLabel: {
    fontSize: 12,
    color: '#1D4ED8',
  },
  consoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1D4ED8',
    marginTop: 2,
  },
  remarqueInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    color: '#0F172A',
    textAlignVertical: 'top',
    minHeight: 70,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563EB',
    borderRadius: 25,
    height: 48,
  },
  submitButtonDisabled: {
    backgroundColor: '#93C5FD',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
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