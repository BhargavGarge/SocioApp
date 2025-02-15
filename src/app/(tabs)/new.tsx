import { View, Text, Image, TextInput } from "react-native";
import React, { useEffect, useState } from "react";
import Button from "../../components/Button";
import * as ImagePicker from "expo-image-picker";
import { MediaTypeOptions } from "expo-image-picker";
import { uploadImage } from "../../../lib/cloudinary";
import { router } from "expo-router";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../providers/AuthProvider";

export default function CreatePost() {
  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState<string | null>(null);
  const { session } = useAuth();

  useEffect(() => {
    if (!media) {
      pickMedia();
    }
  }, [media]);

  const pickMedia = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: MediaTypeOptions.Images, // Only allow images
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setMedia(result.assets[0].uri);
    }
  };

  const createPost = async () => {
    if (!media) {
      return;
    }
    const response = await uploadImage(media);
    console.log("image id: ", response?.public_id);

    const { data, error } = await supabase
      .from("posts")
      .insert([
        {
          caption,
          image: response?.public_id,
          user_id: session?.user.id,
        },
      ])
      .select();

    router.push("/(tabs)");
  };

  return (
    <View className="p-3 items-center">
      {/* Image Picker */}
      {!media ? (
        <View className="w-52 aspect-[3/4] rounded-lg bg-slate-300" />
      ) : (
        <Image
          source={{ uri: media }}
          className="w-52 aspect-[3/4] rounded-lg bg-slate-300"
        />
      )}

      {/* Caption Input */}
      <Text className="text-blue-500 font-bold mt-5 " onPress={pickMedia}>
        Select
      </Text>

      {/* Caption */}
      <TextInput
        value={caption}
        onChangeText={(newValue) => setCaption(newValue)}
        placeholder="What is on your mind"
        className="w-full p-3"
      />

      {/* Button */}
      <View className="mt-auto w-full">
        <Button title="Share" onPress={createPost} />
      </View>
    </View>
  );
}
