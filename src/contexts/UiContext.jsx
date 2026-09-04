/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useReducer } from "react";
import { DARK_THEME, LIGHT_THEME, LOCAL_STORAGE_KEY } from "../config";

const UiContext = createContext();

const InitialState = {
  isSidebarOpen: false,
  isAccountViewOpen: false,
  isSearchViewOpen: false,
  isDarkMode: true,
  isFriendsSidebarOpen: false,
  isMenuOpen: false,
  searchQuery: "",
  cardSize: "standard",
  cardTheme: "rainbow",
  cardZoom: 100,
  cardAlignment: "full",
  cardShape: "rounded",
};

function reducer(state, action) {
  switch (action.type) {
    case "OPEN_SIDEBAR":
      return {
        ...state,
        isSidebarOpen: true,
      };

    case "CLOSE_SIDEBAR":
      return {
        ...state,
        isSidebarOpen: false,
      };

    case "OPEN_ACCOUNT_VIEW":
      return {
        ...state,
        isAccountViewOpen: true,
        isMenuOpen: false,
      };

    case "CLOSE_ACCOUNT_VIEW":
      return {
        ...state,
        isAccountViewOpen: false,
      };

    case "OPEN_SEARCH_VIEW":
      return {
        ...state,
        isSearchViewOpen: true,
      };

    case "CLOSE_SEARCH_VIEW":
      return {
        ...state,
        isSearchViewOpen: false,
        searchQuery: "",
      };

    case "UPDATE_DARK_MODE":
      return {
        ...state,
        isDarkMode: action.payload,
      };

    case "UPDATE_CARD_SIZE":
      return {
        ...state,
        cardSize: action.payload,
      };

    case "UPDATE_CARD_THEME":
      return {
        ...state,
        cardTheme: action.payload,
      };

    case "UPDATE_CARD_ZOOM":
      return {
        ...state,
        cardZoom: action.payload,
      };

    case "UPDATE_CARD_ALIGNMENT":
      return {
        ...state,
        cardAlignment: action.payload,
      };

    case "UPDATE_CARD_SHAPE":
      return {
        ...state,
        cardShape: action.payload,
      };

    case "CLOSE_FRIEND_SIDEBAR":
      return {
        ...state,
        isFriendsSidebarOpen: false,
      };

    case "OPEN_FRIEND_SIDEBAR":
      return {
        ...state,
        isFriendsSidebarOpen: true,
      };

    case "TOGGLE_MENU":
      return {
        ...state,
        isMenuOpen: !state.isMenuOpen,
      };

    case "UPDATE_SEARCH_QUERY":
      return {
        ...state,
        searchQuery: action.payload,
      };

    case "RESET":
      return {
        ...InitialState,
        isDarkMode: state.isDarkMode,
        cardSize: state.cardSize,
        cardTheme: state.cardTheme,
        cardZoom: state.cardZoom,
        cardAlignment: state.cardAlignment,
        cardShape: state.cardShape,
      };

    default:
      return state;
  }
}

function UiProvider({ children }) {
  const [
    {
      isSidebarOpen,
      isAccountViewOpen,
      isSearchViewOpen,
      isDarkMode,
      isFriendsSidebarOpen,
      isMenuOpen,
      searchQuery,
      cardSize,
      cardTheme,
      cardZoom,
      cardAlignment,
      cardShape,
    },
    dispatch,
  ] = useReducer(reducer, InitialState);

  function openSidebar() {
    dispatch({ type: "OPEN_SIDEBAR" });
  }

  function closeSidebar() {
    dispatch({ type: "CLOSE_SIDEBAR" });
  }

  function popAccountViewBack() {
    dispatch({ type: "CLOSE_ACCOUNT_VIEW" });
    window.removeEventListener("popstate", popAccountViewBack);
  }

  function openAccountView() {
    dispatch({ type: "OPEN_ACCOUNT_VIEW" });
    window.history.pushState(null, null, window.location.href);
    window.addEventListener("popstate", popAccountViewBack);
  }

  function closeAccountView() {
    dispatch({ type: "CLOSE_ACCOUNT_VIEW" });
    window.history.back();
    window.removeEventListener("popstate", popAccountViewBack);
  }

  function popSearchViewBack() {
    dispatch({ type: "CLOSE_SEARCH_VIEW" });
    window.removeEventListener("popstate", popSearchViewBack);
  }

  function openSearchView() {
    dispatch({ type: "OPEN_SEARCH_VIEW" });
    !isSearchViewOpen &&
      window.history.pushState(null, null, window.location.href);
    window.addEventListener("popstate", popSearchViewBack);
  }

  function closeSearchView({ back = true } = {}) {
    back && window.history.back();
    dispatch({ type: "CLOSE_SEARCH_VIEW" });
    window.removeEventListener("popstate", popSearchViewBack);
  }

  function popFriendSidebarBack() {
    dispatch({ type: "CLOSE_FRIEND_SIDEBAR" });
    window.removeEventListener("popstate", popFriendSidebarBack);
  }

  function openFriendSidebar() {
    dispatch({ type: "OPEN_FRIEND_SIDEBAR" });
    window.history.pushState(null, null, window.location.href);
    window.addEventListener("popstate", popFriendSidebarBack);
  }

  function closeFriendSidebar() {
    dispatch({ type: "CLOSE_FRIEND_SIDEBAR" });
    window.history.back();
    window.removeEventListener("popstate", popFriendSidebarBack);
  }

  function toggleMenu() {
    dispatch({ type: "TOGGLE_MENU" });
  }

  function updateSearchQuery(query) {
    dispatch({ type: "UPDATE_SEARCH_QUERY", payload: query });
  }

  function resetUi() {
    dispatch({ type: "RESET" });
  }

  function updateDarkMode(newMode) {
    dispatch({ type: "UPDATE_DARK_MODE", payload: newMode });

    if (newMode) {
      document.documentElement.classList.add(DARK_THEME);
      localStorage.setItem(LOCAL_STORAGE_KEY, DARK_THEME);
    } else {
      document.documentElement.classList.remove(DARK_THEME);
      localStorage.setItem(LOCAL_STORAGE_KEY, LIGHT_THEME);
    }
  }

  useEffect(() => {
    const userPrefersDarkMode = localStorage.getItem(LOCAL_STORAGE_KEY);
    const systemPrefersDarkMode = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    let isDark;
    if (userPrefersDarkMode) {
      isDark = userPrefersDarkMode === DARK_THEME;
    } else if (systemPrefersDarkMode) {
      isDark = systemPrefersDarkMode;
    } else {
      isDark = false;
    }

    updateDarkMode(isDark);

    const savedSize = localStorage.getItem("card_size");
    if (savedSize) {
      dispatch({ type: "UPDATE_CARD_SIZE", payload: savedSize });
    }

    const savedTheme = localStorage.getItem("card_theme");
    if (savedTheme) {
      dispatch({ type: "UPDATE_CARD_THEME", payload: savedTheme });
    }

    const savedZoom = localStorage.getItem("card_zoom");
    if (savedZoom) {
      dispatch({ type: "UPDATE_CARD_ZOOM", payload: Number(savedZoom) });
    }

    const savedAlign = localStorage.getItem("card_alignment");
    if (savedAlign) {
      dispatch({ type: "UPDATE_CARD_ALIGNMENT", payload: savedAlign });
    }

    const savedShape = localStorage.getItem("card_shape");
    if (savedShape) {
      dispatch({ type: "UPDATE_CARD_SHAPE", payload: savedShape });
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    updateDarkMode(newMode);
  };

  const setCardSize = (size) => {
    dispatch({ type: "UPDATE_CARD_SIZE", payload: size });
    localStorage.setItem("card_size", size);
  };

  const setCardTheme = (theme) => {
    dispatch({ type: "UPDATE_CARD_THEME", payload: theme });
    localStorage.setItem("card_theme", theme);
  };

  const setCardZoom = (zoomVal) => {
    const clamped = Math.max(70, Math.min(140, Number(zoomVal)));
    dispatch({ type: "UPDATE_CARD_ZOOM", payload: clamped });
    localStorage.setItem("card_zoom", String(clamped));
  };

  const setCardAlignment = (align) => {
    dispatch({ type: "UPDATE_CARD_ALIGNMENT", payload: align });
    localStorage.setItem("card_alignment", align);
  };

  const setCardShape = (shape) => {
    dispatch({ type: "UPDATE_CARD_SHAPE", payload: shape });
    localStorage.setItem("card_shape", shape);
  };

  const value = {
    dispatch,

    isAccountViewOpen,
    openAccountView,
    closeAccountView,

    isSidebarOpen,
    openSidebar,
    closeSidebar,

    isSearchViewOpen,
    openSearchView,
    closeSearchView,

    isDarkMode,
    toggleDarkMode,

    cardSize,
    setCardSize,

    cardTheme,
    setCardTheme,

    cardZoom,
    setCardZoom,

    cardAlignment,
    setCardAlignment,

    cardShape,
    setCardShape,

    isFriendsSidebarOpen,
    closeFriendSidebar,
    openFriendSidebar,

    isMenuOpen,
    toggleMenu,

    searchQuery,
    updateSearchQuery,

    resetUi,
  };

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

function useUi() {
  const context = useContext(UiContext);
  if (context === undefined)
    throw new Error("UiContext was used outside the UiProvider");
  return context;
}

export { UiProvider, useUi };
