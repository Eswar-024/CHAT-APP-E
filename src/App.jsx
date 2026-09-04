import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./styles/index.css";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Signup from "./features/authentication/Signup";
import Signin from "./features/authentication/Signin";
import MessageView from "./features/messageArea/MessageView";
import DefaultView from "./features/sideBar/DefaultView";
import ProfilePage from "./features/userProfile/ProfilePage";
import { UiProvider } from "./contexts/UiContext";
import NotFound from "./components/NotFound";
import { Toaster } from "react-hot-toast";
import AllRoutesWrapper from "./components/AllRoutesWrapper";
import AboutPage from "./components/AboutPage";
import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsOfService from "./components/TermsOfService";

const queryClient = new QueryClient();

/*
 * Copyright [2024] [Al-Amin]
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

function App() {
  return (
    <UiProvider>
      <QueryClientProvider client={queryClient}>
        <Toaster
          position="top-center"
          gutter={10}
          toastOptions={{
            className: "app-toast",
            duration: 3200,
            success: {
              duration: 2600,
            },
            error: {
              duration: 5000,
            },
            style: {
              maxWidth: "min(500px, calc(100vw - 2rem))",
            },
          }}
        />

        <BrowserRouter>
          <AllRoutesWrapper>
            <Routes>
              <Route path="/" element={<Navigate to="/signin" replace />} />
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/chat" element={<DefaultView />} />
                <Route path="/chat/:userId" element={<MessageView />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>

              <Route path="signup" element={<Signup />} />
              <Route path="signin" element={<Signin />} />
              <Route path="login" element={<Signin />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="privacy" element={<PrivacyPolicy />} />
              <Route path="terms" element={<TermsOfService />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AllRoutesWrapper>
        </BrowserRouter>
      </QueryClientProvider>
    </UiProvider>
  );
}

export default App;
