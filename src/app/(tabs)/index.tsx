import { useEffect, useState } from "react";
import { Alert, FlatList } from "react-native";
import { useAuth } from "../../..//src/providers/AuthProvider";
import { supabase } from "../../../lib/supabase";
import PostListItem from "../../components/PostListItem";

export default function FeedScreen() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchPosts();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel("realtime_posts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        (payload) => {
          console.log("New Post Added:", payload.new);
          setPosts((prevPosts) => [payload.new, ...prevPosts]); // Add new post to the top
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription); // Clean up subscription
    };
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    let { data, error } = await supabase
      .from("posts")
      .select("*, user:profiles(*), my_likes:likes(*), likes(count)")
      .eq("my_likes.user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      Alert.alert("Something went wrong");
    }

    setPosts(data);
    setLoading(false);
  };

  return (
    <FlatList
      data={posts}
      renderItem={({ item }) => <PostListItem post={item} />}
      contentContainerStyle={{
        gap: 10,
        maxWidth: 512,
        alignSelf: "center",
        width: "100%",
      }}
      showsVerticalScrollIndicator={false}
      onRefresh={fetchPosts}
      refreshing={loading}
    />
  );
}
