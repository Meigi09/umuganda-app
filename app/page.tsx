import { Feed } from "@/src/components"


export default function Home() {
  // Mock data - in a real app, this would come from the API
  const mockPosts = [
    {
      id: '1',
      content: 'Our cell cleaned the community water point. Great work everyone! 💪',
      author: {
        id: 'user-1',
        name: 'Jean Mukiza',
        email: 'jean@example.com',
      },
      cell: {
        name: 'Kigali Cell',
      },
      category: 'CLEANING',
      images: [],
      reactions: [{ type: 'LIKE', id: '1' }],
      comments: [],
      reposts: [],
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      content: 'Built a new learning center for children in the neighborhood. Education is key! 📚',
      author: {
        id: 'user-2',
        name: 'Claude Nyarugaba',
        email: 'claude@example.com',
      },
      cell: {
        name: 'Gasabo Cell',
      },
      category: 'CONSTRUCTION',
      images: [],
      reactions: [],
      comments: [],
      reposts: [],
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
  ]

  return (
    <div className="py-8">
      <div className="max-w-4xl mx-auto px-4 mb-8">
        <div className="bg-gradient-to-r from-lime-moss to-green text-white rounded-lg p-8">
          <h2 className="text-3xl font-bold mb-3">Welcome to Umuganda</h2>
          <p className="text-lg opacity-90">
            Share your community impact, celebrate achievements, and inspire others.
            Together, let&apos;s build a stronger Rwanda through transparent impact tracking.
          </p>
          <button className="mt-6 bg-white text-lime-moss font-bold py-2 px-6 rounded-lg hover:bg-gray-100 transition-colors">
            Share Your Work
          </button>
        </div>
      </div>

      <Feed
        posts={mockPosts}
        hasMore={true}
        onLoadMore={() => {
          console.log('Load more posts')
        }}
      />
    </div>
  )
}