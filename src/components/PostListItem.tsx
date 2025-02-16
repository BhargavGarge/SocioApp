import { View, Text, Image, useWindowDimensions } from "react-native";
import React, { useState } from "react";
import posts from "../../assets/data/posts.json";
import { AdvancedImage } from "cloudinary-react-native";
import { Cloudinary } from "@cloudinary/url-gen";
import { thumbnail } from "@cloudinary/url-gen/actions/resize";
import { byRadius } from "@cloudinary/url-gen/actions/roundCorners";
import { focusOn } from "@cloudinary/url-gen/qualifiers/gravity";
import { FocusOn } from "@cloudinary/url-gen/qualifiers/focusOn";
import { Ionicons, Feather, AntDesign } from "@expo/vector-icons";
import { cld } from "../../lib/cloudinary";

export default function PostListItem({ post }) {
  const image = cld.image(post.image);
  const { width } = useWindowDimensions();

  const [isLiked, setIsLiked] = useState(false);
  image.resize(thumbnail().width(width).height(width)); // Crop the image, focusing on the face.
  const avatar = cld.image(post.user.avatar_url || "user");
  avatar.resize(
    thumbnail().width(48).height(48).gravity(focusOn(FocusOn.face()))
  );

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
      <AdvancedImage cldImg={image} className="w-full aspect-[4/3]" />
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
        <Text>
          <Text className="font-semibold">
            {post.user.username || "New user"}
          </Text>
          {post.caption}
        </Text>
      </View>
    </View>
  );
}
