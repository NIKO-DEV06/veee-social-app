import { COLORS } from '@/constants/theme';
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import { api } from '@/convex/_generated/api';
import { useMutation } from 'convex/react';
import { Image as ExpoImage } from 'expo-image';

export default function CreateScreen() {
  const router = useRouter();
  const { user } = useUser();

  const [caption, setCaption] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);

  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true),
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false),
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) setSelectedImage(result.assets[0].uri);
  };

  const generateUploadUrl = useMutation(api.posts.generateUploadUrl);
  const createPost = useMutation(api.posts.createPost);

  const handleShare = async () => {
    if (!selectedImage) return;

    try {
      setIsSharing(true);
      const uploadUrl = await generateUploadUrl();

      const uploadResult = await FileSystem.uploadAsync(
        uploadUrl,
        selectedImage,
        {
          httpMethod: 'POST',
          uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
          mimeType: 'image/jpeg',
        },
      );

      if (uploadResult.status !== 200) throw new Error('Upload failed!');

      const { storageId } = JSON.parse(uploadResult.body);

      await createPost({ storageId, caption });
      setCaption('');
      setSelectedImage(null);
      router.push('/(tabs)');
    } catch (error) {
      console.log('Error Sharing Post', error);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={80}
        className="bg-gray h-full"
      >
        <View className="h-[60%] border-b border-white/10">
          {/* HEADER SECTION */}
          <View className="px-5">
            <View className="flex flex-row items-center justify-between py-5">
              <TouchableOpacity>
                <Ionicons
                  name="arrow-back"
                  size={28}
                  color={isSharing ? COLORS.grey : COLORS.primary}
                />
              </TouchableOpacity>
              <Text className="text-white text-xl font-semibold tracking-tight absolute left-1/2 -translate-x-1/2">
                New Post
              </Text>
              {/* <View style={{ width: 28 }} />
               */}
              {isSharing ? (
                <ActivityIndicator
                  size="small"
                  color={COLORS.primary}
                  className="-translate-x-4"
                />
              ) : (
                <TouchableOpacity
                  disabled={isSharing}
                  activeOpacity={0.5}
                  style={{ backgroundColor: COLORS.primary }}
                  className={`px-5 py-2 rounded-full ${isSharing && 'opacity-60'}`}
                  onPress={handleShare}
                >
                  <Text className="font-semibold tracking-tight">Share</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* IMAGE PICKER SECTION */}

          <View className="h-px w-full bg-white/5" />
          {!selectedImage ? (
            <TouchableOpacity
              onPress={pickImage}
              disabled={isSharing}
              className="h-full flex flex-1 justify-center items-center"
            >
              <Ionicons name="image-outline" size={48} color={COLORS.grey} />
              <Text
                className="text-white font-light text-xl mt-3"
                style={{ color: COLORS.grey }}
              >
                Tap to select an Image
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="h-[87%] w-full relative">
              <ExpoImage
                source={selectedImage}
                contentFit="cover"
                transition={200}
                style={{ width: '100%', height: '100%' }}
                alt=""
              />

              <TouchableOpacity
                onPress={pickImage}
                disabled={isSharing}
                className="flex flex-row items-center gap-2 bg-black/70 w-fit absolute bottom-8 right-5 px-3 py-2 rounded-lg border border-white"
              >
                <Ionicons name="image-outline" size={20} color={COLORS.white} />
                <Text className="text-white">Change</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* INPUT SECTION */}

        <ScrollView className="">
          <View
            className={`flex flex-row px-5 gap-3 ${selectedImage && isKeyboardVisible ? 'pt-12' : 'pt-4'}`}
          >
            <Image
              source={{ uri: user?.imageUrl }}
              className="rounded-full size-9"
            />
            <TextInput
              className="w-[90%] text-white text-lg"
              placeholder="What's on your mind...🤔"
              multiline
              value={caption}
              onChangeText={setCaption}
              editable={!isSharing}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
