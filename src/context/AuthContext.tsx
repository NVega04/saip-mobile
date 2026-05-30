import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getMe, UserProfile } from "../api/client";

interface AuthContextType {
  currentUser: UserProfile | null;
  loading: boolean;
  setCurrentUser: (user: UserProfile | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  loading: true,
  setCurrentUser: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = await AsyncStorage.getItem("session_token");
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
      if (!token) {
        setLoading(false);
        return;
      }
      getMe()
        .then((me) => {
          if (me) {
            setCurrentUser(me);
            AsyncStorage.setItem("user", JSON.stringify(me));
          }
        })
        .finally(() => setLoading(false));
    };
    init();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loading, setCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
