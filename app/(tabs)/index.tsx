import { useAuth } from '@clerk/clerk-expo';
import { Text, TouchableOpacity, View } from 'react-native';

export default function Index() {
  const { signOut } = useAuth();
  return (
    <View className="flex justify-center items-center h-full bg-gray">
      <TouchableOpacity
        onPress={() => signOut()}
        className="bg-red-600 px-4 py-2 rounded-full"
      >
        <Text>LOGOUT</Text>
      </TouchableOpacity>
    </View>
  );
}
