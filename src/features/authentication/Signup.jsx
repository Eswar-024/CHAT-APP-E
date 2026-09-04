import {
  APP_NAME,
  MAX_BIO_LENGTH,
  MAX_NAME_LENGTH,
  MAX_USERNAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  MIN_USERNAME_LENGTH,
  NAME_REGEX,
  USERNAME_REGEX,
} from "../../config";
import { useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { useEffect } from "react";
import { useSignup } from "./useSignup";
import { useUser } from "./useUser";
import Loader from "../../components/Loader";
import MainContainer from "../../components/MainContainer";
import FormContainer from "../../components/FormContainer";
import InputBox from "../../components/InputBox";
import SubmitBtn from "../../components/SubmitBtn";
import TextLink from "../../components/TextLink";
import LogoLarge from "../../components/LogoLarge";
import { FiUser, FiAtSign, FiLock, FiCheckCircle, FiFileText } from "react-icons/fi";

function Signup() {
  document.title = `${APP_NAME} - Sign up`;
  const { signup, isPending } = useSignup();
  const { isAuthenticated, isLoading } = useUser();
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors },
    trigger,
    setError,
    getValues,
  } = useForm({
    defaultValues: {
      display_name: "",
      username: "",
      password: "",
      confirmPassword: "",
      bio: "",
    },
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/chat", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const onSubmit = ({ display_name, username, password, bio }) => {
    signup(
      {
        display_name: display_name.trim(),
        username: username.trim(),
        password,
        bio: bio?.trim() || undefined,
      },
      {
        onSuccess: () => {
          navigate("/chat", { replace: true });
        },
        onError: (error) => {
          if (error.status === 409) {
            setError("username", {
              type: "server",
              message: error.message,
            });
          }
        },
      },
    );
  };

  return (
    <MainContainer>
      <div className="view-enter relative z-10 w-full max-w-md px-3 py-6" data-motion="auth">
        <FormContainer onSubmit={handleSubmit(onSubmit)}>
          <LogoLarge />

          <div className="mb-6 text-center">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Create your account
            </h1>
            <p className="mt-1 text-xs font-semibold text-slate-800 sm:text-sm">
              Join {APP_NAME} and start chatting.
            </p>
          </div>

          <div className="space-y-1">
            <Controller
              name="display_name"
              control={control}
              rules={{
                required: "Enter your display name.",
                pattern: {
                  value: NAME_REGEX,
                  message: "Only letters, numbers, and single spaces allowed.",
                },
                maxLength: {
                  value: MAX_NAME_LENGTH,
                  message: `Maximum ${MAX_NAME_LENGTH} characters allowed.`,
                },
              }}
              render={({ field }) => (
                <InputBox
                  type="text"
                  label="Display name"
                  icon={FiUser}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={() => trigger("display_name")}
                  placeholder="e.g. Alex Smith"
                  htmlFor="display_name"
                  autoComplete="name"
                  error={errors.display_name?.message}
                  disabled={isPending}
                />
              )}
            />

            <Controller
              name="username"
              control={control}
              rules={{
                required: "Please enter a username.",
                pattern: {
                  value: USERNAME_REGEX,
                  message:
                    "Only letters, numbers, underscores, and dashes allowed.",
                },
                minLength: {
                  value: MIN_USERNAME_LENGTH,
                  message: `Minimum ${MIN_USERNAME_LENGTH} characters required.`,
                },
                maxLength: {
                  value: MAX_USERNAME_LENGTH,
                  message: `Maximum ${MAX_USERNAME_LENGTH} characters allowed.`,
                },
              }}
              render={({ field }) => (
                <InputBox
                  type="text"
                  label="Username"
                  icon={FiAtSign}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={() => trigger("username")}
                  placeholder="e.g. alex_smith"
                  htmlFor="username"
                  autoComplete="username"
                  error={errors.username?.message}
                  disabled={isPending}
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              rules={{
                required: "Enter a password.",
                minLength: {
                  value: MIN_PASSWORD_LENGTH,
                  message: `Minimum ${MIN_PASSWORD_LENGTH} characters required.`,
                },
              }}
              render={({ field }) => (
                <InputBox
                  type="password"
                  label="Password"
                  icon={FiLock}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={() => trigger("password")}
                  placeholder="At least 8 characters"
                  htmlFor="password"
                  autoComplete="new-password"
                  error={errors.password?.message}
                  disabled={isPending}
                />
              )}
            />

            <Controller
              name="confirmPassword"
              control={control}
              rules={{
                required: "Confirm your password.",
                validate: (value) =>
                  value === getValues().password || "Passwords don't match.",
              }}
              render={({ field }) => (
                <InputBox
                  type="password"
                  label="Confirm password"
                  icon={FiCheckCircle}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={() => trigger("confirmPassword")}
                  placeholder="Re-enter your password"
                  htmlFor="confirmPassword"
                  autoComplete="new-password"
                  error={errors.confirmPassword?.message}
                  disabled={isPending}
                />
              )}
            />

            <Controller
              name="bio"
              control={control}
              rules={{
                maxLength: {
                  value: MAX_BIO_LENGTH,
                  message: `Maximum ${MAX_BIO_LENGTH} characters allowed.`,
                },
              }}
              render={({ field }) => (
                <InputBox
                  type="text"
                  label="Bio (optional)"
                  icon={FiFileText}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={() => trigger("bio")}
                  placeholder="Say something about yourself..."
                  htmlFor="bio"
                  error={errors.bio?.message}
                  disabled={isPending}
                />
              )}
            />
          </div>

          <SubmitBtn disabled={isPending} type="submit">
            {isPending ? (
              <div className="flex items-center justify-center gap-2">
                <Loader size="small" />
                <span>Creating Account...</span>
              </div>
            ) : (
              <span>Create Account</span>
            )}
          </SubmitBtn>

          <p className="mt-6 text-center text-xs font-semibold text-slate-900 sm:text-sm">
            Already have an account?{" "}
            <TextLink to="/signin" addClass="font-bold text-indigo-900 underline hover:text-indigo-950">
              Sign in
            </TextLink>
          </p>
        </FormContainer>
      </div>
    </MainContainer>
  );
}

export default Signup;
