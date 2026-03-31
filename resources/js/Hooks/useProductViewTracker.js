import { useEffect } from 'react';
import axios from 'axios';

export const useProductViewTracker = (productId) => {
    useEffect(() => {
        if (productId) {
            trackView();
        }
    }, [productId]);

    const trackView = async () => {
        try {
            await axios.post(`/api/recommendations/track-view/${productId}`);
        } catch (error) {
            console.error('Error tracking product view:', error);
        }
    };
};

export default useProductViewTracker;
