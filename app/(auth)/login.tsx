/* eslint-disable react-hooks/rules-of-hooks */
import { COLORS } from '@/constants/theme';
import { useSSO } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  ImageBackground,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function login() {
  const { startSSOFlow } = useSSO();
  const router = useRouter();

  const handleGoogleSignIn = async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: 'oauth_google',
      });

      if (setActive && createdSessionId) {
        setActive({ session: createdSessionId });
        router.replace('/(tabs)');
      }
    } catch (error) {
      console.log('OAuth Error:', error);
    }
  };
  return (
    <ImageBackground
      source={require('../../assets/images/auth-bg.jpeg')}
      className="h-full object-cover w-full bg-no-repeat relative flex justify-end"
    >
      <LinearGradient
        colors={['#000000', 'transparent']}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 250,
          zIndex: 1,
        }}
      />
      <View className="flex flex-col items-center mb-10 z-[5] relative">
        <Image
          source={require('../../assets/images/logo.png')}
          className="h-[60px] w-[200px]"
          resizeMode="contain"
        />
        <Text className="text-white text-lg font-bold mt-6 tracking-tight">
          Catch the vibe.
        </Text>
        <Text className="text-white text-lg font-bold tracking-tight">
          Share the moment.
        </Text>
        <Image
          source={require('../../assets/images/auth-landing.png')}
          className="size-[300px] mt-14"
          resizeMode="contain"
        />
        <View className="w-full mt-10">
          <TouchableOpacity
            onPress={handleGoogleSignIn}
            activeOpacity={0.7}
            className="w-[300px] flex flex-row items-center justify-center gap-3 py-4 mx-auto bg-white rounded-full"
          >
            <Ionicons name="logo-google" size={24} color={COLORS.primary} />
            <Text className="font-bold text-lg tracking-tight">
              Continue with Google
            </Text>
          </TouchableOpacity>
        </View>
        <Text className="text-white opacity-60 w-[60%] text-center mt-5 text-sm font-medium">
          By continuing, you agree to our Terms and Privacy Policy
        </Text>
      </View>
    </ImageBackground>
  );
}
