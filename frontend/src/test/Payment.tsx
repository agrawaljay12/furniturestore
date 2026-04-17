/* eslint-disable @typescript-eslint/no-explicit-any */
import PaymentIntegration from '../Auth/PaymnetIntegration';

function TestComponent() {

    const dataX: any = {
        id: "123456",
        email: "asdfsadf@gmail.com",
        name: "John Doe",
        address: "123 Main St",
        money: 1500
    }

    const amount = 1500;

    const onApprove = async (_data: any, actions: any) => {
        // console.log(data);
        const Transaction = await actions.order.capture();  // This Variable has Transaction Details
        // console.log(Transaction); 

        dataX.transaction = Transaction;

        console.log(dataX);

    }

    return (
        <>
        <PaymentIntegration  amountInr ={amount} onApprove={onApprove} />
        </>
    );
}

export default TestComponent;