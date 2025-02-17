import { Text, View, Image, TextInput, StyleSheet, Button } from "react-native";
import { useEffect, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEvent } from "expo";
import { useAuth } from "../../providers/AuthProvider";
import { uploadImage } from "../../../lib/cloudinary";
import { supabase } from "../../../lib/supabase";
import CustomButton from "../../components/Button";

export default function CreatePost() {
  const [caption, setCaption] = useState("");
  const [media, setMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"video" | "image" | undefined>();

  const { session } = useAuth();

  const player = useVideoPlayer(media || "", (player) => {
    player.loop = true;
    player.play();
  });

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  useEffect(() => {
    if (!media) {
      pickMedia();
    }
  }, [media]);

  const pickMedia = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setMedia(result.assets[0].uri);
      setMediaType(result.assets[0].type as "video" | "image");
    }
  };

  const createPost = async () => {
    if (!media) return;
    const response = await uploadImage(media);
    console.log("image id: ", response?.public_id);

    const { data, error } = await supabase
      .from("posts")
      .insert([
        {
          caption,
          image: response?.public_id,
          user_id: session?.user.id,
          media_type: mediaType,
        },
      ])
      .select();

    router.push("/(tabs)");
  };

  return (
    <View style={styles.contentContainer}>
      {!media ? (
        <View style={styles.placeholder} />
      ) : mediaType === "image" ? (
        <Image source={{ uri: media }} style={styles.media} />
      ) : (
        <VideoView
          player={player}
          style={styles.media}
          allowsFullscreen
          allowsPictureInPicture
        />
      )}

      <Text onPress={pickMedia} style={styles.changeText}>
        Change
      </Text>

      <TextInput
        value={caption}
        onChangeText={(newValue) => setCaption(newValue)}
        placeholder="What is on your mind"
        style={styles.input}
      />

      {mediaType === "video" && (
        <View style={styles.controlsContainer}>
          <Button
            title={isPlaying ? "Pause" : "Play"}
            onPress={() => {
              isPlaying ? player.pause() : player.play();
            }}
          />
        </View>
      )}

      <View style={styles.buttonContainer}>
        <CustomButton title="Share" onPress={createPost} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 50,
  },
  placeholder: {
    width: 210,
    height: 280,
    borderRadius: 10,
    backgroundColor: "#cbd5e1",
  },
  media: {
    width: 210,
    height: 280,
    borderRadius: 10,
  },
  changeText: {
    color: "blue",
    fontWeight: "bold",
    marginVertical: 10,
  },
  input: {
    width: "100%",
    padding: 10,
    borderBottomWidth: 1,
  },
  controlsContainer: {
    marginVertical: 10,
  },
  buttonContainer: {
    marginTop: "auto",
    width: "100%",
  },
});
