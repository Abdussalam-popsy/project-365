import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Cloud } from 'lucide-react';

export default function App() {
  const [step, setStep] = useState(0);
  const [text, setText] = useState('');

  // Sequence the animation steps
  useEffect(() => {
    if (step === 1) {
      const t = setTimeout(() => setStep(2), 800);
      return () => clearTimeout(t);
    }
    if (step === 2) {
      const t = setTimeout(() => setStep(3), 800);
      return () => clearTimeout(t);
    }
    if (step === 3) {
      const t = setTimeout(() => setStep(4), 1200);
      return () => clearTimeout(t);
    }
    if (step === 4) {
      const t = setTimeout(() => setStep(5), 1500);
      return () => clearTimeout(t);
    }
  }, [step]);

  const handleSend = () => {
    if (text.trim() === '') return;
    setStep(1);
  };

  return (
    <div className="relative w-full h-screen bg-sky-200 overflow-hidden flex flex-col items-center justify-center font-sans">
      {/* Clouds Background */}
      <motion.div className="absolute top-20 left-10 text-white/60" animate={{ x: [0, 30, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}><Cloud size={120} fill="currentColor" /></motion.div>
      <motion.div className="absolute top-40 right-20 text-white/50" animate={{ x: [0, -40, 0] }} transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}><Cloud size={80} fill="currentColor" /></motion.div>
      <motion.div className="absolute bottom-40 left-1/4 text-white/40" animate={{ x: [0, 50, 0] }} transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}><Cloud size={160} fill="currentColor" /></motion.div>

      {/* Header */}
      <AnimatePresence>
        {step === 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-12 text-center z-50"
          >
            <h1 className="text-4xl font-bold text-slate-800 mb-2 tracking-tight">Pigeon Post</h1>
            <p className="text-slate-700 font-medium text-lg">Write a message and send it on its way.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Message */}
      <AnimatePresence>
        {step === 5 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="absolute z-50 flex flex-col items-center bg-white/90 backdrop-blur-md px-12 py-10 rounded-3xl shadow-2xl"
          >
            <h2 className="text-4xl font-bold text-slate-800 mb-3">Letter Sent!</h2>
            <p className="text-slate-600 mb-8 text-lg">Your message is flying to its destination.</p>
            <button
              onClick={() => { setStep(0); setText(''); }}
              className="px-8 py-3 bg-sky-500 text-white rounded-full font-semibold text-lg shadow-md hover:bg-sky-600 hover:shadow-lg transition-all active:scale-95"
            >
              Send another
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Envelope Container */}
      <motion.div
        className="relative w-80 h-56"
        style={{
          perspective: '1000px',
          overflow: step >= 2 ? 'hidden' : 'visible',
          clipPath: step === 1 ? 'inset(-200% -200% 0 -200%)' : 'none',
        }}
        animate={{
          x: step === 4 ? 1000 : 0,
          y: step === 4 ? -440 : 0,
          rotate: step === 4 ? 15 : 0,
        }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      >
        {/* Envelope Back (Inside) */}
        <div className="absolute inset-0 bg-amber-600 rounded-md shadow-inner z-0" />

        {/* The Letter */}
        <motion.div
          className="absolute left-4 right-4 bg-[#fdfbf7] shadow-md rounded-sm p-6 flex flex-col z-10"
          style={{
            height: '320px',
            backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #cbd5e1 32px)',
            backgroundAttachment: 'local',
          }}
          initial={{ y: -240, scale: 1.05 }}
          animate={{
            y: step === 0 ? -240 : 10,
            scale: step === 0 ? 1.05 : 0.9,
          }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={step > 0}
            placeholder="Dear friend..."
            className="w-full h-full resize-none bg-transparent outline-none text-slate-800 text-xl font-serif italic leading-[32px] pt-1 placeholder:text-slate-400 placeholder:not-italic"
          />
        </motion.div>

        {/* Envelope Front Pocket */}
        <div
          className="absolute inset-0 bg-amber-200 z-20 drop-shadow-sm"
          style={{ clipPath: 'polygon(0 0, 50% 45%, 100% 0, 100% 100%, 0 100%)' }}
        />

        {/* Envelope Flap */}
        <motion.div
          className="absolute top-0 left-0 right-0 h-40 bg-amber-300 drop-shadow-md origin-top"
          style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}
          initial={{ rotateX: 180, zIndex: 5 }}
          animate={{
            rotateX: step >= 2 ? 0 : 180,
            zIndex: step >= 2 ? 30 : 5,
          }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />

        {/* Wax Seal */}
        <motion.div
          className="absolute left-1/2 top-[136px] w-12 h-12 bg-red-600 rounded-full shadow-md z-40 flex items-center justify-center"
          style={{ x: '-50%' }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: step >= 3 ? 1 : 0,
            scale: step >= 3 ? 1 : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-8 h-8 rounded-full border-2 border-red-700 opacity-50" />
        </motion.div>
      </motion.div>

      {/* The Bird */}
      <motion.div
        className="absolute z-50 text-slate-800"
        initial={{ x: -1000, y: -500, scale: 2 }}
        animate={{
          x: step < 3 ? -1000 : step === 3 ? 0 : 1000,
          y: step < 3 ? -500 : step === 3 ? -120 : -560,
          rotate: step < 3 ? 20 : step === 3 ? 0 : -15,
        }}
        transition={{
          duration: step === 3 ? 1.2 : 1.5,
          ease: "easeInOut"
        }}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-32 h-32 drop-shadow-2xl transform scale-x-[-1]">
          <path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"/>
        </svg>
      </motion.div>

      {/* Send Button */}
      <AnimatePresence>
        {step === 0 && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={handleSend}
            disabled={text.trim() === ''}
            className="absolute bottom-12 flex items-center gap-2 px-8 py-4 bg-slate-800 text-white rounded-full font-semibold text-lg shadow-xl hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95 z-50"
          >
            <Send size={20} />
            Send Letter
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
