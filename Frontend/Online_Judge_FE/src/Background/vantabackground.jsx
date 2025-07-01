import { useEffect, useRef, useState } from "react";

const VantaDots = () => {
  const vantaRef = useRef(null);
  const [vantaEffect, setVantaEffect] = useState(null);

  useEffect(() => {
    if (!vantaEffect && window.VANTA && window.THREE) {
      const effect = window.VANTA.DOTS({
        el: vantaRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        color: 0xffffff,
        backgroundColor: 0x000000,
        size: 3.5,
        spacing: 42.0,
        showLines: false,
      });

      setVantaEffect(effect);
    }

    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  return <div ref={vantaRef} className="fixed top-0 left-0 w-full h-full -z-10" />;
};

export default VantaDots;
