"use client"
import Head from 'next/head';

export default function App() {
    return (
        <>

            <Head>
                <title>Laravel - App</title>
            </Head>

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            Welcome to your application dashboard!
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
