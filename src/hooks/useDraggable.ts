import { useState, useEffect, useCallback, RefObject } from 'react';

interface Position {
    x: number;
    y: number;
}

export function useDraggable(initialPosition: Position = { x: 0, y: 0 }) {
    const [position, setPosition] = useState(initialPosition);
    const [isDragging, setIsDragging] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });

    const handleMouseDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        // Only allow dragging from header/handle elements (or if no handle specified, the whole element)
        // For this simple hook, we'll assume the event is passed from the handle
        setIsDragging(true);

        // Check if it's a touch or mouse event
        const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

        setOffset({
            x: clientX - position.x,
            y: clientY - position.y
        });

        // Prevent default to avoid scrolling on touch
        if ('touches' in e) {
            //   e.preventDefault(); // Sometimes problematic with clicks, handle carefully
        }
    }, [position]);

    const handleMouseMove = useCallback((e: MouseEvent | TouchEvent) => {
        if (!isDragging) return;

        const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;

        setPosition({
            x: clientX - offset.x,
            y: clientY - offset.y
        });
    }, [isDragging, offset]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleMouseMove, { passive: false });
            window.addEventListener('touchend', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleMouseMove);
            window.removeEventListener('touchend', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleMouseMove);
            window.removeEventListener('touchend', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    return { position, handleMouseDown, isDragging };
}
