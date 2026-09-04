import { useUi } from "../../contexts/UiContext";
import Avatar from "./Avatar";
import { useUser } from "../authentication/useUser";
import IconButton from "../../components/IconButton";
import InfoField from "./InfoField";
import {
  MAX_NAME_LENGTH,
  MIN_USERNAME_LENGTH,
  MAX_USERNAME_LENGTH,
  MAX_BIO_LENGTH,
  NAME_REGEX,
  USERNAME_REGEX,
} from "../../config";

function MyAccountView() {
  const { user } = useUser();
  const { closeAccountView } = useUi();

  if (!user) return null;

  const { display_name, username, bio, avatar_url } = user;

  return (
    <div className="fadeIn grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] bg-bgPrimary dark:bg-bgPrimary-dark">
      <div className="flex h-16 items-center justify-start gap-4 bg-LightShade/10 p-2">
        <IconButton onClick={closeAccountView} label="Back">
          <IconButton.Back />
        </IconButton>
        <p className="select-none font-bold tracking-wider">Profile</p>
      </div>

      <div tabIndex={-1} className="min-h-0 overflow-y-auto overflow-x-hidden p-4 sm:p-10">
        <Avatar avatar={avatar_url} />

        <InfoField
          label="Name"
          oldValue={display_name}
          updateKey="display_name"
          maxLength={MAX_NAME_LENGTH}
          regex={NAME_REGEX}
          patternMessage="Only letters, numbers, and single spaces are allowed."
        />

        <InfoField
          label="Username"
          oldValue={username}
          updateKey="username"
          minLength={MIN_USERNAME_LENGTH}
          maxLength={MAX_USERNAME_LENGTH}
          regex={USERNAME_REGEX}
          patternMessage="Only letters, numbers, underscores, and dashes are allowed."
        />

        <InfoField
          label="Bio"
          oldValue={bio || ""}
          updateKey="bio"
          maxLength={MAX_BIO_LENGTH}
        />
      </div>
    </div>
  );
}

export default MyAccountView;
