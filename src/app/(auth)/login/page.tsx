import React from 'react';

export default function LoginPage() {
    return (
        <div className= "min-h-screen flex items-center justify-center p-4" >
        <div className="glass-panel max-w-md w-full p-8 rounded-2xl" >
            <h2 className="text-3xl font-bold mb-2" > Broker Login </h2>
                < p className = "text-gray-muted mb-8" > Access the TradeOS pipeline securely.</p>

                    < form className = "space-y-4" >
                        <div>
                        <label className="text-sm font-medium text-gray-muted" > Email </label>
                            < input type = "email" className = "w-full mt-1 bg-dark-800 border border-dark-700 rounded-lg p-3 text-white focus:border-gold-500 focus:outline-none transition" />
                                </div>
                                < div >
                                <label className="text-sm font-medium text-gray-muted" > Password </label>
                                    < input type = "password" className = "w-full mt-1 bg-dark-800 border border-dark-700 rounded-lg p-3 text-white focus:border-gold-500 focus:outline-none transition" />
                                        </div>
                                        < button type = "submit" className = "button-gold w-full rounded-lg p-3 mt-4" > Authenticate </button>
                                            </form>
                                            </div>
                                            </div>
  );
}
