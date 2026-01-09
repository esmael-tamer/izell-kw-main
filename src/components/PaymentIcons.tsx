export const PaymentIcons = () => {
    return (
        <div className="flex gap-4 md:gap-6 items-center">
            {/* KNET - Official Logo */}
            <svg className="h-8 w-auto opacity-80 hover:opacity-100 transition-opacity" viewBox="0 0 140 70" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Blue Background */}
                <rect width="140" height="70" fill="#003087" rx="4" />

                {/* White border frame */}
                <rect x="3" y="3" width="134" height="64" fill="none" stroke="white" strokeWidth="1.5" rx="2" />

                {/* Arabic Text "كي - نت" at top */}
                <text x="70" y="18" fontFamily="Arial, sans-serif" fontSize="11" fill="white" textAnchor="middle" fontWeight="bold" letterSpacing="1">
                    كي - نت
                </text>

                {/* Yellow Rectangle Background for K */}
                <rect x="10" y="25" width="120" height="22" fill="#FFD700" />

                {/* Large Yellow K */}
                <path d="M 30 27 L 30 45 M 30 36 L 50 27 M 30 36 L 50 45" stroke="#003087" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

                {/* White "net" text at bottom */}
                <text x="70" y="62" fontFamily="Arial, sans-serif" fontSize="14" fill="white" textAnchor="middle" fontWeight="bold" letterSpacing="3">
                    net
                </text>
            </svg>

            {/* Visa */}
            <svg className="h-5 w-auto opacity-70 hover:opacity-100 transition-opacity" viewBox="0 0 48 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.5 0L15.2 15.7H11.4L14.7 0H18.5ZM32.8 10.1L34.9 4.2L36.2 10.1H32.8ZM37.8 15.7H41.3L38.2 0H35C34.3 0 33.7 0.4 33.4 1L27.5 15.7H31.8L32.6 13.5H37.8L38.3 15.7H37.8ZM28.1 10.5C28.1 6.5 22.9 6.3 22.9 4.5C22.9 3.9 23.5 3.3 24.7 3.1C25.3 3 27.1 2.9 29.1 3.9L29.8 0.6C28.7 0.2 27.3 -0.1 25.6 -0.1C21.6 -0.1 18.8 2 18.8 4.9C18.8 7 20.6 8.2 21.9 8.9C23.3 9.6 23.8 10.1 23.8 10.7C23.8 11.7 22.6 12.1 21.5 12.1C19.6 12.1 18.6 11.8 17 11.1L16.3 14.5C17.9 15.2 19.9 15.8 22 15.8C26.3 15.8 29 13.6 29 10.5H28.1ZM11.3 0L5.7 10.8L5.1 7.8C4.2 5.1 1.6 2.2 -1.3 0.7L2.3 15.6H6.7L13.7 0H11.3Z" fill="#1434CB" />
            </svg>

            {/* Mastercard */}
            <svg className="h-6 w-auto opacity-70 hover:opacity-100 transition-opacity" viewBox="0 0 48 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="18" cy="16" r="14" fill="#EB001B" />
                <circle cx="30" cy="16" r="14" fill="#F79E1B" />
                <path d="M24 6.5C21.5 8.8 20 12.2 20 16C20 19.8 21.5 23.2 24 25.5C26.5 23.2 28 19.8 28 16C28 12.2 26.5 8.8 24 6.5Z" fill="#FF5F00" />
            </svg>

            {/* Apple Pay */}
            <svg className="h-6 w-auto opacity-70 hover:opacity-100 transition-opacity" viewBox="0 0 48 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.4 3.8C8.9 3.2 9.3 2.4 9.2 1.6C8.5 1.6 7.6 2.1 7.1 2.7C6.6 3.2 6.2 4.1 6.3 4.9C7.1 4.9 7.9 4.4 8.4 3.8ZM9.2 5.1C7.9 5 6.8 5.9 6.2 5.9C5.6 5.9 4.6 5.1 3.6 5.1C2.3 5.1 1.1 5.9 0.4 7.2C-0.9 9.7 0.1 13.4 1.4 15.5C2 16.5 2.8 17.7 3.8 17.7C4.8 17.7 5.1 17 6.3 17C7.5 17 7.8 17.7 8.8 17.7C9.9 17.7 10.6 16.6 11.2 15.6C11.9 14.4 12.2 13.3 12.2 13.2C12.2 13.2 10.1 12.4 10.1 10C10.1 7.9 11.8 6.9 11.9 6.9C10.9 5.4 9.4 5.2 9.2 5.1Z" fill="currentColor" />
                <path d="M20.8 3.5C22.9 3.5 24.4 5 24.4 7.2C24.4 9.4 22.8 10.9 20.7 10.9H18.3V14.7H16.5V3.5H20.8ZM18.3 9.4H20.3C21.8 9.4 22.6 8.5 22.6 7.2C22.6 5.9 21.8 5 20.3 5H18.3V9.4Z" fill="currentColor" />
                <path d="M28.9 11.2C28.9 9.5 30.2 8.5 32.2 8.4L34.5 8.3V7.6C34.5 6.7 33.9 6.2 32.8 6.2C31.9 6.2 31.3 6.6 31.1 7.2H29.4C29.5 5.8 30.8 4.8 32.9 4.8C35 4.8 36.3 5.8 36.3 7.5V14.7H34.6V13.4H34.5C34 14.3 33 14.9 31.9 14.9C30.3 14.9 28.9 13.9 28.9 12.2V11.2ZM34.5 11.5V10.8L32.4 10.9C31.3 11 30.7 11.4 30.7 12.2C30.7 13 31.3 13.5 32.2 13.5C33.5 13.5 34.5 12.6 34.5 11.5Z" fill="currentColor" />
                <path d="M38.5 17.9V16.4C38.7 16.4 39 16.5 39.2 16.5C40 16.5 40.5 16.2 40.8 15.3L41 14.8L37.5 4.9H39.4L41.9 12.9H42L44.5 4.9H46.3L42.7 15.2C42 17.1 41.1 17.9 39.4 17.9C39.2 17.9 38.7 17.9 38.5 17.9Z" fill="currentColor" />
            </svg>
        </div>
    );
};
