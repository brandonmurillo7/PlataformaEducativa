import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { supabase } from '../lib/supabase';
import { Usuario } from '../models/Usuario';

type LoginScreenProps = {
  onLogin: (usuario: Usuario) => void;
};

const isValidEmail = (value: string) => /\S+@\S+\.\S+/.test(value);

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password) {
      setError('Completa tu correo y contraseña para continuar.');
      return;
    }

    if (!isValidEmail(normalizedEmail)) {
      setError('Ingresa un correo electrónico válido.');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (loginError || !data.user) {
        const message = loginError?.message.toLowerCase() ?? '';
        if (message.includes('email not confirmed')) {
          setError('Confirma tu correo desde el enlace que envió Supabase.');
        } else if (message.includes('invalid login credentials')) {
          setError('El correo o la contraseña no son correctos.');
        } else {
          setError(loginError?.message || 'No se pudo iniciar sesión.');
        }
        return;
      }

      setError('');
      const nombre = data.user.user_metadata?.full_name
        || data.user.user_metadata?.name
        || normalizedEmail.split('@')[0];
      onLogin(new Usuario(normalizedEmail, nombre, ''));
    } catch {
      setError('No hay conexión con Supabase. Revisa tu internet e inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>ED</Text>
          </View>
          <Text style={styles.eyebrow}>CAMPUS VIRTUAL</Text>
          <Text style={styles.title}>Tu aprendizaje, en un solo lugar.</Text>
          <Text style={styles.subtitle}>
            Accede a tus asignaturas, notas y comunidad estudiantil.
          </Text>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Iniciar sesión</Text>
            <Text style={styles.formDescription}>
              Usa tus credenciales institucionales para continuar.
            </Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Correo electrónico</Text>
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect={false}
                keyboardType="email-address"
                onChangeText={(value) => {
                  setEmail(value);
                  setError('');
                }}
                placeholder="estudiante@campus.edu"
                placeholderTextColor="#8B96A8"
                style={styles.input}
                value={email}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  autoCapitalize="none"
                  autoComplete="password"
                  onChangeText={(value) => {
                    setPassword(value);
                    setError('');
                  }}
                  placeholder="Escribe tu contraseña"
                  placeholderTextColor="#8B96A8"
                  secureTextEntry={!showPassword}
                  style={[styles.input, styles.passwordInput]}
                  value={password}
                />
                <Pressable
                  accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  accessibilityRole="button"
                  onPress={() => setShowPassword((visible) => !visible)}
                  style={styles.passwordToggle}
                >
                  <Text style={styles.passwordToggleText}>{showPassword ? '◉' : '◌'}</Text>
                </Pressable>
              </View>
            </View>

            {!!error && <Text style={styles.errorText}>{error}</Text>}

            <Pressable
              accessibilityRole="button"
              disabled={isLoading}
              onPress={handleLogin}
              style={({ pressed }) => [styles.loginButton, pressed && styles.pressed]}
            >
              <Text style={styles.loginButtonText}>
                {isLoading ? 'Verificando...' : 'Entrar al campus'}
              </Text>
              {!isLoading && <Text style={styles.arrow}>→</Text>}
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={() => setError('Solicita el restablecimiento a soporte académico.')}
              style={styles.forgotButton}
            >
              <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            </Pressable>
          </View>

          <Text style={styles.footerText}>Plataforma Educativa · Aprende y conecta</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D1B2A',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingBottom: 64,
    paddingTop: 36,
  },
  brandMark: {
    alignItems: 'center',
    backgroundColor: '#E9C46A',
    borderRadius: 18,
    height: 64,
    justifyContent: 'center',
    marginBottom: 22,
    width: 64,
  },
  brandMarkText: {
    color: '#0D1B2A',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1,
  },
  eyebrow: {
    color: '#E9C46A',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    marginBottom: 10,
  },
  title: {
    color: '#F7F4EA',
    fontSize: 35,
    fontWeight: '800',
    lineHeight: 42,
    maxWidth: 360,
  },
  subtitle: {
    color: '#B5C0CF',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 30,
    marginTop: 14,
    maxWidth: 360,
  },
  formCard: {
    backgroundColor: '#F7F4EA',
    borderRadius: 20,
    padding: 22,
  },
  formTitle: {
    color: '#0D1B2A',
    fontSize: 23,
    fontWeight: '800',
  },
  formDescription: {
    color: '#647084',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 22,
    marginTop: 6,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  label: {
    color: '#26384A',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D9DEE5',
    borderRadius: 11,
    borderWidth: 1,
    color: '#0D1B2A',
    fontSize: 15,
    height: 52,
    paddingHorizontal: 15,
  },
  passwordRow: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 54,
  },
  passwordToggle: {
    alignItems: 'center',
    height: 52,
    justifyContent: 'center',
    position: 'absolute',
    right: 4,
    top: 0,
    width: 46,
  },
  passwordToggleText: {
    color: '#2A756D',
    fontSize: 23,
    fontWeight: '700',
  },
  errorText: {
    color: '#B13B3B',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 14,
  },
  loginButton: {
    alignItems: 'center',
    backgroundColor: '#2A9D8F',
    borderRadius: 11,
    flexDirection: 'row',
    height: 54,
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.82,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  arrow: {
    color: '#FFFFFF',
    fontSize: 22,
    marginLeft: 10,
  },
  forgotButton: {
    alignItems: 'center',
    marginTop: 18,
  },
  forgotText: {
    color: '#2A756D',
    fontSize: 13,
    fontWeight: '700',
  },
  footerText: {
    color: '#8190A3',
    fontSize: 12,
    marginTop: 26,
    textAlign: 'center',
  },
});
