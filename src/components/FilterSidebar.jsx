import { useState } from "react";

const FilterSidebar = () => {
    const [isGenreOpen, setIsGenreOpen] = useState(false);
    const [isConditionOpen, setIsConditionOpen] = useState(false);

    return (
        <form className="p-4 bg-white shadow-md w-full flex flex-col h-full">
            <div className="space-y-4 flex-grow">
                {/* Genre Dropdown */}
                <div>
                    <button
                        type="button"
                        onClick={() => setIsGenreOpen(!isGenreOpen)}
                        className="w-full text-left p-2 border border-gray-300 rounded-lg bg-gray-100 hover:bg-gray-200"
                    >
                        Genre {isGenreOpen ? "▲" : "▼"}
                    </button>
                    {isGenreOpen && (
                        <div className="mt-2 space-y-2">
                            <label className="flex items-center space-x-2">
                                <input type="checkbox" id="genre1" className="rounded border-gray-300 text-blue-500 focus:ring-blue-400" />
                                <span>Humor</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input type="checkbox" id="genre2" className="rounded border-gray-300 text-blue-500 focus:ring-blue-400" />
                                <span>Romance novel</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input type="checkbox" id="genre3" className="rounded border-gray-300 text-blue-500 focus:ring-blue-400" />
                                <span>Satire</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input type="checkbox" id="genre4" className="rounded border-gray-300 text-blue-500 focus:ring-blue-400" />
                                <span>Science Fiction</span>
                            </label>
                            <label className="flex items-center space-x-2">
                                <input type="checkbox" id="genre5" className="rounded border-gray-300 text-blue-500 focus:ring-blue-400" />
                                <span>Fantasy</span>
                            </label>
                        </div>
                    )}
                </div>
            </div>

            <button
                type="submit"
                className="w-full bg-blue-500 text-white font-medium px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
            >
                Apply Filters
            </button>
        </form>
    );
};

export default FilterSidebar;