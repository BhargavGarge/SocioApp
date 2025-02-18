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
  likes?: { count: number }[];
  my_likes?: { id: string }[];
}

export default function PostListItem({ post }: { post: Post }) {
  const image = cld.image(post.image);
  const { width } = useWindowDimensions();
  const [likeRecord, setLikeRecord] = useState(post.my_likes?.[0] || null);
  const [isLiked, setIsLiked] = useState(post.my_likes?.length > 0);
  const [likeCount, setLikeCount] = useState(post.likes?.[0]?.count || 0);
  const { user } = useAuth();

  image.resize(thumbnail().width(width).height(width)); // Crop the image, focusing on the face.
  const avatar = cld.image(post.user.avatar_url || "user");
  avatar.resize(
    thumbnail().width(48).height(48).gravity(focusOn(FocusOn.face()))
  );

  useEffect(() => {
    const channel = supabase
      .channel(`likes_post_${post.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "likes",
          filter: `post_id=eq.${post.id}`,
        },
        (payload) => {
          setLikeCount((prev) => prev + 1);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "likes",
          filter: `post_id=eq.${post.id}`,
        },
        (payload) => {
          setLikeCount((prev) => Math.max(0, prev - 1));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [post.id]);

  const handleLikeToggle = async () => {
    if (isLiked) {
      await deleteLike();
    } else {
      await saveLike();
    }
    setIsLiked(!isLiked);
  };

  const saveLike = async () => {
    if (likeRecord) return;
    const { data } = await supabase
      .from("likes")
      .insert([{ user_id: user?.id, post_id: post.id }])
      .select();

    if (data && data[0]) {
      sendLikeNotification(data[0]);
      setLikeRecord(data[0]);
    }
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
          onPress={handleLikeToggle}
          name={isLiked ? "heart" : "hearto"}
          size={20}
          color={isLiked ? "crimson" : "black"}
        />
        <Ionicons name="chatbubble-outline" size={20} />
        <Feather name="send" size={20} />
        <Feather name="bookmark" size={20} className="ml-auto" />
      </View>
      <View className="px-3 gap-1">
        <Text className="font-semibold">{likeCount} likes</Text>
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
