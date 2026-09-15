import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { register } from '../../api';

export default function RegisterDetailsScreen() {
  const router = useRouter();
  // Récupère ce qui a été saisi à l'étape précédente (nom, email, mot de passe)
  const { name, email, password } = useLocalSearchParams<{
    name: string;
    email: string;
    password: string;
  }>();

  const [ville, setVille] = useState('');
  const [quartier, setQuartier] = useState('');
  const [ruelle, setRuelle] = useState('');
  const [pointRepere, setPointRepere] = useState('');
  const [telephone, setTelephone] = useState('');
  const [typeLogement, setTypeLogement] = useState<'Maison' | 'Appartement'>('Maison');
  const [loading, setLoading] = useState(false);

  const handleFinalRegister = async () => {
    if (!quartier || !ruelle || !telephone) {
      Alert.alert('Champs manquants', 'Merci de renseigner au moins le quartier, la ruelle et le téléphone.');
      return;
    }

    setLoading(true);
    try {
      await register({
        name: name ?? '',
        email: email ?? '',
        password: password ?? '',
        ville,
        quartier,
        ruelle,
        pointRepere,
        telephone,
        typeLogement,
      });

      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Erreur', e?.message || 'Une erreur est survenue, veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.topSheet}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={22} color="#0F172A" />
            </TouchableOpacity>
            <View style={styles.headerContainer}>
              <Text style={styles.brandTitle}>Informations de branchement</Text>
              <Text style={styles.brandSubtitle}>
                Ces informations serviront à localiser le domicile et à planifier l'installation du courant
              </Text>
            </View>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons name="business-outline" size={18} color="rgba(255,255,255,0.75)" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ville (ex: Pointe-Noire)"
                placeholderTextColor="#C7D2FE"
                value={ville}
                onChangeText={setVille}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="location-outline" size={18} color="rgba(255,255,255,0.75)" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Quartier"
                placeholderTextColor="#C7D2FE"
                value={quartier}
                onChangeText={setQuartier}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="trail-sign-outline" size={18} color="rgba(255,255,255,0.75)" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ruelle / Avenue"
                placeholderTextColor="#C7D2FE"
                value={ruelle}
                onChangeText={setRuelle}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="flag-outline" size={18} color="rgba(255,255,255,0.75)" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Point de repère (optionnel)"
                placeholderTextColor="#C7D2FE"
                value={pointRepere}
                onChangeText={setPointRepere}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="call-outline" size={18} color="rgba(255,255,255,0.75)" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Numéro de téléphone"
                placeholderTextColor="#C7D2FE"
                value={telephone}
                onChangeText={setTelephone}
                keyboardType="phone-pad"
              />
            </View>

            {/* Type de logement */}
            <Text style={styles.sectionLabel}>Type de logement</Text>
            <View style={styles.choiceRow}>
              {(['Maison', 'Appartement'] as const).map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[styles.choiceChip, typeLogement === option && styles.choiceChipActive]}
                  onPress={() => setTypeLogement(option)}
                >
                  <Text style={[styles.choiceChipText, typeLogement === option && styles.choiceChipTextActive]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.registerButton, loading && { opacity: 0.7 }]}
              onPress={handleFinalRegister}
              activeOpacity={0.85}
              disabled={loading}
            >
              <Text style={styles.registerButtonText}>
                {loading ? 'Validation...' : 'Valider mon compte'}
              </Text>
              {!loading && (
                <Ionicons name="checkmark" size={18} color="#0F172A" style={{ marginLeft: 8 }} />
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2563EB',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  topSheet: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 56,
    paddingTop: 12,
    paddingBottom: 28,
    paddingHorizontal: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerContainer: {
    paddingTop: 4,
  },
  brandTitle: {
    fontSize: 21,
    fontWeight: 'bold',
    color: '#0F172A',
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 6,
    lineHeight: 18,
  },
  formContainer: {
    marginVertical: 20,
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    borderRadius: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    marginBottom: 16,
    paddingHorizontal: 18,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
  },
  sectionLabel: {
    color: '#E0E7FF',
    fontSize: 13,
    marginBottom: 10,
    marginTop: 4,
  },
  choiceRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  choiceChip: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  choiceChipActive: {
    backgroundColor: '#00D1FF',
    borderColor: '#00D1FF',
  },
  choiceChipText: {
    color: '#E0E7FF',
    fontSize: 13,
  },
  choiceChipTextActive: {
    color: '#0F172A',
    fontWeight: 'bold',
  },
  registerButton: {
    flexDirection: 'row',
    backgroundColor: '#00D1FF',
    borderRadius: 30,
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
    shadowColor: '#00D1FF',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  registerButtonText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: 'bold',
  },
});