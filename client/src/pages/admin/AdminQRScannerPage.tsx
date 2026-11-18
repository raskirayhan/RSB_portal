import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Html5QrcodeScanner } from 'html5-qrcode';
import confetti from 'canvas-confetti';
import {
  QrCode,
  CheckCircle2,
  AlertCircle,
  Camera,
  RefreshCw,
  Sparkles,
  CreditCard,
  User,
  ShieldCheck
} from 'lucide-react';

export const AdminQRScannerPage: React.FC = () => {
  const [scanResult, setScanResult] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [simulatedPayload, setSimulatedPayload] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [students, setStudents] = useState<any[]>([]);

  useEffect(() => {
    // Load students for easy 1-click test scan
    api.get('/admin/students')
      .then((res) => {
        if (res.data.success) {
          setStudents(res.data.data);
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleProcessScan = async (qrPayloadString: string) => {
    setErrorMessage(null);
    try {
      const res = await api.post('/admin/attendance/scan-qr', {
        qrPayload: qrPayloadString,
      });

      if (res.data.success) {
        setScanResult(res.data.data);
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'অবৈধ বা ভুল QR কোড স্ক্যান করা হয়েছে।');
      setScanResult(null);
    }
  };

  // Start Camera QR Scanner
  const startCameraScanner = () => {
    setIsScanning(true);
    setScanResult(null);
    setErrorMessage(null);

    setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        'qr-reader-container',
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render(
        (decodedText) => {
          scanner.clear();
          setIsScanning(false);
          handleProcessScan(decodedText);
        },
        (error) => {
          // ignore scan frame errors
        }
      );
    }, 200);
  };

  // Quick Simulation Test
  const handleSimulateQuickTest = (student: any) => {
    // Extract payload from student QR or generate standard
    const payload = JSON.stringify({
      studentId: student.studentIdNumber,
      userId: student.userId,
      name: student.user?.name,
      academicLevel: student.academicLevel,
      signature: 'demo_sig',
      generatedAt: new Date().toISOString(),
    });

    handleProcessScan(payload);
  };

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-emerald-600 mb-2">
            <QrCode className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-wider">অফলাইন ব্যাচ ম্যানেজমেন্ট</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            অফলাইন QR কোড অ্যাটেনডেন্স স্ক্যানার
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            অফলাইন ব্যাচে আসার পর শিক্ষার্থীর মোবাইলে প্রদর্শিত বা প্রিন্ট করা ডিজিটাল QR কোড স্ক্যান করে ১ সেকেন্ডে উপস্থিতি রেকর্ড এবং টিউশন ফি স্ট্যাটাস যাচাই করুন।
          </p>
        </div>

        <button
          onClick={startCameraScanner}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all flex items-center space-x-2 whitespace-nowrap"
        >
          <Camera className="w-5 h-5" />
          <span>ক্যামেরা স্ক্যানার চালু করুন</span>
        </button>
      </div>

      {/* Camera View Area */}
      {isScanning && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl max-w-md mx-auto text-center space-y-4">
          <h3 className="font-bold text-slate-800 text-sm">শিক্ষার্থীর QR কোড ক্যামেরার সামনে ধরুন</h3>
          <div id="qr-reader-container" className="overflow-hidden rounded-2xl border" />
          <button
            onClick={() => setIsScanning(false)}
            className="text-xs text-rose-600 font-bold hover:underline"
          >
            স্ক্যানার বন্ধ করুন
          </button>
        </div>
      )}

      {/* Scanned Student Verification Result Card */}
      {scanResult && (
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/20 pb-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-6 h-6 text-emerald-200" />
              <h3 className="text-lg font-black tracking-wide">উপস্থিতি নিশ্চিত করা হয়েছে (PRESENT)</h3>
            </div>
            <span className="text-xs font-mono font-bold bg-white/20 px-3 py-1 rounded-full">
              সময়: {scanResult.scannedAt || 'এখনই'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
            <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl mx-auto sm:mx-0 border border-white/30">
              👨‍🎓
            </div>

            <div className="sm:col-span-2 space-y-1 text-center sm:text-left">
              <span className="text-xs font-mono font-bold bg-white/20 text-white px-2.5 py-0.5 rounded-md">
                {scanResult.student?.studentId}
              </span>
              <h2 className="text-2xl font-black">{scanResult.student?.name}</h2>
              <p className="text-xs text-emerald-100">{scanResult.student?.batch} • {scanResult.student?.academicLevel}</p>

              <div className="pt-2 flex items-center justify-center sm:justify-start space-x-2">
                <span className="text-xs font-bold text-white">চলতি মাসের ফি:</span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                  scanResult.feeStatus === 'PAID' ? 'bg-white text-emerald-800' : 'bg-rose-500 text-white'
                }`}>
                  {scanResult.feeStatus === 'PAID' ? '✓ ফি পরিশোধিত' : '⚠ ফি বকেয়া'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">স্ক্যান ব্যর্থ হয়েছে:</p>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {/* 1-Click Fast Test Simulator for Demonstration */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <h3 className="font-bold text-slate-900 text-sm">
            ১-ক্লিক ফাস্ট স্ক্যান সিমুলেটর (Instant Test Check-In)
          </h3>
        </div>
        <p className="text-xs text-slate-500">
          ক্যামেরা ছাড়া সরাসরি যে কোনো শিক্ষার্থীর QR স্ক্যান পরীক্ষা করতে নিচের বাটনে ক্লিক করুন:
        </p>

        <div className="flex flex-wrap gap-2.5 pt-2">
          {students.map((st) => (
            <button
              key={st.id}
              onClick={() => handleSimulateQuickTest(st)}
              className="px-4 py-2.5 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-300 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 transition-all flex items-center space-x-2"
            >
              <User className="w-3.5 h-3.5 text-indigo-600" />
              <span>{st.user?.name} ({st.studentIdNumber})</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
