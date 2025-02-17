import { supabase } from "../lib/supabase";

interface Like {
  id: string;
}

interface Profile {
  username: string;
  push_token: string;
}

interface Post {
  id: string;
  profiles: Profile;
}

interface LikeData {
  posts: Post;
}

export async function sendLikeNotification(like: Like): Promise<void> {
  const { data } = await supabase
    .from<LikeData, any>("likes")
    .select("*, posts(*, profiles(*))")
    .eq("id", like.id)
    .single();

  const pushToken = data?.posts?.profiles?.push_token;
  if (!pushToken) {
    return;
  }

  const message = {
    to: pushToken,
    sound: "default",
    title: "Someone liked your post",
    body: `${data?.posts?.profiles.username} liked your post!`,
    data: { postId: data.posts.id },
  };
  sendPushNotification(message);
}

async function sendPushNotification(message) {
  await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Accept-encoding": "gzip, deflate",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(message),
  });
}
