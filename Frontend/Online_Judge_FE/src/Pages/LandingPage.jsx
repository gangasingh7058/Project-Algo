import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const LandingPage = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const fadeOutTimer = setTimeout(() => setVisible(false), 8000);
    const navigateTimer = setTimeout(() => navigate('/user/signin'), 11000);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(navigateTimer);
    };
  }, [navigate]);

  const typingStyle = {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    borderRight: '2px solid white',
    width: '0ch',
    animation: 'typing 2.5s steps(20, end) forwards, blink 0.7s step-end infinite',
    animationDelay:'4s'
  };

  return (
    <>
      {/* Inline keyframe definitions */}
      <style>
        {`
          @keyframes typing {
            from { width: 0; }
            to { width: 16ch; }
          }
          @keyframes blink {
            50% { border-color: transparent; }
          }
        `}
      </style>

      <AnimatePresence>
        {visible && (
          <motion.div
            className="absolute inset-0 z-50 flex items-start justify-center pt-[20%] pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
          >
            <motion.div
              style={typingStyle}
              className="text-white text-4xl sm:text-6xl font-bold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
            >
              👋 Let's Code
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default LandingPage;
