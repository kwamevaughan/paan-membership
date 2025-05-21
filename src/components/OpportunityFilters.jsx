import { Icon } from "@iconify/react";

export default function OpportunityFilters({
  filterTerm,
  setFilterTerm,
  filterType,
  setFilterType,
  showFilters,
  setShowFilters,
  sortOrder,
  setSortOrder,
  mode,
}) {
  return (
    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative rounded-xl shadow-sm flex-grow max-w-md">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Icon
              icon="heroicons:magnifying-glass"
              className="h-5 w-5 text-gray-400"
            />
          </div>
          <input
            type="text"
            value={filterTerm}
            onChange={(e) => setFilterTerm(e.target.value)}
            className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-11 pr-4 py-3 sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-xl ${
              mode === "dark" ? "placeholder-gray-400" : "placeholder-gray-500"
            }`}
            placeholder="Search opportunities..."
          />
        </div>

        <div className="flex space-x-3 items-center">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border ${
              showFilters
                ? "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-200 dark:border-indigo-800"
                : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200"
            } hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors shadow-sm`}
          >
            <Icon icon="heroicons:funnel" className="w-5 h-5" />
            <span>Filters</span>
            <Icon
              icon={showFilters ? "heroicons:chevron-up" : "heroicons:chevron-down"}
              className="w-4 h-4"
            />
          </button>

          <div className="relative">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="appearance-none inline-flex justify-center shadow-sm px-4 py-2.5 bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-8"
            >
              <option value="deadline">Sort by Deadline</option>
              <option value="title">Sort by Title</option>
              <option value="tier">Sort by Tier</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
              <Icon icon="heroicons:chevron-down" className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Service Type
            </label>
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="appearance-none w-full px-4 py-2.5 rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pr-8"
              >
                <option value="all">All Services</option>
                <option value="Marketing">Marketing</option>
                <option value="Communications">Communications</option>
                <option value="Tech">Tech</option>
                <option value="Design">Design</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <Icon icon="heroicons:chevron-down" className="h-4 w-4" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Industry
            </label>
            <div className="relative">
              <select className="appearance-none w-full px-4 py-2.5 rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pr-8">
                <option value="">All Industries</option>
                <option value="Tech">Tech</option>
                <option value="Education">Education</option>
                <option value="Retail">Retail</option>
                <option value="Health">Health</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <Icon icon="heroicons:chevron-down" className="h-4 w-4" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Project Type
            </label>
            <div className="relative">
              <select className="appearance-none w-full px-4 py-2.5 rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pr-8">
                <option value="">All Projects</option>
                <option value="Advertising Campaign">Advertising Campaign</option>
                <option value="Software Development">Software Development</option>
                <option value="Consulting">Consulting</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <Icon icon="heroicons:chevron-down" className="h-4 w-4" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Deadline
            </label>
            <div className="relative">
              <select className="appearance-none w-full px-4 py-2.5 rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 pr-8">
                <option value="">Any Time</option>
                <option value="urgent">Urgent (&lt; 7 days)</option>
<option value="soon">Soon (&lt; 14 days)</option>
<option value="future">Future (&gt; 14 days)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                <Icon icon="heroicons:chevron-down" className="h-4 w-4" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
