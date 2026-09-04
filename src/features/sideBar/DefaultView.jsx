import { useUi } from "../../contexts/UiContext";
import SearchView from "../userSearch/SearchView";
import Header from "./Header";
import SearchBox from "./SearchBox";
import UsersView from "./UsersView";
import Footer from "../../components/Footer";

function DefaultView() {
  const { isSearchViewOpen } = useUi();

  return (
    <div className="w-full flex flex-col justify-between px-4 sm:px-6 md:px-8 py-4 sm:py-6">
      <div className="flex-1 flex flex-col justify-start w-full">
        <Header />
        <SearchBox />
        <div className="w-full flex-1 min-h-[300px]">
          <div
            key={isSearchViewOpen ? "search" : "inbox"}
            className="view-enter view-enter--fast w-full"
            data-motion="inbox"
          >
            {isSearchViewOpen ? <SearchView /> : <UsersView />}
          </div>
        </div>
      </div>

      {/* Large distance before footer so footer is only visible after scrolling down */}
      <div className="mt-[650px]">
        <Footer />
      </div>
    </div>
  );
}

export default DefaultView;
