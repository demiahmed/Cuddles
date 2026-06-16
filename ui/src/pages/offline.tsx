// 'use client';

// import Image from 'next/image';
// import Head from 'next/head';

// export default function OfflinePage() {
//   // Define the client-side function safely
//   const handleTryAgain = () => {
//     // This code only runs when the component is mounted in the browser
//     // and the user clicks the button.
//     window.location.reload();
//   };

//   return (
//     <>
//       {/* Note: <Head> is an exception and can be used in Client Components. */}
//       <Head>
//         <title>Offline - Cuddles</title>
//       </Head>
//       <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
//         <Image
//           src="/icons/android-chrome-192x192.png"
//           alt="Cuddles Logo"
//           width={96}
//           height={96}
//           className="mb-8"
//         />
//         <h1 className="text-2xl font-bold text-pink-500 mb-4">You&apos;re Offline</h1>
//         <p className="text-gray-600 mb-6">
//           Please check your internet connection and try again.
//         </p>
//         <div className="space-y-4">
//           <p className="text-sm text-gray-500">
//             Don&apos;t worry! Your entries are safely stored and will sync when you&apos;re back online.
//           </p>
//           <button
//             onClick={handleTryAgain} // Use the defined client function
//             className="px-6 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
//           >
//             Try Again
//           </button>
//         </div>
//       </div>
//     </>
//   )
// }

"use client";
import Image from 'next/image';
import Head from 'next/head';

export default function OfflinePage() {
  // 🛑 The handleTryAgain function has been REMOVED as it used 'window'

  return (
    <>
      <Head>
        <title>Offline - Cuddles</title>
      </Head>
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <Image
          src="/icons/android-chrome-192x192.png"
          alt="Cuddles Logo"
          width={96}
          height={96}
          className="mb-8"
        />
        <h1 className="text-2xl font-bold text-pink-500 mb-4">You&apos;re Offline</h1>
        <p className="text-gray-600 mb-6">
          Please check your internet connection and try again.
        </p>
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Don&apos;t worry! Your entries are safely stored and will sync when you&apos;re back online.
          </p>
          <button
            // 🛑 The onClick handler is REMOVED to eliminate the 'window' error
            // className attribute is kept for visual consistency
            className="px-6 py-2 bg-pink-500 text-white rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
          >
            Try Again
          </button>
        </div>
      </div>
    </>
  )
}