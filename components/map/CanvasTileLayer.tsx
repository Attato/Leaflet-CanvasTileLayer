'use strict';

import L from 'leaflet';

class CanvasTileLayer extends L.TileLayer {
	readonly tileSize: L.Point;
	readonly canvas: HTMLCanvasElement;
	readonly ctx: CanvasRenderingContext2D | null;
	geoPositionBeforeZoom: L.LatLng | undefined;
	imageData: ImageData | undefined;
	srcPos: L.Point;

	constructor(urlTemplate: string, options?: L.TileLayerOptions) {
		super(urlTemplate, options);

		this.tileSize = this.getTileSize();
		this.canvas = L.DomUtil.create('canvas', 'leaflet-tile-pane');
		this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
		this.srcPos = new L.Point(0, 0);

		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
	}

	createTile(coords: L.Coords, done: L.DoneCallback): HTMLImageElement {
		const tile = super.createTile(coords, done) as HTMLImageElement;
		tile.crossOrigin = 'Anonymous';
		const url = this.getTileUrl(coords);

		this.canvasRedraw(tile, url, coords);

		return tile;
	}

	private canvasRedraw(tile: HTMLImageElement, url: string, coords: L.Coords) {
		// @ts-ignore
		const pos = this._getTilePos(coords);

		tile.onload = () => {
			// delete the original tile that was created with createTile
			this.removeTileElement(tile);
			const posCanvas = L.DomUtil.getPosition(this.canvas);
			this.srcPos = this._map.latLngToLayerPoint(
				// @ts-ignore
				this._map.unproject(this._level.origin),
			);

			this.ctx?.drawImage(
				tile,
				pos.x - posCanvas.x + this.srcPos.x,
				pos.y - posCanvas.y + this.srcPos.y,
				this.tileSize.x,
				this.tileSize.y,
			);
		};

		tile.onerror = () => {
			console.log(`Failed to load tile: ${url}`);
		};
	}

	removeTileElement(tile: HTMLElement) {
		tile.parentNode?.removeChild(tile);
	}

	onAdd(map: L.Map): this {
		super.onAdd(map);

		this.getPane()?.appendChild(this.canvas);

		map.on('zoomstart', () => {
			const currentBounds = map.getPixelBounds();

			this.canvas.style.opacity = '0';
			this.canvas.style.transition = 'opacity 0.5s ease-in-out';

			if (currentBounds.min) {
				this.geoPositionBeforeZoom = this._map.layerPointToLatLng(
					currentBounds.min,
				);
			}

			const imageData = this.ctx?.getImageData(
				0,
				0,
				this.canvas.width,
				this.canvas.height,
			);

			this.imageData = imageData;
			this.canvas.classList.add('leaflet-zoom-anim');
		});

		map.on('zoomend', () => {
			this.canvas.classList.remove('leaflet-zoom-anim');
			this.canvas.style.opacity = '1';
		});

		map.on('moveend', () => {
			const containerPointToLatLng = map.containerPointToLayerPoint([0, 0]);

			L.DomUtil.setPosition(this.canvas, containerPointToLatLng);

			const pos = L.DomUtil.getPosition(this.canvas);

			const imageData = this.ctx?.getImageData(
				0,
				0,
				this.canvas.width,
				this.canvas.height,
			);

			this.ctx?.putImageData(
				imageData!,
				pos.x - containerPointToLatLng.x,
				pos.y - containerPointToLatLng.y,
			);

			for (const tile of Object.values(this._tiles)) {
				// @ts-ignore
				const pos = this._getTilePos(tile.coords);
				this.ctx?.drawImage(
					tile.el as HTMLImageElement,
					pos.x - containerPointToLatLng.x + this.srcPos.x,
					pos.y - containerPointToLatLng.y + this.srcPos.y,
					this.tileSize.x,
					this.tileSize.y,
				);
			}
		});

		return this;
	}
}

export default CanvasTileLayer;
