import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
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

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = () => {
    // On ne crée pas encore le compte ici : on transmet juste les infos
    // de base vers l'écran d'informations complémentaires (quartier, ruelle,
    // téléphone...) qui servira à finaliser la demande de branchement E2C.
    router.push({
      pathname: '/(auth)/register-details',
      params: { name, email, password },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Bandeau courbé du haut / En-tête (identique au login) */}
          <View style={styles.topSheet}>
            <View style={styles.headerContainer}>
              <View style={styles.iconBadge}>
                <Image source={require('../../assets/images/E2C1.png')} style={styles.icon} />
              </View>
              <Text style={styles.brandTitle}>Energie électrique du Congo</Text>
              <Text style={styles.brandSubtitle}>Créez votre compte</Text>
            </View>
          </View>

          {/* Formulaire */}
          <View style={styles.formContainer}>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={18} color="rgba(255,255,255,0.75)" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#C7D2FE"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={18} color="rgba(255,255,255,0.75)" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="surname@gmail.com"
                placeholderTextColor="#C7D2FE"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={18} color="rgba(255,255,255,0.75)" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#C7D2FE"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#C7D2FE"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.registerButton} onPress={handleRegister} activeOpacity={0.85}>
              <Text style={styles.registerButtonText}>Suivant</Text>
              <Ionicons name="arrow-forward" size={18} color="#0F172A" style={{ marginLeft: 8 }} />
            </TouchableOpacity>

            {/* Lien vers Login */}
            <View style={styles.switchAuthContainer}>
              <Text style={styles.switchAuthText}> Avez-vous déjà un compte? </Text>
              <Link href="/(auth)/login" style={styles.switchAuthLink}>
                Se connecter
              </Link>
            </View>
          </View>

          {/* Bandeau courbé / Réseaux sociaux du bas (identique au login) */}
          <View style={styles.bottomSheet}>
            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>ou se connecter avec</Text>
              <View style={styles.dividerLine} />
            </View>
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
    backgroundColor: '#2563EB',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  topSheet: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 56,
    paddingTop: 12,
    paddingBottom: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  headerContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconBadge: {
    width: 94,
    height: 94,
    borderRadius: 32,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    overflow: 'hidden',
  },
  icon: {
    width: 106,
    height: 106,
    resizeMode: 'contain',
    borderRadius: 28,
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    letterSpacing: 2,
    textAlign: 'center',
  },
  brandSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  formContainer: {
    marginVertical: 20,
    paddingHorizontal: 24,
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
  eyeIcon: {
    padding: 4,
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
  switchAuthContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 22,
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
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingTop: 22,
    paddingBottom: 28,
    paddingHorizontal: 24,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    color: '#9CA3AF',
    fontSize: 12,
    marginHorizontal: 10,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
});