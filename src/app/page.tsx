"use client";

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowRight, Diamond } from 'lucide-react';

export default function EnhancedMarketingPage() {
  return (
    <div className= "min-h-screen bg-[#0A0A0A] text-white selection:bg-[#D4AF37] selection:text-black font-sans relative overflow-hidden" >

    {/* Ambient Top Light */ }
    < div className = "absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#D4AF37]/10 blur-[120px] rounded-full pointer-events-none opacity-60" > </div>

  {/* Navigation */ }
  <nav className="relative z-50" >
    <div className="max-w-[1400px] mx-auto px-8 h-24 flex items-center justify-between" >

      <Link href="/" className = "flex items-center gap-3 group" >
        <div className="w-9 h-9 rounded-md border border-[#D4AF37]/30 flex items-center justify-center bg-transparent group-hover:bg-[#D4AF37]/10 transition-colors" >
          <Diamond size={ 20 } className = "text-[#D4AF37]" strokeWidth = { 1.5} />
            </div>
            < span className = "text-xl font-bold tracking-tight text-white" >
              Shaqal < span className = "text-[#D4AF37]" > TradeOS </span>
                </span>
                </Link>

                < div className = "hidden md:flex gap-10 items-center text-[15px] font-medium text-neutral-400" >
                  <Link href="#platform" className = "hover:text-white transition-colors" > Platform </Link>
                    < Link href = "#pipeline" className = "hover:text-white transition-colors" > Pipeline </Link>
                      < Link href = "#trust" className = "hover:text-white transition-colors" > Trust </Link>
                        </div>

                        < Link href = "/login" className = "bg-[#D4AF37] text-black px-6 py-2.5 rounded-full font-semibold text-[15px] flex items-center gap-2 hover:bg-[#F3E5AB] transition-colors" >
                          Sign in <ArrowRight size={ 16 } strokeWidth = { 2.5} />
                            </Link>
                            </div>
                            </nav>

                            < main className = "relative z-10 max-w-[1400px] mx-auto px-8 pt-20 pb-32" >
                              <div className="grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center" >

                                {/* Left Content */ }
                                < div className = "space-y-7 relative z-20" >
                                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#D4AF37]/40 bg-transparent text-[#D4AF37] text-[11px] font-semibold tracking-widest uppercase" >
                                    <ShieldCheck size={ 14 } strokeWidth = { 2.5} /> ISO 27001 · FATF ALIGNED
                                      </div>

                                      < h1 className = "text-6xl md:text-[76px] font-bold tracking-tight leading-[1.05] text-white" >
                                        Move gold, minerals < br />
                                          and trust through < br />
                                            one < span className = "text-[#D4AF37]" > audited < br /> pipeline.</span>
                                              </h1>

                                              < p className = "text-[17px] text-neutral-400 max-w-[540px] leading-[1.6]" >
                                                Shaqal TradeOS replaces scattered WhatsApp threads and PDF chains with a single compliance - gated deal room — built for brokers, buyers, mandates and compliance officers working high - value commodity transactions.
            </p>

                                                  < div className = "flex flex-col sm:flex-row gap-4 pt-4" >
                                                    <button className="bg-[#D4AF37] text-black px-7 py-4 rounded-[14px] font-semibold flex items-center justify-center gap-2 hover:bg-[#F3E5AB] hover:-translate-y-0.5 transition-all text-[15px]" >
                                                      Request platform access < ArrowRight size = { 18} strokeWidth = { 2.5} />
                                                        </button>
                                                        < button className = "bg-[#18181A] text-white border border-[#27272A] px-7 py-4 rounded-[14px] font-medium hover:bg-[#202022] transition-colors text-[15px]" >
                                                          Explore a live deal room
                                                            </button>
                                                            </div>
                                                            </div>

  {/* Right Graphic */ }
  <div className="relative z-10 lg:pl-16 mt-16 lg:mt-0" >
    {/* The Image Container */ }
    < div className = "relative rounded-[24px] overflow-hidden border border-white/5 bg-[#121212] aspect-[4/3] w-full shadow-2xl" >
      {/* eslint-disable-next-line @next/next/no-img-element */ }
      < img
  src = "https://images.unsplash.com/photo-1588611910243-d8c9735d4653?q=80&w=1200&auto=format&fit=crop"
  alt = "Gold Bars Validation"
  className = "w-full h-full object-cover"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-40" > </div>
      </div>

  {/* Floating Overlay Card */ }
  <div className="absolute -bottom-8 -left-8 bg-[#18181A] border border-white/5 p-7 rounded-[20px] shadow-2xl w-[400px]" >
    <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-[0.15em] mb-3" >
      DEAL SQ - 1042 · STAGE 8
        </p>
        < p className = "font-medium text-white text-[17px] leading-snug mb-4" >
          Assay verified · Escrow funded · Awaiting compliance release
            </p>
            < p className = "text-[#D4AF37] text-[13px] font-mono tracking-tight" >
              UTID 0x8f31...c47a
                </p>
                </div>
                </div>

                </div>
                </main>

                </div>
  );
}
