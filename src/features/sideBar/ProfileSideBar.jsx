import { useUi } from "../../contexts/UiContext";
import { HiOutlineUserCircle } from "react-icons/hi2";
import ToggleableContent from "../../components/ToggleableContent";
import IconButton from "../../components/IconButton";

function ProfileSideBar({ friend }) {
  const { avatar_url, display_name, fullname, username, bio } = friend ?? {};
  const name = display_name || fullname;
  const { closeFriendSidebar, isFriendsSidebarOpen } = useUi();

  function handleCloseBar() {
    isFriendsSidebarOpen && closeFriendSidebar();
  }

  return (
    <ToggleableContent isOpen={isFriendsSidebarOpen} toggle={handleCloseBar}>
      <div
        className={`${
          isFriendsSidebarOpen
            ? "visible right-0 opacity-100"
            : "invisible -right-full opacity-0"
        } absolute top-0 z-30 grid h-screen-safe w-[min(80%,21rem)] max-w-full grid-rows-[auto_minmax(0,1fr)] overflow-hidden bg-bgPrimary opacity-0 shadow-[-10px_0px_15px_-3px_rgba(0,0,0,0.1),-10px_0px_6px_-2px_rgba(0,0,0,0.05)] transition-all duration-500 ease-[cubic-bezier(.15,.72,.08,.99)] dark:bg-bgPrimary-dark sm:w-[21rem]`}
      >
        <div className="flex h-16 items-center justify-start gap-4 bg-LightShade/10 p-2">
          <IconButton onClick={handleCloseBar} label="Close profile">
            <IconButton.Close />
          </IconButton>
          <p className="select-none font-bold tracking-wider">Profile</p>
        </div>

        <div className="min-h-0 overflow-y-auto overflow-x-hidden p-6 sm:p-10">
          <div className="mx-auto mt-4 h-36 w-36 overflow-hidden rounded-full border-2 border-bgAccent dark:border-bgAccent-dark sm:h-52 sm:w-52">
            {avatar_url ? (
              <img
                className="pointer-events-none h-full w-full object-cover object-center"
                src={avatar_url}
                alt={name}
              />
            ) : (
              <HiOutlineUserCircle
                className="h-full w-full opacity-50"
                strokeWidth="1"
              />
            )}
          </div>

          <div className="mt-8">
            <p className="select-none  text-sm font-bold tracking-wider text-textAccent opacity-80 dark:text-textAccent-dark">
              Name
            </p>
            <p className="truncate text-base">{name}</p>
          </div>

          <div className="mt-4">
            <p className="select-none text-sm font-bold tracking-wider text-textAccent  opacity-80 dark:text-textAccent-dark">
              Username
            </p>
            <p className="truncate text-base">{username}</p>
          </div>

          {bio && (
            <div className="mt-4">
              <p className="select-none text-sm font-bold tracking-wider text-textAccent  opacity-80 dark:text-textAccent-dark">
                Bio
              </p>
              <p className="break-all text-base">{bio}</p>
            </div>
          )}
        </div>
      </div>
    </ToggleableContent>
  );
}

export default ProfileSideBar;
