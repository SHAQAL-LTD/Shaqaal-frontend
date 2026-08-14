import React from 'react';

export default function ActiveDealsOverview() {
    return (
        <div className= "p-4 md:p-8 space-y-8 animate-in fade-in duration-700" >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4" >
            <div>
            <h2 className="text-3xl font-bold tracking-tight" > Active Deals </h2>
                < p className = "text-gray-muted mt-1" > Manage and track your 10 - stage commodity transactions.</p>
                    </div>
                    < button className = "button-gold px-6 py-2.5 rounded-lg flex items-center gap-2 shadow-lg" >
                        Create New Deal
                            </button>
                            </div>

                            < div className = "grid grid-cols-1 md:grid-cols-3 gap-6" >
                                <div className="glass-panel p-6 rounded-xl" >
                                    <p className="text-gray-muted text-sm font-semibold uppercase tracking-wider mb-2" > Pending KYC </p>
                                        < div className = "flex items-end gap-3" >
                                            <h3 className="text-4xl font-bold tabular-nums" > 4 </h3>
                                                < span className = "text-gold-500 text-sm mb-1 font-medium" > Awaiting Review </span>
                                                    </div>
                                                    </div>
                                                    < div className = "glass-panel-gold p-6 rounded-xl animate-glow" >
                                                        <p className="text-gold-500 text-sm font-semibold uppercase tracking-wider mb-2" > Requires Action </p>
                                                            < div className = "flex flex-col gap-1" >
                                                                <span className="font-medium text-white truncate" > Deal #D - 89110 </span>
                                                                    < span className = "text-sm text-gray-300" > Stage 04 — SPA Signature </span>
                                                                        </div>
                                                                        </div>
                                                                        </div>

                                                                        < div className = "glass-panel rounded-xl border border-dark-800 overflow-hidden" >
                                                                            <div className="p-6 border-b border-dark-800 flex justify-between items-center bg-dark-900/50" >
                                                                                <h3 className="text-lg font-semibold" > Deal Pipeline Grid </h3>
                                                                                    </div>
                                                                                    < div className = "p-8 text-center text-gray-muted" >
                                                                                        Dynamic Data Grid Renders Here
                                                                                            </div>
                                                                                            </div>
                                                                                            </div>
  );
}
