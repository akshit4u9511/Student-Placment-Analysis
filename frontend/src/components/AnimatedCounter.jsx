import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

export default function AnimatedCounter({ value, duration = 1500, prefix = '', suffix = '', decimals = 0 }) {
    const [displayValue, setDisplayValue] = useState(0);
    const ref = useRef(null);
    const startTime = useRef(null);
    const animFrameRef = useRef(null);

    useEffect(() => {
        const target = Number(value) || 0;
        startTime.current = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime.current;
            const progress = Math.min(elapsed / duration, 1);
            // Ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplayValue(eased * target);

            if (progress < 1) {
                animFrameRef.current = requestAnimationFrame(animate);
            }
        };

        animFrameRef.current = requestAnimationFrame(animate);
        return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
    }, [value, duration]);

    return (
        <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="tabular-nums"
        >
            {prefix}{displayValue.toFixed(decimals)}{suffix}
        </motion.span>
    );
}
