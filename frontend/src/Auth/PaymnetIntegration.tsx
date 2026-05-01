/* eslint-disable @typescript-eslint/no-explicit-any */
import { PayPalButtons, PayPalButtonsComponentProps, PayPalScriptProvider } from '@paypal/react-paypal-js';

export interface PaymentIntegrationProps {
    amountInr: number; // Keep prop name for compatibility, but we're using USD
    onApprove: (data: any, actions: any) => Promise<void>;
}

function PaymentIntegration(props: PaymentIntegrationProps) {
    // Use USD amount directly (no conversion)
    const amount = props.amountInr;
    // const cid = import.meta.env.VITE_PAYPAL_CLIENT_ID;
    
    // // Update config to use USD instead of GBP
    // const initialOptions = {
    //     "clientId": cid,
    //     "disable-funding": "",
    //     "buyer-country": "US",
    //     currency: "USD", // Change to USD
    //     "data-page-type": "product-details",
    //     components: "buttons",
    //     "data-sdk-integration-source": "developer-studio",
    // };

    const cid = import.meta.env.VITE_PAYPAL_CLIENT_ID;

    const initialOptions = {
        clientId: cid,
        currency: "USD",
        components: "buttons",
    };
    
    const createOrder: PayPalButtonsComponentProps["createOrder"] =async (_data: any, actions: any) => {
        try {
            if (!actions || !actions.order) {
                throw new Error("PayPal actions not initialized");
            }

            return actions.order.create({
                purchase_units: [
                    {
                        amount: {
                            value: amount.toFixed(2),
                            currency_code: "USD",
                        },
                    },
                ],
            });
        } catch (error) {
            console.error("Create Order Error:", error);
            throw error;
        }
    };
    
    return (
        <div className="w-full flex justify-center">
            <PayPalScriptProvider options={initialOptions}>
                <PayPalButtons 
                    key={amount}  
                    createOrder={createOrder} 
                    onApprove={props.onApprove}
                    style={{
                        layout: 'vertical',
                        color: 'gold',
                        shape: 'rect',
                        label: 'pay'
                    }}
                />
            </PayPalScriptProvider>
        </div>
    )
}

export default PaymentIntegration
