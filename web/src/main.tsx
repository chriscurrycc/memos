import "@github/relative-time-element";
import { CssVarsProvider } from "@mui/joy";
import "@usememos/mui/dist/index.css";
import "leaflet/dist/leaflet.css";
import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import "react-photo-view/dist/react-photo-view.css";
import { Provider } from "react-redux";
import { RouterProvider } from "react-router-dom";
import "./css/tailwind.css";
import "./helpers/polyfill";
import "./i18n";
import { PortalDialogProvider, usePortalDialog } from "./components/Dialog/PortalDialogManager";
import { setGlobalDialogManager } from "./components/Dialog/showZenModeDialogHelper";
import CommonContextProvider from "./layouts/CommonContextProvider";
import "./less/highlight.less";
import router from "./router";
import store from "./store";
import theme from "./theme";

(async () => {
  const container = document.getElementById("root");
  const root = createRoot(container as HTMLElement);

  // Initialize the portal dialog manager
  const DialogManagerInitializer = () => {
    const { openDialog, closeDialog } = usePortalDialog();

    // Set the global dialog manager for imperative API
    useEffect(() => {
      setGlobalDialogManager({ openDialog, closeDialog });
    }, [openDialog, closeDialog]);

    return null;
  };

  root.render(
    <Provider store={store}>
      <CssVarsProvider theme={theme}>
        <CommonContextProvider>
          <PortalDialogProvider>
            <DialogManagerInitializer />
            <RouterProvider router={router} />
          </PortalDialogProvider>
        </CommonContextProvider>
        <Toaster position="top-right" toastOptions={{ className: "dark:bg-zinc-700 dark:text-gray-300" }} />
      </CssVarsProvider>
    </Provider>,
  );
})();
