import { useVideoPlayer, VideoView } from "expo-video";
import { useWindowDimensions, View } from "react-native";
import { cld } from "../../lib/cloudinary";
import { thumbnail, scale } from "@cloudinary/url-gen/actions/resize";
import { AdvancedImage } from "cloudinary-react-native";

interface Post {
  media_type: string;
  image: string;
}

export default function PostContent({ post }: { post: Post }) {
  const { width } = useWindowDimensions();

  if (post.media_type === "image") {
    const image = cld.image(post.image);
    image.resize(thumbnail().width(width).height(width));

    return <AdvancedImage cldImg={image} className="w-full aspect-[4/3]" />;
  }

  if (post.media_type === "video") {
    const video = cld.video(post.image);
    video.resize(scale().width(400));
    const player = useVideoPlayer(video.toURL(), (player) => {
      player.pause();
    });

    return (
      <View className="w-100 aspect-[4/3] rounded-lg">
        <VideoView
          style={{ width: "100%", aspectRatio: 4 / 3 }}
          player={player}
          allowsFullscreen
          allowsPictureInPicture
        />
      </View>
    );
  }

  return null; // In case `post.media_type` is neither "image" nor "video"
}
