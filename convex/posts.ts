import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

export const generateUploadUrl = mutation(async (ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Unauthorized');
  return await ctx.storage.generateUploadUrl();
});

export const createPost = mutation({
  args: {
    storageId: v.optional(v.id('_storage')),
    caption: v.string(),
  },
  handler: async (ctx, args) => {
    // GUARD TO MAKE SURE YOU ARE AUTHENTICATED
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error('Unauthorized');

    // GET THE CURRENT AUTHENTICATED USER ON THE DEVICE
    const currentUser = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
      .first();

    if (!currentUser) throw new Error('User not found');

    const imageUrl = await ctx.storage.getUrl(args.storageId!);
    if (!imageUrl) throw new Error('Image not found');

    // CREATE POST
    const postId = await ctx.db.insert('posts', {
      userId: currentUser._id,
      imageUrl,
      storageId: args.storageId,
      caption: args.caption,
      likes: 0,
      comments: 0,
    });

    // increment post amount of user by 1

    await ctx.db.patch(currentUser._id, {
      posts: currentUser.posts + 1,
    });

    return postId;
  },
});
