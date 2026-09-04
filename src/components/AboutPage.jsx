import { Link } from "react-router-dom";
import MainContainer from "./MainContainer";
import { APP_NAME } from "../config";

const AboutPage = () => {
  return (
    <MainContainer>
      <div className="mx-auto max-w-4xl px-4 py-8 leading-relaxed">
        <h1 className="mb-6 text-center text-3xl font-bold">{APP_NAME}</h1>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">About</h2>
          <p>
            {APP_NAME} is a real-time messaging application with secure
            authentication, profiles, and private conversations.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">Attribution</h2>
          <p>
            This application is derived from an Apache License 2.0 open-source
            chat project originally created by Alamin. Original copyright
            notices are retained. This is not a claim that the original code was
            written entirely by the current operators.
          </p>
        </section>

        <section className="mb-8 flex flex-wrap gap-3">
          <Link
            to="/privacy"
            className="rounded-lg bg-gray-800 px-6 py-3 text-white hover:bg-gray-700"
          >
            Privacy Policy
          </Link>
          <Link
            to="/terms"
            className="rounded-lg bg-textAccent px-6 py-3 text-white hover:bg-textAccentDim dark:bg-textAccentDim dark:hover:bg-textAccentDim-dark"
          >
            Terms of Service
          </Link>
        </section>

        <footer className="mt-6 text-center text-sm opacity-70">
          <p>
            © Copyright by Alamin. Licensed under the Apache License 2.0.
          </p>
        </footer>
      </div>
    </MainContainer>
  );
};

export default AboutPage;
