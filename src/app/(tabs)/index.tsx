import { useEffect, useState } from "react";
import { Alert, FlatList } from "react-native";
import posts from "../../../assets/data/posts.json";

import { useAuth } from "../../..//src/providers/AuthProvider";
import { supabase } from "../../../lib/supabase";
import PostListItem from "../../components/PostListItem";

export default function FeedScreen() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  const { user } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    let { data, error } = await supabase
      .from("posts")
      .select("*,user:profiles(*)");

    if (error) {
      Alert.alert("Something went wrong");
    }
    // console.log(JSON.stringify(data, null, 2));
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
