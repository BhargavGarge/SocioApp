import { createContext, useContext, useState } from "react";

const FeedContext = createContext(null);

export function FeedProvider({ children }) {
  const [posts, setPosts] = useState([]);

  const setNewPost = (newPost) => {
    setPosts((prevPosts) => [newPost, ...prevPosts]); // Add new post at top
  };

  return (
    <FeedContext.Provider value={{ posts, setPosts, setNewPost }}>
      {children}
    </FeedContext.Provider>
  );
}

export const useFeed = () => useContext(FeedContext);
