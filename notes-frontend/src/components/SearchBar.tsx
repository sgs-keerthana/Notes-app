type SearchBarProps = {
  searchTerm: string;
  onSearch: (value: string) => void;
};

function SearchBar({ searchTerm, onSearch }: SearchBarProps) {
  return (
    <div className="mb-6">
      <input
        type="text"
        placeholder="Search notes..."
        value={searchTerm}
        onChange={(e) => onSearch(e.target.value)}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none focus:border-blue-500"
      />
    </div>
  );
}

export default SearchBar;