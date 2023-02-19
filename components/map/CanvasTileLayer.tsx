import { useEffect, useRef } from 'react';
import L, { Draggable } from 'leaflet';

interface CanvasTileLayerProps {
	url: string; // URL to get tiles
	options: L.TileLayerOptions; // Options for initializing the L.TileLayer object
}

const CanvasTileLayer = ({ url, options }: CanvasTileLayerProps) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const backCanvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		// Create a new Leaflet map and set the view to [y: 0, x: 0] with a zoom level of 1
		const map = L.map('map', {
			zoomControl: false, // Standard zoom control panel
			...options,
		}).setView([60.009, 30.377], 18);

		L.control
			.zoom({
				position: 'topright',
			})
			.addTo(map);
		L.control.scale().addTo(map);

		// Create a new tile layer with the given URL and options and add it to the map
		const tileLayer = L.tileLayer(url, {
			tileSize: 256,
			zoomOffset: 0,
			...options,
		}).addTo(map);

		// Get references to the canvas elements
		const backCanvas = backCanvasRef.current!;
		const canvas = canvasRef.current!;
		const ctx = canvas.getContext('2d')!;
		const backCtx = backCanvas.getContext('2d')!;

		// An array to store the tile images
		const tileImages: HTMLImageElement[] = [];

		// Listen for the 'load' event on the tile layer to get the tile images
		tileLayer.on('load', () => {
			// @ts-ignore
			const tiles = tileLayer.getContainer().getElementsByTagName('img');
			Array.from(tiles).forEach((tile) => {
				const image = new Image();

				// Set the source of the image to the source of the tile image
				image.src = tile.src;

				// When the image has finished loading, add it to the tileImages array
				image.onload = () => {
					tileImages.push(image);

					// If all the tile images have been loaded, draw them onto the backCanvas
					if (tileImages.length === tiles.length) {
						tileImages.forEach((image) => {
							backCtx.drawImage(image, image.x, image.y);
						});
					}
				};
			});
		});

		// When the map has been moved or zoomed, update the canvas elements
		const onMoveEnd = () => {
			const bounds = map.getBounds();
			const topLeft = map.latLngToContainerPoint(bounds.getNorthWest());
			const size = map.getSize();

			L.DomUtil.setPosition(backCanvas, topLeft);

			const zoom = map.getZoom();
			const scale = Math.pow(2, zoom);

			backCanvas.style.width = `${size.x}px`;
			backCanvas.style.height = `${size.y}px`;
			backCanvas.width = size.x * scale;
			backCanvas.height = size.y * scale;

			// For each tile image, check if its bounds intersect with the map bounds
			// If they do, draw the image onto the main canvas at the correct position and size
			tileImages.forEach((image) => {
				const tileBounds = L.latLngBounds(
					map.containerPointToLatLng(
						L.point((image as any).x, (image as any).y)
					),
					map.containerPointToLatLng(
						L.point((image as any).x + 256, (image as any).y + 256)
					)
				);

				if (bounds.intersects(tileBounds)) {
					const x = (image as any).x - topLeft.x * scale;
					const y = (image as any).y - topLeft.y * scale;
					const width = image.width * scale;
					const height = image.height * scale;

					ctx.drawImage(image, x, y, width, height);
				}
			});
		};

		const onZoom = () => {
			onMoveEnd();
		};

		map.on('zoom', onZoom);
		map.on('moveend', onMoveEnd);

		return () => {
			map.remove();
			tileLayer.off('load');
			map.off('zoom', onZoom);
			map.off('moveend', onMoveEnd);
		};
	}, [url, options]);

	return (
		<div id="map">
			<canvas ref={backCanvasRef} id="backCanvasRef" />
			<canvas ref={canvasRef} id="canvasRef" />
		</div>
	);
};

export default CanvasTileLayer;
