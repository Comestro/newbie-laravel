export function loadRazorpayScript() {
    if (window.Razorpay) return Promise.resolve(true);

    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

export async function openRazorpayCheckout({
    orderData,
    description,
    prefill = {},
    onSuccess,
    onFailure,
    onDismiss,
}) {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
        onFailure?.('Unable to load Razorpay SDK. Check your internet connection.');
        return;
    }

    const rzp = new window.Razorpay({
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Newbie Service',
        description,
        order_id: orderData.order_id,
        prefill,
        theme: { color: '#9333ea' },
        modal: {
            ondismiss: () => onDismiss?.(),
        },
        handler: (response) => onSuccess(response),
    });

    rzp.on('payment.failed', (res) => {
        onFailure?.(res?.error?.description || 'Payment failed. Please try again.');
    });

    rzp.open();
}

