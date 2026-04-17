import  { createContext, useContext, useState, ReactNode } from "react";

interface SuperAdmin {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  phone2?: string;
  address: string;
  pin_code: string;
  state: string;
  city: string;
  country: string;
  profile_picture?: string;
}

interface SuperAdminContextProps {
  admin: SuperAdmin | null;
  setAdmin: (admin: SuperAdmin) => void;
}

const SuperAdminContext = createContext<SuperAdminContextProps | undefined>(undefined);

export const useSuperAdmin = (): SuperAdminContextProps => {
  const context = useContext(SuperAdminContext);
  if (!context) {
    throw new Error("useSuperAdmin must be used within a SuperAdminProvider");
  }
  return context;
};

export const SuperAdminProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<SuperAdmin | null>(null);

  return (
    <SuperAdminContext.Provider value={{ admin, setAdmin }}>
      {children}
    </SuperAdminContext.Provider>
  );
};