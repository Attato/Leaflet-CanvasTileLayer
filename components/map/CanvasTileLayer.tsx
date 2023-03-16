'use strict';

import L from 'leaflet';

class CanvasTileLayer extends L.TileLayer {
	readonly tileSize: L.Point;
	readonly canvas: HTMLCanvasElement;
	readonly ctx: CanvasRenderingContext2D | null;
	geoPositionBeforeZoom: L.LatLng | undefined;

	constructor(urlTemplate: string, options?: L.TileLayerOptions) {
		super(urlTemplate, options);

		this.tileSize = this.getTileSize();
		this.canvas = L.DomUtil.create('canvas', 'leaflet-tile-pane');
		this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

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

			this.ctx?.drawImage(
				// @ts-ignore
				tile,
				pos.x,
				pos.y,
				this.tileSize.x,
				this.tileSize.y
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

		const bounds = map.getPixelBounds();

		map.on('zoomstart', () => {
			const currentBounds = map.getPixelBounds();

			if (currentBounds.min) {
				this.geoPositionBeforeZoom = this._map.layerPointToLatLng(
					currentBounds.min
				);
			}

			return this;
		});

		const scale = map.options.crs?.scale(map.getZoom());

		console.log(scale);

		map.on('zoomend', () => {
			const currentBounds = map.getPixelBounds();
			const layerPositionBeforeZoom = this._map.latLngToLayerPoint(
				this.geoPositionBeforeZoom!
			);

			console.log(map.unproject(layerPositionBeforeZoom, map.getZoom()));

			let deltaX: number = 0;
			let deltaY: number = 0;

			if (currentBounds.min) {
				deltaX = Math.floor(currentBounds.min.x - layerPositionBeforeZoom.x);
				deltaY = Math.floor(currentBounds.min.y - layerPositionBeforeZoom.y);

				console.log(`deltaX: ${deltaX}, deltaY: ${deltaY}`);
			}

			const newScale = map.options.crs?.scale(map.getZoom());
			const deltaScale = newScale! / scale!;
			console.log(deltaScale);

			L.DomUtil.setPosition(this.canvas, new L.Point(deltaX, deltaY));

			const imageData = this.ctx?.getImageData(
				0,
				0,
				this.canvas.width,
				this.canvas.height
			);

			this.ctx?.putImageData(imageData!, -deltaX!, -deltaY);
			// надо понять, как использовать crs scale, и потом добавить два значения в putimagedata
		});

		map.on('moveend', () => {
			const newBounds = map.getPixelBounds();

			let deltaX: number = 0;
			let deltaY: number = 0;

			if (newBounds.min && bounds.min) {
				deltaX = Math.floor(newBounds.min.x - bounds.min.x);
				deltaY = Math.floor(newBounds.min.y - bounds.min.y);
			}

			L.DomUtil.setPosition(this.canvas, new L.Point(deltaX, deltaY));

			const imageData = this.ctx?.getImageData(
				0,
				0,
				this.canvas.width,
				this.canvas.height
			);

			this.ctx?.putImageData(imageData!, -deltaX, -deltaY);

			for (const tile of Object.values(this._tiles)) {
				// @ts-ignore
				const pos = this._getTilePos(tile.coords);
				this.ctx?.drawImage(
					tile.el as HTMLImageElement,
					pos.x - deltaX,
					pos.y - deltaY,
					this.tileSize.x,
					this.tileSize.y
				);
			}
		});

		return this;
	}
}

export default CanvasTileLayer;
