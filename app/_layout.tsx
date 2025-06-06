import InitialLayout from '@/components/initialLayout';
import ClerkAndConvexProvider from '@/providers/ClerkAndConvexProvider';
import { StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import '../global.css';

export default function RootLayout() {
  return (
    <ClerkAndConvexProvider>
      <SafeAreaProvider>
        <SafeAreaView className="flex flex-1 bg-gray text-white">
          <StatusBar />
          <InitialLayout />
        </SafeAreaView>
      </SafeAreaProvider>
    </ClerkAndConvexProvider>
  );
}
