import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Printer, Download, CheckCircle2, ArrowLeft } from 'lucide-react';
import KryolanLogo from '../assets/Kryolan-Logo.jpg';
import METLogo from '../assets/MET_College_in_Mumbai_logo.png';
import { API_BASE } from '../config';

export default function FeeReceipt() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const txnid = queryParams.get('txnid') || queryParams.get('txn') || '';
  
  const [rsvpData, setRsvpData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!txnid) {
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/admin/rsvps`)
      .then(res => res.json())
      .then(data => {
        const found = Array.isArray(data) ? data.find(r => r.txnid === txnid) : null;
        if (found) {
          setRsvpData(found);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching receipt data:', err);
        setLoading(false);
      });
  }, [txnid]);

  const handlePrint = () => {
    window.print();
  };

  const formData = rsvpData?.formData || {};
  const studentName = rsvpData?.fullName || formData.fullName || 'Participant';
  const email = rsvpData?.email || formData.email || '-';
  const mobile = rsvpData?.mobile || formData.mobile || '-';
  const state = formData.state || '-';
  const city = formData.city || '-';
  const eventTitle = rsvpData?.event?.title || "Special Effects Make-up (SFX) Seminar";
  const createdDate = rsvpData?.createdAt ? new Date(rsvpData.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('en-IN');

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 print:bg-white print:p-0">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Action Bar (Hidden when printing) */}
        <div className="flex items-center justify-between print:hidden bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
          <button
            onClick={() => navigate('/imm-sfx-seminar')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Seminar Page
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-[#C8282B] hover:bg-[#a61f22] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition"
          >
            <Printer className="w-4 h-4" /> Print / Download Receipt
          </button>
        </div>

        {/* Official Fee Receipt Container */}
        <div id="printable-receipt" className="bg-white rounded-3xl border border-slate-300 shadow-xl p-8 sm:p-12 print:shadow-none print:border-none print:rounded-none">
          {/* Header Logos */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-6 mb-6">
            <img src={KryolanLogo} alt="Kryolan Logo" className="h-12 sm:h-16 object-contain" />
            <div className="text-right">
              <h2 className="text-lg font-black text-slate-900 tracking-tight">MET Institute of Mass Media</h2>
              <p className="text-xs text-slate-500 font-medium">Bandra Reclamation, Bandra (W), Mumbai - 400 050</p>
            </div>
            <img src={METLogo} alt="MET Logo" className="h-12 sm:h-16 object-contain" />
          </div>

          {/* Receipt Title Badge */}
          <div className="text-center my-6">
            <span className="inline-block bg-[#C8282B] text-white px-6 py-1.5 rounded-full text-xs sm:text-sm font-extrabold uppercase tracking-widest">
              OFFICIAL PAYMENT RECEIPT / TAX INVOICE
            </span>
          </div>

          {/* Receipt Info Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm bg-[#EAE8CC]/30 p-4 rounded-2xl border border-[#EAE8CC] mb-6">
            <div>
              <p className="text-slate-500 uppercase font-semibold text-[11px]">Receipt No.</p>
              <p className="font-bold text-slate-900 break-all">{txnid ? `REC-${txnid}` : 'REC-PENDING'}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-500 uppercase font-semibold text-[11px]">Date</p>
              <p className="font-bold text-slate-900">{createdDate}</p>
            </div>
            <div>
              <p className="text-slate-500 uppercase font-semibold text-[11px]">Transaction Status</p>
              <p className="font-extrabold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 inline" /> SUCCESS / PAID
              </p>
            </div>
            <div className="text-right">
              <p className="text-slate-500 uppercase font-semibold text-[11px]">Payment Mode</p>
              <p className="font-bold text-slate-900">Online Gateway (PayU)</p>
            </div>
          </div>

          {/* Participant Details */}
          <div className="space-y-4 mb-8">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b pb-1">Participant Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
              <div>
                <span className="text-slate-500">Student Name:</span> <strong className="text-slate-900 ml-1">{studentName}</strong>
              </div>
              <div>
                <span className="text-slate-500">Mobile No:</span> <strong className="text-slate-900 ml-1">+91 {mobile}</strong>
              </div>
              <div>
                <span className="text-slate-500">Email Id:</span> <strong className="text-slate-900 ml-1">{email}</strong>
              </div>
              <div>
                <span className="text-slate-500">State / City:</span> <strong className="text-slate-900 ml-1">{city}, {state}</strong>
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="space-y-4 mb-8">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b pb-1">Event Information</h3>
            <div className="bg-[#EAE8CC]/30 border border-[#EAE8CC] rounded-2xl p-4 text-xs sm:text-sm space-y-1">
              <p className="font-bold text-[#C8282B] text-base">{eventTitle}</p>
              <p className="text-slate-700"><strong>Date & Time:</strong> 21 October 2026 | 10 am – 1 pm</p>
              <p className="text-slate-700"><strong>Venue:</strong> MET, Mumbai</p>
            </div>
          </div>

          {/* Particulars & GST Tax Table */}
          <div className="space-y-4 mb-8">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b pb-1">Fee Breakdown & GST Particulars</h3>
            <div className="overflow-hidden rounded-2xl border border-slate-300">
              <table className="w-full text-xs sm:text-sm text-left">
                <thead className="bg-slate-900 text-white font-bold">
                  <tr>
                    <th className="py-3 px-4">Particulars</th>
                    <th className="py-3 px-4 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium text-slate-800">
                  <tr>
                    <td className="py-3 px-4">Base Amount</td>
                    <td className="py-3 px-4 text-right">₹253.40</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">CGST (9%)</td>
                    <td className="py-3 px-4 text-right">₹22.80</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">SGST (9%)</td>
                    <td className="py-3 px-4 text-right">₹22.80</td>
                  </tr>
                  <tr className="bg-slate-100 font-extrabold text-sm sm:text-base text-slate-900">
                    <td className="py-4 px-4">Total Amount Paid (Including GST)</td>
                    <td className="py-4 px-4 text-right text-[#E31E24]">₹299.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-slate-500 italic">
              Amount in words: <strong>Rupees Two Hundred Ninety-Nine Only</strong>
            </p>
          </div>

          {/* Footer Signatures */}
          <div className="pt-10 flex items-end justify-between border-t border-slate-200 text-xs text-slate-500">
            <div>
              <p className="font-bold text-slate-700">Organized by:</p>
              <p>MET Institute of Mass Media (IMM) & Kryolan</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-700">Authorized Signatory</p>
              <p className="text-[10px] text-slate-400 mt-1">Computer Generated Receipt</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
