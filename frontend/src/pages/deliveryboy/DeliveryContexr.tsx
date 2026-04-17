import  { createContext, useContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";

interface DeliveryBoy {
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

interface DeliveryBoyContextProps {
  deliveryBoy: DeliveryBoy | null;
  setDeliveryBoy: (deliveryBoy: DeliveryBoy | null) => void;
}

const DeliveryBoyContext = createContext<DeliveryBoyContextProps | undefined>(undefined);

export const DeliveryBoyProvider = ({ children }: { children: ReactNode }) => {
  const [deliveryBoy, setDeliveryBoy] = useState<DeliveryBoy | null>(null);

  useEffect(() => {
    const fetchDeliveryBoyDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Token is missing");
          return;
        }

        const response = await axios.get(
          `http://127.0.0.1:10007/api/v1/auth/user/fetch/${token}`
        );

        if (response.data && response.data.data) {
          setDeliveryBoy(response.data.data);
        } else {
          console.error("No delivery boy data returned from server.");
        }
      } catch (error) {
        console.error("Failed to fetch delivery boy details:", error);
      }
    };

    fetchDeliveryBoyDetails();
  }, []);

  return (
    <DeliveryBoyContext.Provider value={{ deliveryBoy, setDeliveryBoy }}>
      {children}
    </DeliveryBoyContext.Provider>
  );
};

export const useDeliveryBoy = (): DeliveryBoyContextProps => {
  const context = useContext(DeliveryBoyContext);
  if (!context) {
    throw new Error("useDeliveryBoy must be used within a DeliveryBoyProvider");
  }
  return context;
};