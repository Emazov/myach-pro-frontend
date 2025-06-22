import React, { useState, useEffect, useRef } from 'react';
import { imageService } from '../api/imageService';
import { useTelegram } from '../hooks/useTelegram';
import {
	createPlayerImagePlaceholder,
	createClubLogoPlaceholder,
} from '../utils/imageUtils';

interface OptimizedImageProps {
	fileKey?: string | null;
	alt: string;
	className?: string;
	width?: number;
	height?: number;
	fallbackType?: 'player' | 'club';
	fallbackName?: string;
	quality?: number;
	format?: 'webp' | 'jpeg' | 'png';
	lazy?: boolean;
	onLoad?: () => void;
	onError?: () => void;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
	fileKey,
	alt,
	className = '',
	width,
	height,
	fallbackType = 'player',
	fallbackName = '',
	quality = 80,
	format = 'webp',
	lazy = true,
	onLoad,
	onError,
}) => {
	const { initData } = useTelegram();
	const [imageSrc, setImageSrc] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [hasError, setHasError] = useState(false);
	const [isInView, setIsInView] = useState(!lazy);
	const imgRef = useRef<HTMLImageElement>(null);
	const observerRef = useRef<IntersectionObserver | null>(null);

	// Intersection Observer для lazy loading
	useEffect(() => {
		if (!lazy || isInView) return;

		observerRef.current = new IntersectionObserver(
			([entry]) => {
				if (entry?.isIntersecting) {
					setIsInView(true);
					observerRef.current?.disconnect();
				}
			},
			{ threshold: 0.1 },
		);

		if (imgRef.current) {
			observerRef.current.observe(imgRef.current);
		}

		return () => {
			observerRef.current?.disconnect();
		};
	}, [lazy, isInView]);

	// Загрузка оптимизированного URL
	useEffect(() => {
		if (!isInView || !fileKey || !initData) {
			if (!fileKey) {
				// Сразу показываем fallback если нет fileKey
				setIsLoading(false);
				setHasError(true);
			}
			return;
		}

		let isCancelled = false;

		const loadOptimizedImage = async () => {
			try {
				setIsLoading(true);
				setHasError(false);

				const optimizedUrl = await imageService.getOptimizedUrl(
					initData,
					fileKey,
					{ width, height, format, quality },
				);

				if (!isCancelled) {
					if (optimizedUrl) {
						setImageSrc(optimizedUrl);
					} else {
						setHasError(true);
					}
				}
			} catch (error) {
				console.error('Ошибка загрузки оптимизированного изображения:', error);
				if (!isCancelled) {
					setHasError(true);
				}
			} finally {
				if (!isCancelled) {
					setIsLoading(false);
				}
			}
		};

		loadOptimizedImage();

		return () => {
			isCancelled = true;
		};
	}, [isInView, fileKey, initData, width, height, format, quality]);

	const handleImageLoad = () => {
		setIsLoading(false);
		setHasError(false);
		onLoad?.();
	};

	const handleImageError = () => {
		setIsLoading(false);
		setHasError(true);
		onError?.();
	};

	// Создаем fallback изображение
	const getFallbackSrc = () => {
		if (fallbackType === 'club') {
			return createClubLogoPlaceholder(
				fallbackName || alt,
				width || 24,
				height || 24,
			);
		}
		return createPlayerImagePlaceholder(
			fallbackName || alt,
			width || 32,
			height || 42,
		);
	};

	const displaySrc = hasError ? getFallbackSrc() : imageSrc;

	return (
		<div className={`relative ${className}`}>
			{isLoading && isInView && (
				<div
					className='absolute inset-0 bg-gray-200 animate-pulse rounded'
					style={{ width: width || '100%', height: height || '100%' }}
				/>
			)}

			<img
				ref={imgRef}
				src={displaySrc || undefined}
				alt={alt}
				className={`
					${isLoading ? 'opacity-0' : 'opacity-100'} 
					transition-opacity duration-300
					${className}
				`}
				width={width}
				height={height}
				onLoad={handleImageLoad}
				onError={handleImageError}
				loading={lazy ? 'lazy' : 'eager'}
				decoding='async'
			/>
		</div>
	);
};

export default OptimizedImage;
