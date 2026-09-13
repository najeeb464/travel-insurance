import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  CheckCircle2, 
  Phone, 
  Printer, 
  Download, 
  ExternalLink, 
  QrCode as QrIcon,
  ShieldCheck,
  Calendar,
  Globe,
  Award
} from 'lucide-react';
import QRCode from 'qrcode';

const PolicyCertificate = ({ policy }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  if (!policy) return null;

  const cert = policy.certificate_data || {};
  const travelers = cert.insured_travelers || [];
  const assistance = cert.emergency_assistance || {};

  // Construct official public verification URL
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://tavarainsurance.com';
  const publicVerifyUrl = `${origin}/?verify=${encodeURIComponent(policy.policy_number)}`;

  // Generate crisp QR code on mount
  useEffect(() => {
    if (policy.policy_number) {
      QRCode.toDataURL(publicVerifyUrl, {
        width: 240,
        margin: 1,
        errorCorrectionLevel: 'M',
        color: {
          dark: '#002E21',
          light: '#ffffff',
        },
      })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error('QR generation error:', err));
    }
  }, [policy.policy_number, publicVerifyUrl]);

  // Medical limit formatter
  const formatMedicalLimit = (limit) => {
    if (!limit) return '€30,000';
    const s = String(limit).trim();
    if (s.includes('€') || s.includes('$')) return s;
    const upper = s.toUpperCase();
    if (upper === 'START') return '€30,000';
    if (upper === 'COMFORT') return '€50,000';
    if (upper === 'PREMIUM') return '€100,000';
    if (upper === 'VISIT_VISA' || upper === 'VISIT VISA') return '€30,000';
    return s;
  };

  const medicalLimitDisplay = formatMedicalLimit(policy.medical_limit);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Print / Download action toolbar (Hidden on print) */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-md print:hidden">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-[#00875A] animate-pulse" />
          <div>
            <span className="text-xs font-mono font-bold text-slate-800">
              Certificate No: <span className="text-[#00875A] font-bold">{policy.policy_number}</span>
            </span>
            <span className="text-[11px] text-slate-500 block">
              100% Embassy & Schengen Visa Compliant Document
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href={publicVerifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all cursor-pointer"
            title="Open the public verification link encoded in the QR code"
          >
            <QrIcon className="w-3.5 h-3.5" />
            <span>Test QR Link</span>
            <ExternalLink className="w-3 h-3 ml-0.5 opacity-70" />
          </a>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#00875A] hover:bg-[#00734c] transition-all shadow-md shadow-emerald-700/20 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download Official PDF</span>
          </button>
        </div>
      </div>

      {/* Printable Certificate Document Card */}
      <div 
        id="printable-certificate"
        className="bg-white text-slate-900 p-6 sm:p-9 rounded-3xl border border-slate-200 shadow-xl max-w-4xl mx-auto space-y-4 print:p-4 print:space-y-2.5 print:border-2 print:border-[#002E21] print:shadow-none print:rounded-lg print:max-w-full text-slate-900"
      >
        {/* Certificate Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b-2 border-slate-900 print:pb-2 print:border-b-2 print:border-[#002E21] avoid-break">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 print:w-9 print:h-9 rounded-xl bg-[#00875A] flex items-center justify-center text-white font-black shadow-sm flex-shrink-0">
              <Shield className="w-6 h-6 print:w-5 print:h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl print:text-lg font-serif font-black tracking-tight text-slate-900">
                  TAVARA TRAVEL INSURANCE
                </h1>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded bg-emerald-100 text-[#00875A] text-[9px] font-bold uppercase tracking-wider print:inline-flex">
                  OFFICIAL
                </span>
              </div>
              <p className="text-[11px] print:text-[9.5px] font-mono font-bold text-[#00875A] tracking-wider uppercase">
                International Travel Health Insurance Certificate
              </p>
              <p className="text-[10px] print:text-[8.5px] text-slate-500 font-sans">
                Consular & Embassy Submission Copy • Regulation (EC) No 810/2009 Compliant
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right sm:border-l sm:pl-4 border-slate-200 print:pl-3">
            <div className="text-[10px] print:text-[8.5px] text-slate-500 font-mono font-bold uppercase tracking-wider">
              Policy Certificate No.
            </div>
            <div className="text-lg print:text-sm font-mono font-black text-[#00875A] tracking-tight">
              {policy.policy_number}
            </div>
            <div className="text-[10px] print:text-[8.5px] text-emerald-700 font-bold flex items-center gap-1 sm:justify-end">
              <CheckCircle2 className="w-3 h-3 text-[#00875A]" />
              <span>Status: {policy.status} (Verified)</span>
            </div>
          </div>
        </div>

        {/* Legal Accreditation Notice */}
        <div className="p-3 print:p-2 rounded-xl bg-emerald-50/70 border border-emerald-200 text-[11px] print:text-[8.5px] text-slate-700 leading-snug avoid-break">
          <strong className="text-slate-900">Official Schengen, Visit Visa & Consular Accreditation:</strong> This digital insurance certificate is issued in strict compliance with Regulation (EC) No 810/2009 of the European Parliament and of the Council. It satisfies all mandatory travel health insurance requirements for Schengen, UK, US, Gulf, and global visit/tourist visa applications. It provides comprehensive emergency medical expenses, hospitalization, and repatriation coverage up to the specified limits without deductible across all covered territories.
        </div>

        {/* Territory & Dates 4-Column Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 print:p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs print:text-[9px] avoid-break">
          <div>
            <span className="text-slate-500 block font-semibold text-[10px] print:text-[8px] uppercase tracking-wider">
              Coverage Territory
            </span>
            <span className="text-slate-900 font-bold text-xs print:text-[10px]">{policy.destination_name}</span>
          </div>

          <div>
            <span className="text-slate-500 block font-semibold text-[10px] print:text-[8px] uppercase tracking-wider">
              Insurance Tariff / Plan
            </span>
            <span className="text-[#00875A] font-bold text-xs print:text-[10px]">{policy.plan_name}</span>
          </div>

          <div>
            <span className="text-slate-500 block font-semibold text-[10px] print:text-[8px] uppercase tracking-wider">
              Effective Date (From)
            </span>
            <span className="text-slate-900 font-mono font-bold text-xs print:text-[10px]">{policy.start_date}</span>
          </div>

          <div>
            <span className="text-slate-500 block font-semibold text-[10px] print:text-[8px] uppercase tracking-wider">
              Expiration Date (Until)
            </span>
            <span className="text-slate-900 font-mono font-bold text-xs print:text-[10px]">{policy.end_date}</span>
          </div>
        </div>

        {/* Insured Travelers Table */}
        <div className="space-y-1.5 avoid-break">
          <div className="flex items-center justify-between">
            <h4 className="text-[10px] print:text-[8.5px] font-mono font-bold uppercase tracking-widest text-slate-500">
              Insured Tourists / Travelers
            </h4>
            <span className="text-[10px] print:text-[8.5px] font-mono text-slate-400">
              Total Insured: {travelers.length} Person(s)
            </span>
          </div>
          <div className="overflow-hidden border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs print:text-[9px]">
              <thead className="bg-slate-50 text-slate-600 uppercase font-mono font-bold text-[9px] print:text-[8px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3 print:py-1 print:px-2">#</th>
                  <th className="py-2 px-3 print:py-1 print:px-2">Full Name</th>
                  <th className="py-2 px-3 print:py-1 print:px-2">Date of Birth</th>
                  <th className="py-2 px-3 print:py-1 print:px-2">Passport No.</th>
                  <th className="py-2 px-3 print:py-1 print:px-2">Citizenship</th>
                  <th className="py-2 px-3 print:py-1 print:px-2 text-right">Medical Limit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {travelers.map((t, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="py-2 px-3 print:py-1 print:px-2 font-mono font-bold text-slate-400">{i + 1}</td>
                    <td className="py-2 px-3 print:py-1 print:px-2 font-bold text-slate-900">{t.full_name}</td>
                    <td className="py-2 px-3 print:py-1 print:px-2 text-slate-700 font-mono">{t.date_of_birth}</td>
                    <td className="py-2 px-3 print:py-1 print:px-2 font-mono font-bold text-slate-900">{t.masked_passport}</td>
                    <td className="py-2 px-3 print:py-1 print:px-2 text-slate-700">{t.nationality}</td>
                    <td className="py-2 px-3 print:py-1 print:px-2 font-bold text-[#00875A] font-mono text-right">{medicalLimitDisplay}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary of Covered Risks & Indemnity Limits */}
        <div className="space-y-1.5 avoid-break">
          <h4 className="text-[10px] print:text-[8.5px] font-mono font-bold uppercase tracking-widest text-slate-500">
            Summary of Covered Risks & Indemnity Limits
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs print:text-[9px]">
            <div className="py-2 px-3 print:py-1.5 print:px-2.5 rounded-lg border border-slate-200 flex justify-between items-center bg-slate-50">
              <span className="text-slate-600">Emergency Medical & Hospitalization:</span>
              <span className="font-bold text-slate-900 font-mono">{medicalLimitDisplay} (Included)</span>
            </div>
            <div className="py-2 px-3 print:py-1.5 print:px-2.5 rounded-lg border border-slate-200 flex justify-between items-center bg-slate-50">
              <span className="text-slate-600">Medical Evacuation & Repatriation:</span>
              <span className="font-bold text-slate-900">100% Guaranteed</span>
            </div>
            <div className="py-2 px-3 print:py-1.5 print:px-2.5 rounded-lg border border-slate-200 flex justify-between items-center bg-slate-50">
              <span className="text-slate-600">COVID-19 & Acute Illness Care:</span>
              <span className="font-bold text-slate-900">Included without Excess</span>
            </div>
            <div className="py-2 px-3 print:py-1.5 print:px-2.5 rounded-lg border border-slate-200 flex justify-between items-center bg-slate-50">
              <span className="text-slate-600">Client Deductible / Policy Excess:</span>
              <span className="font-bold text-[#00875A] font-mono">€0 (Zero Deductible)</span>
            </div>
          </div>
        </div>

        {/* 24/7 Emergency Assistance Contact Box */}
        <div className="p-3.5 print:p-2 rounded-xl bg-slate-900 text-white border border-slate-800 space-y-1.5 avoid-break">
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <h4 className="text-[11px] print:text-[9px] font-bold tracking-wide uppercase text-white">
              24/7 International Emergency Assistance Coordinator
            </h4>
          </div>
          <p className="text-[10px] print:text-[8px] text-slate-300 leading-tight">
            In case of medical emergency, hospital admission, or acute illness during your trip, contact our 24/7 assistance center immediately:
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-1 pt-1 text-[10.5px] print:text-[8.5px] font-mono font-bold">
            <div>
              <span className="text-slate-400 block text-[9px] print:text-[7px] uppercase">Hotlines</span>
              <span className="text-white">{assistance.hotline || '+380 44 590 55 55 / +44 20 7946 0192'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px] print:text-[7px] uppercase">WhatsApp Support</span>
              <span className="text-emerald-400">{assistance.viber_whatsapp || '+380 67 123 4567'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[9px] print:text-[7px] uppercase">Email</span>
              <span className="text-white">{assistance.email || 'support@tavarainsurance.com'}</span>
            </div>
          </div>
        </div>

        {/* Bottom Verification QR & Consular Electronic Seal */}
        <div className="pt-3 print:pt-2 border-t border-slate-200 flex flex-row items-center justify-between gap-4 text-xs text-slate-500 avoid-break">
          {/* Left: Scannable QR Code */}
          <div className="flex items-center gap-3">
            <div className="w-18 h-18 sm:w-20 sm:h-20 print:w-16 print:h-16 p-1 bg-white border-2 border-slate-900 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
              {qrCodeUrl ? (
                <img 
                  src={qrCodeUrl} 
                  alt={`QR Verification for ${policy.policy_number}`} 
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[9px] font-mono text-slate-400">
                  Loading QR...
                </div>
              )}
            </div>

            <div>
              <div className="font-bold text-slate-900 text-[11px] print:text-[9px] flex items-center gap-1">
                <span>Scan QR to Verify Authenticity Online</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
              </div>
              <div className="text-[10px] print:text-[7.5px] text-slate-500 font-mono break-all max-w-[280px]">
                {publicVerifyUrl}
              </div>
              <div className="text-[9px] print:text-[7px] text-slate-400 mt-0.5">
                Official Consular Verification Link • Issued: {policy.issued_at ? String(policy.issued_at).slice(0, 10) : new Date().toISOString().slice(0, 10)}
              </div>
            </div>
          </div>

          {/* Right: Electronic Stamp & Signature */}
          <div className="flex items-center gap-3">
            {/* Stamp graphic */}
            <div className="w-14 h-14 print:w-12 print:h-12 rounded-full border-2 border-dashed border-[#00875A] p-1 flex items-center justify-center text-center flex-shrink-0 opacity-90 rotate-[-6deg]">
              <div className="text-[6.5px] print:text-[5.5px] font-black font-mono text-[#00875A] uppercase leading-tight">
                TAVARA<br />OFFICIAL<br />SEAL
              </div>
            </div>

            <div className="text-right">
              <div className="font-serif italic text-sm print:text-xs font-bold text-slate-800">
                Tavara Underwriting Team
              </div>
              <div className="text-[9px] print:text-[7.5px] uppercase tracking-wider text-slate-400 font-mono">
                Authorized Electronic Underwriter
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyCertificate;
