import { getCollection } from 'astro:content';

export async function GET() {
  const blog = await getCollection('blog', ({ data }) => data.draft !== true);
  const changelog = await getCollection('changelog');

  const searchIndex = [
    {
      title: 'Home',
      description: 'Ideas, tools, and experiments from Botslate.',
      slug: '/',
      type: 'Page'
    },
    {
      title: 'Notes',
      description: 'Technical notes, implementation details, and lessons from the work.',
      slug: '/blog/',
      type: 'Page'
    },
    {
      title: 'Changelog',
      description: 'Public updates and changes from Botslate.',
      slug: '/changelog/',
      type: 'Page'
    },
    {
      title: 'About Botslate',
      description: 'An independent space for software projects, experiments, tools, and technical notes.',
      slug: '/about/',
      type: 'Page'
    },
    ...blog.map(post => ({
      title: post.data.title,
      description: post.data.description,
      slug: `/blog/${post.id}`,
      type: 'Note'
    })),
    ...changelog.map(entry => ({
      title: `${entry.data.version}: ${entry.data.title}`,
      description: 'Public site update and changelog entry.',
      slug: '/changelog/',
      type: 'Changelog'
    }))
  ];

  return new Response(JSON.stringify(searchIndex), {
    headers: { 'Content-Type': 'application/json' }
  });
}
