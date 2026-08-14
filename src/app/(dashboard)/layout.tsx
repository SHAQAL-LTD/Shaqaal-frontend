import React from 'react';
import Link from 'next/link';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className= "flex flex-col md:flex-row min-h-screen" >
        <aside className="hidden md:flex flex-col w-64 h-screen glass-panel sticky top-0 border-r border-dark-800 shrink-0" >
            <div className="p-6 border-b border-dark-800" >
                <Link href="/" >
                    <h1 className="text-2xl font-bold tracking-tighter text-gradient-gold" > SHAQAL </h1>
                        < p className = "text-xs text-gray-muted uppercase tracking-widest mt-1 font-semibold" > TradeOS </p>
                            </Link>
                            </div>
                            < nav className = "flex-1 p-4 space-y-2" >
                                <Link href="/dashboard" className = "flex items-center px-4 py-3 rounded-lg text-gray-muted hover:bg-dark-800 hover:text-white transition-all font-medium" >
                                    Overview
                                    </Link>
                                    < Link href = "/dashboard/deals" className = "flex items-center px-4 py-3 rounded-lg bg-gold-500/10 text-gold-500 border border-gold-500/20 transition-all font-medium" >
                                        Active Deals
                                            </Link>
                                            < Link href = "/dashboard/compliance" className = "flex items-center px-4 py-3 rounded-lg text-gray-muted hover:bg-dark-800 hover:text-white transition-all font-medium" >
                                                Compliance
                                                </Link>
                                                </nav>
                                                < div className = "p-4 border-t border-dark-800" >
                                                    <div className="flex items-center px-4 py-3 rounded-lg glass-panel hover:bg-dark-700 transition cursor-pointer" >
                                                        <div className="h-8 w-8 rounded-full bg-gold-500 flex items-center justify-center text-dark-950 font-bold mr-3 shrink-0" >
                                                            AB
                                                            </div>
                                                            < div className = "overflow-hidden" >
                                                                <p className="text-sm font-semibold truncate" > Alex Broker </p>
                                                                    < p className = "text-xs text-gray-muted truncate" > Founding Partner </p>
                                                                        </div>
                                                                        </div>
                                                                        </div>
                                                                        </aside>
                                                                        < header className = "md:hidden flex items-center justify-between p-4 glass-panel sticky top-0 z-50" >
                                                                            <h1 className="text-xl font-bold text-gradient-gold" > SHAQAL </h1>
                                                                                < button className = "p-2 border border-dark-800 rounded-md text-gold-500" > Menu </button>
                                                                                    </header>
                                                                                    < main className = "flex-1 overflow-x-hidden overflow-y-auto" >
                                                                                        { children }
                                                                                        </main>
                                                                                        </div>
  );
}
