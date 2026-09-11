import React from 'react';
import { Shield, CheckCircle2, Phone, Printer, Download } from 'lucide-react';

const PolicyCertificate = ({ policy }) => {
  if (!policy) return null;

  const cert = policy.certificate_data || {};
  const travelers = cert.insured_travelers || [];
  const assistance = cert.emergency_assistance || {};

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Print / Download action toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-md print:hidden">
        <div className="flex items-center gap-2.5">
          <span className="w-3 h-3 rounded-full bg-[#00875A] animate-pulse" />
          <span className="text-xs font-mono font-bold text-slate-800">
            Official Policy Certificate: <span className="text-[#00875A]">{policy.policy_number}</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Certificate</span>
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#00875A] hover:bg-[#00734c] transition-all shadow-md shadow-emerald-700/20"
          >
            <Download className="w-4 h-4" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Certificate Document Card */}
      <div 
        id="printable-certificate"
        className="bg-white text-slate-900 p-8 sm:p-12 rounded-3xl border border-slate-200 shadow-xl max-w-4xl mx-auto space-y-8 print:bg-white print:text-slate-900 print:p-0 print:border-none print:shadow-none"
      >
        {/* Certificate Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b-2 border-slate-200 print:border-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#00875A] flex items-center justify-center text-white font-black shadow-md">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-2xl font-serif font-bold tracking-tight text-slate-900">AEROSURE TRAVEL</h2>
              <p className="text-xs font-mono font-bold text-[#00875A] tracking-widest uppercase">
                International Travel Health Insurance Certificate
              </p>
            </div>
          </div>

          <div className="text-right sm:border-l sm:pl-6 border-slate-200">
            <div className="text-xs text-slate-500 font-mono font-bold uppercase tracking-wider">Policy Certificate No.</div>
            <div className="text-xl font-mono font-bold text-[#00875A]">{policy.policy_number}</div>
            <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 sm:justify-end">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Status: {policy.status} (Verified)</span>
            </div>
          </div>
        </div>

        {/* Legal Notice */}
        <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 text-xs text-slate-700 leading-relaxed">
          <strong>Official Schengen & Worldwide Accreditation:</strong> This digital insurance certificate is issued in accordance with Regulation (EC) No 810/2009 of the European Parliament and Council. It provides comprehensive emergency medical expenses, hospitalization, and repatriation coverage up to the specified limits without deductible across all Schengen member states and requested territories.
        </div>

        {/* Territory & Dates Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 block font-semibold mb-0.5">Coverage Territory</span>
            <span className="text-slate-900 font-bold text-sm">{policy.destination_name}</span>
          </div>

          <div>
            <span className="text-slate-500 block font-semibold mb-0.5">Insurance Plan</span>
            <span className="text-[#00875A] font-bold text-sm">{policy.plan_name}</span>
          </div>

          <div>
            <span className="text-slate-500 block font-semibold mb-0.5">Valid From</span>
            <span className="text-slate-900 font-bold text-sm">{policy.start_date}</span>
          </div>

          <div>
            <span className="text-slate-500 block font-semibold mb-0.5">Valid Until</span>
            <span className="text-slate-900 font-bold text-sm">{policy.end_date}</span>
          </div>
        </div>

        {/* Insured Travelers Table */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
            Insured Tourists / Travelers
          </h4>
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-mono font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">#</th>
                  <th className="p-3">Full Name</th>
                  <th className="p-3">Date of Birth</th>
                  <th className="p-3">Passport No.</th>
                  <th className="p-3">Citizenship</th>
                  <th className="p-3">Medical Limit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {travelers.map((t, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="p-3 font-mono font-bold text-slate-400">{i + 1}</td>
                    <td className="p-3 font-bold text-slate-900">{t.full_name}</td>
                    <td className="p-3 text-slate-700">{t.date_of_birth}</td>
                    <td className="p-3 font-mono font-bold text-slate-900">{t.masked_passport}</td>
                    <td className="p-3 text-slate-700">{t.nationality}</td>
                    <td className="p-3 font-bold text-[#00875A]">{policy.medical_limit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Coverage Limits Table */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-slate-500">
            Summary of Covered Risks & Indemnity Limits
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl border border-slate-200 flex justify-between items-center bg-slate-50">
              <span className="text-slate-600">Emergency Medical & Hospitalization:</span>
              <span className="font-bold text-slate-900">{policy.medical_limit} (Included)</span>
            </div>
            <div className="p-3 rounded-xl border border-slate-200 flex justify-between items-center bg-slate-50">
              <span className="text-slate-600">Medical Evacuation & Repatriation:</span>
              <span className="font-bold text-slate-900">100% Guaranteed</span>
            </div>
            <div className="p-3 rounded-xl border border-slate-200 flex justify-between items-center bg-slate-50">
              <span className="text-slate-600">COVID-19 Inpatient Care:</span>
              <span className="font-bold text-slate-900">Included</span>
            </div>
            <div className="p-3 rounded-xl border border-slate-200 flex justify-between items-center bg-slate-50">
              <span className="text-slate-600">Client Deductible (Excess):</span>
              <span className="font-bold text-[#00875A]">€0 (Zero Deductible)</span>
            </div>
          </div>
        </div>

        {/* 24/7 Emergency Assistance Contact Box */}
        <div className="p-6 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-3">
          <div className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-emerald-400" />
            <h4 className="text-sm font-bold tracking-wide uppercase">24/7 International Emergency Assistance Coordinator</h4>
          </div>
          <p className="text-xs text-slate-300">
            In case of medical emergency, hospital admission, or acute illness during your trip, contact our 24/7 assistance center immediately before incurring hospital costs:
          </p>
          <div className="flex flex-wrap gap-6 pt-2 text-xs font-mono font-bold">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Hotlines</span>
              <span className="text-white">{assistance.hotline || '+380 44 590 55 55'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">WhatsApp Support</span>
              <span className="text-emerald-400">{assistance.viber_whatsapp || '+380 67 123 4567'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Email</span>
              <span className="text-white">{assistance.email || 'help@aerosure.example'}</span>
            </div>
          </div>
        </div>

        {/* Bottom verification QR and signatures */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-xl p-1.5 flex flex-col justify-between flex-shrink-0 shadow-sm">
              <div className="flex justify-between">
                <div className="w-3.5 h-3.5 bg-white rounded-sm" />
                <div className="w-3.5 h-3.5 bg-white rounded-sm" />
              </div>
              <div className="flex justify-between">
                <div className="w-3.5 h-3.5 bg-white rounded-sm" />
                <div className="w-3.5 h-3.5 bg-emerald-400 rounded-sm" />
              </div>
            </div>
            <div>
              <div className="font-bold text-slate-900">Scan to Verify Authenticity</div>
              <div className="text-[11px] text-slate-500 font-mono">
                Verification URL: /api/v1/policies/validate/{policy.policy_number}
              </div>
              <div className="text-[10px] text-slate-400">Issued at: {policy.issued_at}</div>
            </div>
          </div>

          <div className="text-center sm:text-right">
            <div className="font-serif italic text-base font-bold text-slate-800">AeroSure Digital Underwriting</div>
            <div className="text-[10px] uppercase tracking-widest text-slate-400 font-mono">Authorized Electronic Stamp & Seal</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyCertificate;
