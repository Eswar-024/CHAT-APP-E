import { useNavigate } from "react-router-dom";
import {
  RiInformationLine,
  RiMoonClearLine,
  RiSettings2Line,
  RiLogoutCircleLine,
} from "react-icons/ri";
import { useSignout } from "../features/authentication/useSignout";
import { useUi } from "../contexts/UiContext";
import { useUser } from "../features/authentication/useUser";
import Loader from "./Loader";
import ToggleableContent from "./ToggleableContent";
import Menu from "./Menu";

export default function DropdownMenu() {
  const { user } = useUser();
  const displayName = user?.display_name;
  const username = user?.username;
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode, isMenuOpen, toggleMenu } = useUi();
  const { signout, isPending } = useSignout();

  function goToProfile() {
    toggleMenu();
    navigate("/profile");
  }

  return (
    <ToggleableContent
      isOpen={isMenuOpen}
      toggle={toggleMenu}
      withOverlay={false}
    >
      <Menu>
        <Menu.Header>
          <Menu.Header.Name>{displayName}</Menu.Header.Name>
          <Menu.Header.Email>@{username}</Menu.Header.Email>
        </Menu.Header>

        <Menu.List>
          <Menu.ButtonItem onClick={goToProfile}>
            <RiSettings2Line />
            <div>My Account</div>
          </Menu.ButtonItem>

          <Menu.TogglerItem isChecked={isDarkMode} toggler={toggleDarkMode}>
            <RiMoonClearLine />
            <div>Dark Mode</div>
          </Menu.TogglerItem>

          <Menu.RouteItem to={"/about"}>
            <RiInformationLine />
            <div>About</div>
          </Menu.RouteItem>

          <Menu.ButtonItem onClick={signout}>
            {isPending ? <Loader /> : <RiLogoutCircleLine />}
            <div>Sign out</div>
          </Menu.ButtonItem>
        </Menu.List>
        <Menu.Footer />
      </Menu>
    </ToggleableContent>
  );
}
