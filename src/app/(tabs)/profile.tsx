import { Text, View, Image, TextInput, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";

import { thumbnail } from "@cloudinary/url-gen/actions/resize";
import { AdvancedImage } from "cloudinary-react-native";
import Button from "../../components/Button";
import { supabase } from "../../../lib/supabase";

import { cld, uploadImage } from "../../../lib/cloudinary";
import { useAuth } from "../../providers/AuthProvider";
import CustomTextInput from "../../components/CustomTextInput ";

export default function ProfileScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [remoteImage, setRemoteImage] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  const { user } = useAuth();

  useEffect(() => {
    getProfile();
  }, []);

  const getProfile = async () => {
    if (!user) {
      return;
    }
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Failed to fetch profile:", error);
      Alert.alert("Failed to fetch profile");
      return;
    }

    console.log("Fetched profile:", data);
    setUsername(data.username);
    setBio(data.bio);
    setRemoteImage(data.avatar_url);
  };

  const updateProfile = async () => {
    if (!user) {
      return;
    }

    const updatedProfile: {
      username: string;
      bio: string;
      avatar_url?: string;
    } = {
      username,
      bio,
    };

    if (image) {
      console.log("Uploading image...");
      const response = await uploadImage(image);
      updatedProfile.avatar_url = response.public_id;
      console.log("Image uploaded with ID:", response.public_id);
    }

    console.log("Updating profile with data:", updatedProfile);

    const { data, error } = await supabase
      .from("profiles")
      .update(updatedProfile)
      .eq("id", user.id);

    if (error) {
      console.error("Failed to update profile:", error);
      Alert.alert("Failed to update profile");
      return;
    }

    console.log("Profile updated successfully:", data);
    Alert.alert("Profile updated successfully");
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  let remoteCldImage;
  if (remoteImage) {
    remoteCldImage = cld.image(remoteImage);
    remoteCldImage.resize(thumbnail().width(300).height(300));
  }

  return (
    <View className="p-3 flex-1">
      {/* Avatar image picker */}
      {image ? (
        <Image
          source={{ uri: image }}
          className="w-52 aspect-square self-center rounded-full bg-slate-300"
        />
      ) : remoteCldImage ? (
        <AdvancedImage
          cldImg={remoteCldImage}
          className="w-52 aspect-square self-center rounded-full bg-slate-300"
        />
      ) : (
        <View className="w-52 aspect-square self-center rounded-full bg-slate-300" />
      )}
      <Text
        onPress={pickImage}
        className="text-blue-500 font-semibold m-5 self-center"
      >
        Change
      </Text>

      {/* Form */}
      <View className="gap-5">
        <CustomTextInput
          label="Username"
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />

        <CustomTextInput
          label="Bio"
          placeholder="Bio"
          value={bio}
          onChangeText={setBio}
          multiline
          numberOfLines={3}
        />
      </View>

      {/* Button */}
      <View className="gap-2 mt-auto">
        <Button title="Update profile" onPress={updateProfile} />
        <Button title="Sign out" onPress={() => supabase.auth.signOut()} />
      </View>
    </View>
  );
}
