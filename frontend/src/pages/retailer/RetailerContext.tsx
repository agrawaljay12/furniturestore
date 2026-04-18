import  { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

interface Retailer {
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

interface RetailerContextProps {
  retailer: Retailer | null;
  setRetailer: (retailer: Retailer | null) => void;
}

const RetailerContext = createContext<RetailerContextProps | undefined>(undefined);

export const RetailerProvider = ({ children }: { children: ReactNode }) => {
  const [retailer, setRetailer] = useState<Retailer | null>(null);

  useEffect(() => {
    const fetchRetailerDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Token is missing");
          return;
        }

        const response = await axios.get(
          `https://furnspace.onrender.com/api/v1/auth/user/fetch/${token}`
        );

        if (response.data && response.data.data) {
          setRetailer(response.data.data);
        } else {
          console.error("No retailer data returned from server.");
        }
      } catch (error) {
        console.error("Failed to fetch retailer details:", error);
      }
    };

    fetchRetailerDetails();
  }, []);

  return (
    <RetailerContext.Provider value={{ retailer, setRetailer }}>
      {children}
    </RetailerContext.Provider>
  );
};

export const useRetailer = (): RetailerContextProps => {
  const context = useContext(RetailerContext);
  if (!context) {
    throw new Error("useRetailer must be used within a RetailerProvider");
  }
  return context;
};