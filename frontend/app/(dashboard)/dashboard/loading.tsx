export default function DashboardLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-1/3" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800" />
        ))}
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-52 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800" />
        ))}
      </div>
    </div>
  );
}
