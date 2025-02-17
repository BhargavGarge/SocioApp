import { View, Text, Image, useWindowDimensions } from "react-native";
import React, { useEffect, useState } from "react";
import { AdvancedImage, AdvancedVideo } from "cloudinary-react-native";
import { thumbnail } from "@cloudinary/url-gen/actions/resize";
import { focusOn } from "@cloudinary/url-gen/qualifiers/gravity";
import { FocusOn } from "@cloudinary/url-gen/qualifiers/focusOn";
import { Ionicons, Feather, AntDesign } from "@expo/vector-icons";
import { cld } from "../../lib/cloudinary";
import PostContent from "./PostContent";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../providers/AuthProvider";
import { sendLikeNotification } from "../../utils/notification";
interface Post {
  id: string;
  media_type: string;
  image: string;
  user: {
    avatar_url: string;
    username: string;
  };
  caption: string;
}

export default function PostListItem({ post }: { post: Post }) {
  const image = cld.image(post.image);
  const { width } = useWindowDimensions();
  const [likeRecord, setLikeRecord] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const { user } = useAuth();

  image.resize(thumbnail().width(width).height(width)); // Crop the image, focusing on the face.
  const avatar = cld.image(post.user.avatar_url || "user");
  avatar.resize(
    thumbnail().width(48).height(48).gravity(focusOn(FocusOn.face()))
  );
  useEffect(() => {
    if (post.my_likes.length > 0) {
      setLikeRecord(post.my_likes[0]);
      setIsLiked(true);
    }
  }, [post.my_likes]);
  useEffect(() => {
    if (isLiked) {
      saveLike();
    } else {
      deleteLike();
    }
  }, [isLiked]);

  const saveLike = async () => {
    if (likeRecord) {
      return;
    }
    const { data } = await supabase
      .from("likes")
      .insert([{ user_id: user?.id, post_id: post.id }])
      .select();

    // send notification to the owner of that post
    sendLikeNotification(data[0]);
    setLikeRecord(data[0]);
  };
  const deleteLike = async () => {
    if (likeRecord) {
      const { error } = await supabase
        .from("likes")
        .delete()
        .eq("id", likeRecord.id);
      if (!error) {
        setLikeRecord(null);
      }
    }
  };

  return (
    <View className="bg-white">
      {/* header */}
      <View className="p-2 flex-row items-center gap-2">
        <AdvancedImage
          cldImg={avatar}
          className="w-12 aspect-square rounded-full"
        />
        <Text className="font-semibold ">
          {post.user.username || "New user"}
        </Text>
      </View>
      <PostContent post={post} />
      {/* icons */}
      <View className="flex-row gap-3 p-3">
        <AntDesign
          onPress={() => setIsLiked(!isLiked)}
          name={isLiked ? "heart" : "hearto"}
          size={20}
          color={isLiked ? "crimson" : "black"}
        />
        <Ionicons name="chatbubble-outline" size={20} />
        <Feather name="send" size={20} />

        <Feather name="bookmark" size={20} className="ml-auto" />
      </View>
      <View className="px-3 gap-1">
        <Text className="font-semibold">
          {post.likes?.[0]?.count || 0} likes
        </Text>
        <Text>
          <Text className="font-semibold">
            {post.user.username || "New user"}{" "}
          </Text>
          {post.caption}
        </Text>
      </View>
    </View>
  );
}
