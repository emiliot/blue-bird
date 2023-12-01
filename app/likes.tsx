"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

export default function Likes({
  tweet,
  addOptimisticTweet,
}: {
  tweet: TweetWithAuthor;
  addOptimisticTweet: (tweet: TweetWithAuthor) => void;
}) {
  const router = useRouter();

  const handleLikes = async () => {
    const supabase = createClientComponentClient<Database>();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      if (tweet.user_has_liked_tweet) {
        addOptimisticTweet({
          ...tweet,
          user_has_liked_tweet: false,
          likes: tweet.likes - 1,
        });

        await supabase
          .from("likes")
          .delete()
          .match({ user_id: user.id, tweet_id: tweet.id });
      } else {
        addOptimisticTweet({
          ...tweet,
          user_has_liked_tweet: true,
          likes: tweet.likes + 1,
        });

        await supabase
          .from("likes")
          .insert({ user_id: user.id, tweet_id: tweet.id });
      }
      router.refresh();
    }
  };

  return (
    <form action={handleLikes}>
      <button type="submit">{tweet.likes} Likes</button>
    </form>
  );
}
