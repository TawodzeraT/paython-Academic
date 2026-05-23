import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middleware/auth.middleware';

// We'll use a simple blog stored as a JSON approach with a BlogPost model
// Add this to schema.prisma first (see note below)

// For now we'll use a simple in-memory store approach
// Add the BlogPost model to your Prisma schema

export const getPosts = async (req: Request, res: Response): Promise<void> => {
  try {
    const posts = await (prisma as any).blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, title: true, slug: true,
        excerpt: true, thumbnail: true,
        createdAt: true, readTime: true,
        tags: true,
      },
    });
    res.json({ posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch posts.' });
  }
};

export const getPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const post = await (prisma as any).blogPost.findUnique({
      where: { slug },
    });
    if (!post || !post.published) {
      res.status(404).json({ error: 'Post not found.' });
      return;
    }
    res.json({ post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch post.' });
  }
};

export const createPost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, slug, excerpt, content, thumbnail, tags, published, readTime } = req.body;
    const post = await (prisma as any).blogPost.create({
      data: {
        title, slug, excerpt, content,
        thumbnail, tags: tags ?? [],
        published: published ?? false,
        readTime: readTime ?? 5,
        authorId: req.user!.userId,
      },
    });
    res.status(201).json({ post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create post.' });
  }
};

export const updatePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    const post = await (prisma as any).blogPost.update({
      where: { id: postId },
      data: req.body,
    });
    res.json({ post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update post.' });
  }
};

export const deletePost = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    await (prisma as any).blogPost.delete({ where: { id: postId } });
    res.json({ message: 'Post deleted.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete post.' });
  }
};
