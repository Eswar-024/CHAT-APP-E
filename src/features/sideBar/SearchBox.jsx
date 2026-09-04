import { RiSearchLine } from "react-icons/ri";
import { useEffect, useRef } from "react";
import { useUi } from "../../contexts/UiContext";

function SearchBox() {
  const { isSearchViewOpen, openSearchView, searchQuery, updateSearchQuery } =
    useUi();
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (!isSearchViewOpen && searchInputRef.current) {
      searchInputRef.current.blur();
    }
  }, [isSearchViewOpen]);

  return (
    <div className="relative mb-6 w-full">
      <label htmlFor="searchPeople" className="sr-only">
        Search people
      </label>
      <div className="relative flex items-center">
        <span className="pointer-events-none absolute left-4 text-slate-900 dark:text-slate-200">
          <RiSearchLine className="h-5 w-5" aria-hidden="true" />
        </span>
        <input
          id="searchPeople"
          className="w-full rounded-2xl border-2 border-slate-900 bg-white dark:bg-slate-900 py-3.5 pl-12 pr-4 text-sm font-semibold text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 shadow-[2px_3px_0px_rgba(15,23,42,1)] transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-slate-900/20 hover:shadow-[3px_4px_0px_rgba(15,23,42,1)]"
          value={searchQuery}
          onChange={(e) => updateSearchQuery(e.target.value)}
          type="text"
          onClick={() => openSearchView()}
          placeholder="Search people"
          aria-label="Search people"
          ref={searchInputRef}
        />
      </div>
    </div>
  );
}

export default SearchBox;
