import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
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
import { login } from '../../api';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Champs manquants', 'Merci de saisir votre email et votre mot de passe.');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Erreur de connexion', e?.message || 'Une erreur est survenue, veuillez réessayer.');
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
          
          {/* Forme incurvée du haut (Style maquette) */}
          <View style={styles.topSheet}>
            {/* Espace pour la barre d'état / encoche si besoin */}
          </View>

          {/* Contenu central sur fond bleu */}
          <View style={styles.contentWrapper}>
            <View style={styles.headerContainer}>
              <View style={styles.iconBadge}>
                <Image source={require('../../assets/images/E2C1.png')} style={styles.icon} />
              </View>
              <Text style={styles.brandTitle}>Energie électrique du Congo</Text>
            </View>

            <View style={styles.formContainer}>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="surname@gmail.com"
                  placeholderTextColor="#93C5FD"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  editable={!loading}
                />
              </View>

              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.input}
                  placeholder="••••••"
                  placeholderTextColor="#93C5FD"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={20}
                    color="#93C5FD"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.forgotContainer}>
                <Text style={styles.forgotText}> mot de passe oublié?</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.loginButton, loading && { opacity: 0.7 }]}
                onPress={handleLogin}
                activeOpacity={0.85}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#0F172A" />
                ) : (
                  <Text style={styles.loginButtonText}>Se connecter</Text>
                )}
              </TouchableOpacity>

              <View style={styles.switchAuthContainer}>
                <Text style={styles.switchAuthText}> Vous n'avez pas de compte? </Text>
                <Link href="/(auth)/register" style={styles.switchAuthLink}>
                  S'inscrire
                </Link>
              </View>
            </View>
          </View>

          {/* Forme incurvée du bas pour les réseaux sociaux */}
          <View style={styles.bottomSheet}>
            <View style={styles.socialContainer}>
              <TouchableOpacity style={styles.socialButton}>
                <FontAwesome name="facebook" size={18} color="#2563EB" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <FontAwesome name="instagram" size={18} color="#2563EB" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <FontAwesome name="twitter" size={18} color="#2563EB" />
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Fond global blanc pour faire ressortir les vagues de couleur
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
    backgroundColor: '#2563EB', // Le fond bleu intermédiaire
  },
  topSheet: {
    backgroundColor: '#FFFFFF',
    height: 90,
    borderBottomLeftRadius: 100, // Effet de vague asymétrique prononcé
    borderBottomRightRadius: 0,
    marginBottom: 10,
  },
  contentWrapper: {
    paddingHorizontal: 30,
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 10,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 35,
  },
  icon: {
    width: 106,
    height: 106,
    resizeMode: 'contain',
    borderRadius: 28, // Cercle parfait pour l'icône
  },
  iconBadge: {
    marginBottom: 10,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2.5,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 30,
    marginBottom: 18,
    paddingHorizontal: 22,
    height: 52,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
  },
  eyeIcon: {
    padding: 4,
  },
  forgotContainer: {
    alignSelf: 'flex-start',
    marginBottom: 30,
    marginLeft: 15,
  },
  forgotText: {
    color: '#E0E7FF',
    fontSize: 13,
  },
  loginButton: {
    backgroundColor: '#00D1FF', // Bouton turquoise caractéristique
    borderRadius: 30,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  loginButtonText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchAuthContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
  },
  switchAuthText: {
    color: '#E0E7FF',
    fontSize: 14,
  },
  switchAuthLink: {
    color: '#00D1FF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 100, // Fait écho à la vague du haut de manière inversée
    paddingTop: 35,
    paddingBottom: 40,
    paddingHorizontal: 24,
    marginTop: 20,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  socialButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
});