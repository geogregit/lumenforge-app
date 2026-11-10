'use client'
export default function Notifications() {
  const notifications = [
    { id: 1, title: 'New version available', message: 'LumenForge has been updated with a cleaner dashboard and new features.', time: 'Just now', type: 'update' },
    { id: 2, title: 'App request approved', message: 'Your request for Slack has been approved and will appear on the dashboard soon.', time: '2 hours ago', type: 'request' },
    { id: 3, title: 'Suggestion received', message: 'Thanks for your feedback! We’re looking into it.', time: '1 day ago', type: 'suggestion' },
  ]

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6">
      <h1 className="text-2xl font-semibold mb-6 text-gray-900">Notifications</h1>
      <div className="space-y-4">
        {notifications.map(n => (
          <div key={n.id} className="bg-white border rounded-lg p-4">
            <div className="flex justify-between items-start">
              <h2 className="font-medium text-gray-900">{n.title}</h2>
              <span className="text-xs text-gray-500">{n.time}</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">{n.message}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
