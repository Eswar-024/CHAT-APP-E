import { useEffect } from "react";
import { useSignin } from "./useSignin";
import Loader from "../../components/Loader";
import { useUser } from "./useUser";
import InputBox from "../../components/InputBox";
import TextLink from "../../components/TextLink";
import SubmitBtn from "../../components/SubmitBtn";
import MainContainer from "../../components/MainContainer";
import { useNavigate } from "react-router-dom";
import FormContainer from "../../components/FormContainer";
import { Controller, useForm } from "react-hook-form";
import LogoLarge from "../../components/LogoLarge";
import { APP_NAME } from "../../config";
import { FiAtSign, FiLock } from "react-icons/fi";

function Signin() {
  document.title = `${APP_NAME} - Sign in`;
  const { signin, isPending } = useSignin();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useUser();

  const {
    control,
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/chat", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const onSubmit = ({ username, password }) => {
    if (!username || !password) return;

    signin(
      { username: username.trim(), password },
      {
        onSuccess: () => {
          navigate("/chat", { replace: true });
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
              Welcome back!
            </h1>
            <p className="mt-1 text-xs font-semibold text-slate-800 sm:text-sm">
              Good to see you again.
            </p>
          </div>

          <div className="space-y-1">
            <Controller
              name="username"
              control={control}
              rules={{ required: "Enter your username." }}
              render={({ field }) => (
                <InputBox
                  type="text"
                  label="Username"
                  icon={FiAtSign}
                  value={field.value || ""}
                  onChange={field.onChange}
                  placeholder="Username"
                  htmlFor="username"
                  autoComplete="username"
                  error={errors.username?.message}
                  onBlur={() => trigger("username")}
                  disabled={isPending}
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              rules={{ required: "Enter your password." }}
              render={({ field }) => (
                <InputBox
                  type="password"
                  label="Password"
                  icon={FiLock}
                  value={field.value || ""}
                  onChange={field.onChange}
                  placeholder="Password"
                  htmlFor="password"
                  autoComplete="current-password"
                  error={errors.password?.message}
                  onBlur={() => trigger("password")}
                  disabled={isPending}
                />
              )}
            />
          </div>

          <SubmitBtn disabled={isPending}>
            {isPending ? (
              <div className="flex items-center justify-center gap-2">
                <Loader size="small" />
                <span>Signing In...</span>
              </div>
            ) : (
              <span>Sign In</span>
            )}
          </SubmitBtn>

          <p className="mt-6 text-center text-xs font-semibold text-slate-900 sm:text-sm">
            Don&apos;t have an account?{" "}
            <TextLink to="/signup" addClass="font-bold text-indigo-900 underline hover:text-indigo-950">
              Sign up
            </TextLink>
          </p>
        </FormContainer>
      </div>
    </MainContainer>
  );
}

export default Signin;
